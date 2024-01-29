const mongoose = require('mongoose');
const data = require('./seed-data.json');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27050/library';
const COLLECTIONS = {
  USERS: 'users',
  BOOKS: 'books',
  ROLES: 'userroles',
};
const run = async () => {
  const { users, books, userroles } = data;
  try {
    await mongoose.connect(MONGO_URL);
    const db = mongoose.connection.db;
    // Start from scratch!
    await db.dropDatabase();
    await db.collection(COLLECTIONS.USERS).insertMany(users);
    await db.collection(COLLECTIONS.BOOKS).insertMany(books);
    await db.collection(COLLECTIONS.ROLES).insertMany(userroles);
    await mongoose.connection.close();
    return;
  } catch (error) {
    console.error(error);
  }
};
run();
