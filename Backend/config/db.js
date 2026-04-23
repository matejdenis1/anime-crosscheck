const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../mongoose/schemas/user');
const Animes = require('../mongoose/schemas/animes');
const Comment = require('../mongoose/schemas/comment');

let memoryServer;

const CZECH_RATINGS = [
  { message: 'Naprostá pecka, doporučuji!', rating: 5 },
  { message: 'Kreslení je moc pěkný, příběh mě bavil.', rating: 4 },
  { message: 'Nic moc, čekal jsem víc.', rating: 2 },
  { message: 'Skvělá atmosféra, hudba parádní.', rating: 5 },
  { message: 'Dobrý, ale tempo je místy pomalé.', rating: 3 },
  { message: 'Jeden z nejlepších, co jsem viděl.', rating: 5 },
  { message: 'Postavy mi přišly dost ploché.', rating: 2 },
  { message: 'Zamiloval jsem si tenhle vesmír.', rating: 5 },
  { message: 'Konec mě hodně zklamal.', rating: 2 },
  { message: 'Solidní, ale nic převratného.', rating: 3 },
  { message: 'Nádhera, dojalo mě to.', rating: 5 },
  { message: 'Chtělo by to víc akce.', rating: 3 }
];

// Použití Fisher-Yatesova algoritmu pro náhodné zamíchání pole a výběr prvků.
const pickRandom = (arr, count) => {
    let copy = [...arr]
    for (let i = arr.length - 1; i > 0; i--)
    {
        let j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}



// Připojení k in-memory MongoDB databázi
const connect = async () => {
  memoryServer = await MongoMemoryServer.create();
  console.log('[db] Using in-memory MongoDB at', memoryServer.getUri());
  await mongoose.connect(memoryServer.getUri());
  return mongoose.connection;
};

// Vytvoření uživatelů pro naplnění in-memory databáze
const seedDemoUsers = async () => {

  const availableAnimes = await Animes.find({
    $or: [{ verified: true }, { manualVerification: true }]
  }).select('id title').lean();
  if (availableAnimes.length === 0) return;

  const hash = await argon2.hash('Demo123');
  const avatarData = fs.readFileSync(path.join(process.cwd(), 'misc', 'pfp_placeholder.png'));
  const avatar = { data: avatarData, contentType: 'image/png' };

  // Vytvoří tři demo uživatele s různými oblíbenými anime a nastavením soukromí.
  const aliceAnimes = pickRandom(availableAnimes, 6);
  const alice = await User.create({
    type: 'user',
    profileId: '@alice',
    email: 'alice@local.cz',
    username: 'Alice',
    hash,
    animes: aliceAnimes.map(a => a.id),
    private: false,
    avatar,
  });

  const bobAnimes = pickRandom(availableAnimes, 4);
  const bob = await User.create({
    type: 'user',
    profileId: '@bob',
    email: 'bob@local.cz',
    username: 'Bob',
    hash,
    animes: bobAnimes.map(a => a.id),
    private: true,
    avatar,
  });

  const charlieAnimes = pickRandom(availableAnimes, 5);
  const charlie = await User.create({
    type: 'user',
    profileId: '@charlie',
    email: 'charlie@local.cz',
    username: 'Charlie',
    hash,
    animes: charlieAnimes.map(a => a.id),
    private: false,
    avatar,
  });

  //Vytváří defaultního moderátora, aby bylo možné testovat moderátorské funkce.
  await User.create({
    type: 'moderator',
    profileId: '@moderator',
    email: 'mod@local.cz',
    username: 'Moderator',
    hash: await argon2.hash("Moderator123"),
    animes: [],
    private: false,
    avatar: { data: avatarData, contentType: 'image/png' },
  });

  // Vytvoří komentáře podle oblíbených anime a zajistí, aby nebyli duplicitní pomocí fronty
  const ratingQueue = pickRandom(CZECH_RATINGS, CZECH_RATINGS.length);
  const createRatings = (user, picks, count) => {
    const animes = pickRandom(picks, count);
    return animes.map(a => {
      const entry = ratingQueue.shift();
      return {
        animeId: a.id,
        animeName: a.title,
        user: user._id,
        message: entry.message,
        rating: entry.rating,
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)),
      };
    });
  };




  // Vytvoří komentáře pro každého uživatele a zajistí, 
  // aby nebyly duplicitní pomocí fronty
  await Comment.insertMany([
    ...createRatings(alice, aliceAnimes, 3),
    ...createRatings(bob, bobAnimes, 2),
    ...createRatings(charlie, charlieAnimes, 3),
  ]);

  const follow = (follower, target) => Promise.all([
    User.updateOne({ _id: follower._id }, { $addToSet: { follows: target._id } }),
    User.updateOne({ _id: target._id }, { $addToSet: { followers: follower._id } })
  ]);

  await follow(alice, bob);
  await follow(bob, alice);
  await follow(alice, charlie);
  await follow(charlie, alice);

  console.log(`[db] Vytvořen výchozí moderátor - email: 'mod@local.cz'  heslo: 'Moderator123'`);
  console.log('[db] Vytvořeni demo uživatelé: @alice (public), @bob (private), @charlie (public) - heslo: Demo123');
};

const disconnect = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
};

module.exports = { connect, disconnect, seedDemoUsers };
