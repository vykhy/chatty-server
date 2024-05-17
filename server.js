import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { createServer } from "http";
import sequelize from "./db.js";
import { Server } from "socket.io";

import userRouter from "./routers/userRouter.js";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/users", userRouter);

const httpServer = createServer(app);

const socket = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

socket.on("connection", (io) => {
  console.log("Socket just connected");

  io.on("disconnect", () => {
    console.log("Socket just disconnected");
  });
});

app.listen(PORT, async () => {
  console.log("Server running on port: " + PORT);
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
});
