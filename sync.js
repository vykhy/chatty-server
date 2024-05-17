import sequelize from "./db.js";
import {
  User,
  Chat,
  ChatMember,
  Message,
  MessageReceipt,
} from "./models/relationships.js";

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((err) => {
    console.error("Unable to create tables, shutting down...", err);
  });
