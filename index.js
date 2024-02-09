const express = require("express"),
  server = express(),
  router = express.Router(),
  session = require("express-session"),
  mongoose = require("mongoose"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  cors = require("cors"),
  __basedir = __dirname + "/";
require("dotenv").config();

// const APPNAME = process.env.APPNAME,
  PORT = process.env.PORT,
  DATABASE_URL = process.env.DATABASE_URL;

server.use(cors());
server.use(bodyParser.json({ limit: "6mb" }));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(logger("dev"));
server.use(express.json());
server.use(
  express.urlencoded({
    extended: false,
  })
);
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

server.use("/api/v1", router);

process.on("uncaughtException", (err) => {
  console.error("<<<<<----- Error in Omega development ----->>>", err);
  process.exit(1);
});

const ser = server.listen(PORT, (err, res) => {
  if (err) {
    console.log(`\n Server error on ${PORT} \n`);
  } else {
    console.log(`Server up \nRunning on ${PORT}`);
    mongoose.set("strictQuery", false);
    mongoose.connect(DATABASE_URL, {useNewUrlParser: true,useUnifiedTopology: true}).then((res) => {
        console.log("DB Connected!");
        require("./app/routers/healthcheck")(router);
        require("./app/routers/admin/users")(router);
        console.log(`Server is listening on port ${PORT}`);
      })
      .catch((err) => {
        console.log("Error while conecting db---->", err);
      });
  }
});

ser.setTimeout(500000);
