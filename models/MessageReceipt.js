import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Message from "./Message.js";
import User from "./User.js";

const MessageReceipt = sequelize.define(
  "MessageReceipt",
  {
    receipt_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Message,
        key: "message_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "MessageReceipts",
    indexes: [
      {
        unique: true,
        fields: ["message_id", "user_id"],
      },
    ],
  }
);

export default MessageReceipt;
