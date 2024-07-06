import User from "./User.js";
import Chat from "./Chat.js";
import ChatMember from "./ChatMember.js";
import Message from "./Message.js";
import MessageReceipt from "./MessageReceipt.js";

Chat.belongsToMany(User, { through: ChatMember, foreignKey: "chat_id" });
User.belongsToMany(Chat, { through: ChatMember, foreignKey: "user_id" });

Chat.hasMany(ChatMember, { foreignKey: "chat_id", as: "ChatMembers" });
ChatMember.belongsTo(Chat, { foreignKey: "chat_id", as: "Chat" });

// ChatMember.hasOne(User, { foreignKey: "user_id" });
// User.hasMany(ChatMember, { foreignKey: "user_id" });

Chat.hasMany(Message, { foreignKey: "chat_id" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });

User.hasMany(Message, { foreignKey: "user_id" });
Message.belongsTo(User, { foreignKey: "user_id" });

Message.hasMany(MessageReceipt, { foreignKey: "message_id" });
MessageReceipt.belongsTo(Message, { foreignKey: "message_id" });

User.hasMany(MessageReceipt, { foreignKey: "user_id" });
MessageReceipt.belongsTo(User, { foreignKey: "user_id" });

export { User, Chat, ChatMember, Message, MessageReceipt };
