const { connect, disconnect } = require('./config/db');
const Comment = require('./mongoose/schemas/comment');
const Animes = require('./mongoose/schemas/animes');
const User = require('./mongoose/schemas/user');
require('dotenv').config();

beforeAll(async () => {
  await connect({ useMemory: true });
  await Promise.all([Comment.deleteMany({}), User.deleteMany({}), Animes.deleteMany({})]);
});

afterAll(async () => {
  await Promise.all([Comment.deleteMany({}), User.deleteMany({}), Animes.deleteMany({})]);
  await disconnect();
});
