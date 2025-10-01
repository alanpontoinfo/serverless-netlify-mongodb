// netlify/functions/get_movies.js
const { MongoClient } = require('mongodb');
require('dotenv').config();
/*const mongoClient = new MongoClient(process.env.MONGODB_URI);

const clientPromise = mongoClient.connect();*/

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE;
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


exports.handler = async (event) => {
try {
const db = await getDb();
const collection = db.collection(collectionName);


// Retorna até 50 títulos (projeção para reduzir payload)
const results = await collection
.find({}, { projection: { _id: 0, title: 1 } })
.limit(50)
.toArray();


// Retornamos o array diretamente (index.html trata ambos os formatos)
return {
statusCode: 200,
body: JSON.stringify(results),
headers: { 'Content-Type': 'application/json' },
};
} catch (err) {
console.error('get_movies error:', err);
return {
statusCode: 500,
body: JSON.stringify({ error: 'Erro ao buscar filmes' }),
headers: { 'Content-Type': 'application/json' },
};
}
};

/*const { MongoClient } = require("mongodb");
require('dotenv').config();

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db(process.env.MONGODB_DATABASE);
        const collection = database.collection(process.env.MONGODB_COLLECTION);
        const results = await collection.find({}).limit(10).toArray();
        return {
            statusCode: 200,
            body: JSON.stringify(results),
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }*/
