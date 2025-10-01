// netlify/functions/findByTitle.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const collectionName = process.env.MONGODB_COLLECTION || 'movies';


let cachedClient = null;
let cachedDb = null;


async function getDb() {
if (cachedDb) return cachedDb;
if (!uri || !dbName) throw new Error('MONGODB_URI e MONGODB_DB não configuradas.');


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
return string.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}


exports.handler = async (event) => {
try {
const qs = event.queryStringParameters || {};
let body = {};
if (event.body) {
try {
body = JSON.parse(event.body);
} catch (e) { /* ignore non-json body */ }
}


const title = (qs.title || body.title || '').trim();
const exact = (qs.exact === 'true' || body.exact === true) || false;
const limit = Math.min(parseInt(qs.limit || body.limit || '20', 10) || 20, 200);
const fieldsParam = qs.fields || body.fields || null;


let projection = {};
if (fieldsParam) {
fieldsParam.split(',').map(f => f.trim()).forEach(f => { if (f) projection[f] = 1; });
} else {
// por padrão, trazer title e _id (padrão)
projection = { title: 1 };
}


const db = await getDb();
const collection = db.collection(collectionName);


let query;
if (!title) {
// sem title, retorna vazio para forçar a UI a usar get_movies (ou poderíamos retornar todos)
return {
statusCode: 400,
body: JSON.stringify({ success: false, message: 'Parâmetro "title" é obrigatório para findByTitle.' }),
headers: { 'Content-Type': 'application/json' },
};
}


};
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
~
findByTitle.js [unix] (04:37 01/10/2025)                                                                                                                                                 0,1 All
-- INSERT --                                                                                                                                                                         
