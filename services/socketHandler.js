import { socket, userIdSocketIdMap, socketIdUserIdMap } from "./../server.js";

export function emitToUser(userId, event, data) {
  const userSocketId = userIdSocketIdMap[userId];
  console.log(userSocketId);
  if (userSocketId) {
    socket.to(userSocketId).emit(event, data);
  }
}
