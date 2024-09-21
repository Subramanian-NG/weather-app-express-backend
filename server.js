require("dotenv").config();
const express = require("express");

const app = express();
const db = require("./config/db");
const bodyParser = require("body-parser");
const cors = require('cors');
//middlewares to parse body form data in URL encoded form and JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const corsOptions = {
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));


const jwt = require("jsonwebtoken");

const authRoutes = require('./api/auth');
const actionRoutes = require('./api/actions');

app.use('/api/auth', authRoutes);
app.use('/api/actions', verifyToken, actionRoutes); //every action API will go through the middleware function verifyToken to proven authorization

const port = process.env.PORT || 8000;


function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader != "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.sendStatus(401);
        return;
      }
      //console.log("token decrypted--",decoded);
      req.decodedUserId = decoded.userId; 
      next();
    });
  } else {
    res.sendStatus(401);
    return;
  }
}

app.get("/", async (req, res) => {
  res.send("<h1> Express Backend server running </h1>");
});


db.initialize(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log("connected to database");
    app.listen(port, () => {
      console.log(`Server started on port: ${port}`);
    });
  })
  .catch((e) => {
    console.log("Error in connecting to database");
    console.error(e);
  });

  module.exports = app;
