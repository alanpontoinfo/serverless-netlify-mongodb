// netlify/functions/findByTitle.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
const collectionName = process.env.MONGODB_COLLECTION || 'movies';

// validação simples de env
if (!uri || !dbName) {
  console.error('MONGODB_URI e MONGODB_DB devem estar definidas nas variáveis de ambiente.');
}

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await cachedClient.connect();
  }
  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*', // ajuste conforme sua política de CORS
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  // Suporte para preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({ ok: true }),
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        // body não é JSON — ignoramos
      }
    }

    const title = (qs.title || body.title || '').trim();
    if (!title) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({
          success: false,
          message: 'Parâmetro "title" é obrigatório.',
        }),
      };
    }

    const exact = (qs.exact === 'true' || body.exact === true) || false;
    const limit = Math.min(parseInt(qs.limit || body.limit || '20', 10) || 20, 500);

    // projeção dos campos solicitados
    const projection = {
      _id: 0,            // opcional: remova se quiser o _id
      cast: 1,
      poster: 1,
      title: 1,
      fullplot: 1,
      countries: 1,
      released: 1,
      directors: 1,
      writers: 1,
      awards: 1,
      lastupdated: 1,
      year: 1,
      imdb: 1,
      type: 1,
      tomatoes: 1,
    };

    // constrói query com regex escapado
    const escaped = escapeRegExp(title);
    const query = exact
      ? { title: { $regex: `^${escaped}$`, $options: 'i' } }
      : { title: { $regex: escaped, $options: 'i' } };

    const db = await getDb();
    const collection = db.collection(collectionName);

    const cursor = collection.find(query).project(projection).limit(limit);
    const results = await cursor.toArray();

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify({
        success: true,
        count: results.length,
        results,
      }),
    };
  } catch (err) {
    console.error('findByTitle error:', err);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        success: false,
        message: 'Erro interno ao buscar por title',
        error: err.message,
      }),
    };
  }
};
                                                                                                                                                              
