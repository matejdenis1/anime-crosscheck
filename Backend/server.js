const express = require("express");
const crossCheck = require("./service/crossCheck")
const cors = require('cors')
const cron = require('node-cron')
const cookieParser = require('cookie-parser')
const {syncDb} = require('./service/animes')
const episodeNotifier = require('./service/users/episodeNotifier')
const { getUserById,verifyToken} = require("./middleware/user");
const { setDefaultResultOrder } = require("dns");
const rateLimit = require('express-rate-limit');
setDefaultResultOrder('ipv4first')


//Konfigurace rate limiteru pro omezení počtu požadavků z jedné IP adresy během 15 minutového okna.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 500, // omezí každou IP na 500 požadavků za dané okno
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true, 
  legacyHeaders: false,
});

const { connect: connectDb, seedDemoUsers } = require('./config/db');
connectDb()
  .then(() => console.log("[server] Connection was Successful"))
  .catch((err) => console.log("[server] Connection failed:", err))

const app = express()
const PORT = process.env.PORT || 8000;


// Middlewary třetích strán pro zpracování cookies, CORS a JSON těla požadavků
app.use(cookieParser())
app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE']
}))
app.use(express.json())
app.use('/api/', limiter);


//Napojení všech rout na Express aplikaci
const routes = require("./routes/index");
app.use(routes);

app.listen(PORT, () => {
  console.log("[server] Running on port " + PORT);
});


const updateDb = async () => {
  await crossCheck.getAnimes()
  await syncDb();
  await episodeNotifier.rebuildQueue();
  console.log('[server] Updating completed!')
}


//Endpoint pro manuální spuštění aktualizace databáze, přístupný pouze pro uživatele s rolí "moderator"
app.post("/api/database/update", verifyToken, getUserById, async (req,res) => {
  try{
    const user = req.user;
    if(user.type !== 'moderator') return res.status(403).json({message: 'Access denied!'})
    await updateDb()
    res.status(200).json({message: 'Database is up-to-date!'})
  } catch(err){
    console.error('[server] Database update failed:', err)
    res.status(500).json({message: err.message})
  }
})

//Update databáze nastavený na každý den v 00:00
cron.schedule('0 0 * * *', async () => {
  try{
    await updateDb();
  } catch(err){
    console.error('Schedule fetch failed ', err)
  }
})
//Iniciální start serveru a aktualizace databáze
const serverStart = async () => {
  try{
    await updateDb();
    await seedDemoUsers();
  } catch(err){
    console.error('Initial fetch failed ', err)
  }
}

serverStart();
