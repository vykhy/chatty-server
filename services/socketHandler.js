import { socket, userIdSocketIdMap } from "./../server.js";

export function emitToUser(userId, event, data) {
  const userSocketIds = userIdSocketIdMap[userId];
  if (userSocketIds) {
    userSocketIds.forEach((socketId) => {
      socket.to(socketId).emit(event, data);
    });
  }
}
