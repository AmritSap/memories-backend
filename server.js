import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
app.use(cors());

const PORT = 5000;

import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import mongoClient from "./config/db.js";
mongoClient();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.listen(PORT, (error) => {
  error && console.log(error);
  console.log(`Backend server is running at http://localhost:${PORT}`);
});
