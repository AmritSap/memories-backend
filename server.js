import express from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
app.use(cors());

const PORT = 5000;
import cookieParser from "cookie-parser";
app.use(cookieParser());

import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import mongoClient from "./config/db.js";
mongoClient();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);

app.listen(PORT, (error) => {
  error && console.log(error);
  console.log(`Backend server is running at http://localhost:${PORT}`);
});
