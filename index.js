import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { login, register, update } from "./controllers/auth.js";
import moment from "moment/moment.js";
import { createCheckoutSession } from "./controllers/stripe.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.post("/login", login);
app.post("/register", register);
app.put("/update", update);
app.post("/api/checkout", createCheckoutSession);

const Port = process.env.PORT;
mongoose
  .connect(process.env.MONGODB_URL, {})
  .then(() => {
    app.listen(Port, () => console.log(`Server running on port: ${Port}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
