import sequelize from "../db.js";
import ChatMember from "../models/ChatMember.js";
import Message from "../models/Message.js";
import MessageReceipt from "../models/MessageReceipt.js";
import { emitToUser } from "./socketHandler.js";

export async function handleNewMessage(data) {
  try {
    const { chat_id, user_id, content } = data;
    const { dataValues: message } = await Message.create({
      chat_id,
      user_id,
      content,
    });
    const users = await ChatMember.findAll({
      where: {
        chat_id,
      },
      attributes: ["user_id"],
    });

    message.delivered_at = null;
    message.read_at = null;

    users.forEach((user) => {
      emitToUser(user.user_id, "new-message", message);
    });
  } catch (error) {
    console.log(error.message);
  }
}
export async function handleMessageDelivered(data) {
  const { message_id, chat_id, user_id } = data;
  const transaction = await sequelize.transaction();
  try {
    let messageReceipt;

    const [receiptExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM MessageReceipts 
      WHERE message_id = :message_id AND user_id = :user_id
      FOR UPDATE
      `,
      { replacements: { user_id, message_id }, transaction }
    );

    if (receiptExists[0].count > 0) {
      await MessageReceipt.update(
        { delivered_at: new Date() },
        { where: { message_id, user_id }, transaction }
      );
      messageReceipt = await MessageReceipt.findOne({
        where: { message_id, user_id },
        transaction,
      });
    } else {
      messageReceipt = await MessageReceipt.create(
        { message_id, user_id, delivered_at: new Date() },
        { transaction }
      );
    }

    const users = await ChatMember.findAll({
      where: { chat_id },
      attributes: ["user_id"],
      transaction,
    });

    await transaction.commit();

    messageReceipt = { ...messageReceipt.toJSON(), chat_id };

    users.forEach((user) => {
      emitToUser(user.user_id, "message-delivered", messageReceipt);
    });
  } catch (error) {
    await transaction.rollback();
    console.log("deliver error:", error.message);
  }
}

export async function handleMessageRead(data) {
  const { message_id, chat_id, user_id } = data;
  const transaction = await sequelize.transaction();
  try {
    let messageReceipt;

    const [receiptExists] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM MessageReceipts 
      WHERE message_id = :message_id AND user_id = :user_id
      FOR UPDATE
      `,
      { replacements: { user_id, message_id }, transaction }
    );

    if (receiptExists[0].count > 0) {
      await MessageReceipt.update(
        { read_at: new Date() },
        { where: { message_id, user_id }, transaction }
      );
      messageReceipt = await MessageReceipt.findOne({
        where: { message_id, user_id },
        transaction,
      });
    } else {
      messageReceipt = await MessageReceipt.create(
        { message_id, user_id, read_at: new Date() },
        { transaction }
      );
    }

    const users = await ChatMember.findAll({
      where: { chat_id },
      attributes: ["user_id"],
      transaction,
    });

    await transaction.commit();

    messageReceipt = { ...messageReceipt.toJSON(), chat_id };

    users.forEach((user) => {
      emitToUser(user.user_id, "message-read", messageReceipt);
    });
  } catch (error) {
    await transaction.rollback();
    console.log("read error:", error.message);
  }
}
