import sequelize from "../db.js";
import Chat from "./../models/Chat.js";
import ChatMember from "./../models/ChatMember.js";
import { emitToUser } from "../services/socketHandler.js";
import User from "../models/User.js";

export async function createChat(req, res) {
  const userId1 = req.user.user_id;
  const userId2 = req.body.userId;

  try {
    const [chatExists] = await sequelize.query(
      `
    SELECT C.chat_id, COUNT(*) AS count
    FROM (
        SELECT A.chat_id, COUNT(*) AS user_count
        FROM ChatMembers AS A
        INNER JOIN Chats AS B ON A.chat_id = B.chat_id
        WHERE B.is_group = FALSE
        AND A.user_id IN (?, ?)
        GROUP BY A.chat_id
    ) AS C
    WHERE C.user_count = 2;
  `,
      {
        replacements: [userId1, userId2],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (chatExists.count > 0) {
      throw new Error("Chat already exists");
    }
    const chat = await Chat.create({ name: null, is_group: false });

    await ChatMember.bulkCreate([
      { chat_id: chat.chat_id, user_id: userId1 },
      { chat_id: chat.chat_id, user_id: userId2 },
    ]);

    const user1 = await User.findOne({
      where: {
        user_id: userId1,
      },
      attributes: ["user_id", "username", "email", "profile_picture"],
    });
    const user2 = await User.findOne({
      where: {
        user_id: userId2,
      },
      attributes: ["user_id", "username", "email", "profile_picture"],
    });

    const obj1 = {
      chat_id: chat.chat_id,
      user_id: userId2,
      profile_picture: user2.profile_picture,
      email: user2.email,
      username: user2.user_name,
      messages: [],
      page: 1,
      is_group: false,
      created_at: chat.dataValues.createdAt,
    };
    const obj2 = {
      chat_id: chat.chat_id,
      user_id: userId1,
      profile_picture: user1.profile_picture,
      email: user1.email,
      username: user1.user_name,
      messages: [],
      page: 1,
      is_group: false,
      created_at: chat.dataValues.createdAt,
    };

    emitToUser(userId1, "chat-created", obj1);
    emitToUser(userId2, "chat-created", obj2);

    res.status(200).json({ chat_id: chat.chat_id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getChats(req, res) {
  const userId = req.user.user_id;
  try {
    const [chats] = await sequelize.query(
      `
     SELECT A.chat_id, A.is_group, B.user_id, C.username, C.email, C.profile_picture, 1 as page,
       IFNULL(
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'message_id', D.message_id,
                    'user_id', D.user_id,
                    'created_at', D.createdAt,
                    'content', D.content
                )
            )
            FROM Messages D 
            WHERE D.chat_id = A.chat_id 
            ORDER BY D.createdAt 
            LIMIT 50
        ), 
        JSON_ARRAY()
       ) AS messages
      FROM Chats A 
      INNER JOIN ChatMembers B ON B.chat_id = A.chat_id 
      INNER JOIN Users C ON C.user_id = B.user_id 
      WHERE A.chat_id IN (
        SELECT chat_id 
        FROM ChatMembers 
        WHERE user_id = :userId
      )
      AND C.user_id != :userId
    `,
      {
        replacements: { userId },
      }
    );
    chats.forEach((chat) => {
      chat.messages = JSON.parse(chat.messages);
    });
    return res.status(200).json({ chats });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "There was an error", error: error.message });
  }
}
