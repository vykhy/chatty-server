import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { createServer } from "http";
import sequelize from "./db.js";
import { Server } from "socket.io";

import userRouter from "./routers/userRouter.js";
import chatRouter from "./routers/chatRouter.js";
import {
  handleMessageDelivered,
  handleMessageRead,
  handleNewMessage,
} from "./services/messageService.js";

export const userIdSocketIdMap = {};
export const socketIdUserIdMap = {};

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/users", userRouter);
app.use("/chat", chatRouter);
app.use("/", (req, res) => {
  return res.sendStatus(200);
});

const httpServer = createServer(app);

export const socket = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

socket.use((socket, next) => {
  if (socket.handshake && socket.handshake.query.user_id) {
    const userId = socket.handshake.query.user_id;

    socketIdUserIdMap[socket.id] = userId;
    if (userIdSocketIdMap[userId]) {
      userIdSocketIdMap[userId].push(socket.id);
    } else {
      userIdSocketIdMap[socket.handshake.query.user_id] = [socket.id];
    }
  }
  next();
});

socket.on("connection", (io) => {
  console.log("Socket just connected");

  io.on("send-message", (data) => {
    handleNewMessage(data);
  });

  io.on("message-delivered", (data) => {
    handleMessageDelivered(data);
  });
  io.on("message-read", (data) => {
    handleMessageRead(data);
  });

  io.on("disconnect", () => {
    const userId = socketIdUserIdMap[io.id];
    console.log("Disconnecting user " + userId);
    delete socketIdUserIdMap[io.id];
    if (userId) {
      if (
        userIdSocketIdMap[userId].filter((socketId) => socketId !== io.id)
          .length > 0
      ) {
        userIdSocketIdMap[userId] = userIdSocketIdMap[userId].filter(
          (socketId) => socketId !== io.id
        );
      } else {
        delete userIdSocketIdMap[userId];
      }
    }
  });
});

httpServer.listen(PORT, async () => {
  console.log("Server running on port: " + PORT);
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
});
