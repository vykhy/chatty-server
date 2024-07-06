import ChatMember from "../models/ChatMember.js";
import Message from "../models/Message.js";
import { emitToUser } from "./socketHandler.js";

export async function handleNewMessage(data) {
  const { chatId, userId, content } = data;
  const { dataValues: message } = await Message.create({
    chat_id: chatId,
    user_id: userId,
    content,
  });
  console.log(message);
  const users = await ChatMember.findAll({
    where: {
      chat_id: chatId,
    },
    attributes: ["user_id"],
  });
  console.log(users);
  users.forEach((user) => {
    emitToUser(user.user_id, "new-message", message);
  });
}
