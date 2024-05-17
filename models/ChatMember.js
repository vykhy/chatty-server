import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";
import Chat from "./Chat.js";

const ChatMember = sequelize.define(
  "ChatMember",
  {
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Chat,
        key: "chat_id",
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
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "ChatMembers",
  }
);

export default ChatMember;
