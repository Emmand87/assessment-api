const mongoose = require('mongoose');

let connected = false;

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB] MONGODB_URI non impostata: funzionamento in memoria (DEV MODE).');
    return null;
  }
  if (connected) return mongoose.connection;
  await mongoose.connect(uri, { dbName: 'recruiting_assessment' });
  connected = true;
  console.log('[DB] Connesso a MongoDB Atlas');
  return mongoose.connection;
}

module.exports = { connect };
