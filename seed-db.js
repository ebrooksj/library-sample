const mongoose = require('mongoose');
const data = require('./seed-data.json');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27050/library';
// This is obviously not a great way to seed the database, but should suffice for the demo purposes
const run = async () => {
  const { users, books, roles } = data;
  mongoose.connect('', {});
};
