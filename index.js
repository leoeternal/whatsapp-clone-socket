const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  const findUser = users.find((user) => user.userId === userId);
  if (findUser === undefined) {
    users.push({
      userId,
      socketId,
    });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => {
    return user.socketId !== socketId;
  });
};

const removeUserByUserId = (userId) => {
  users = users.filter((user) => {
    return user.userId !== userId;
  });
};

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    addUser(userId, socket.id);
    io.emit("get-users", users);
  });

  socket.on("send-message-to-sender", (data) => {
    const sentUser = users.find((user) => user.userId === data.senderId);
    io.to(sentUser.socketId).emit("receive-message", {
      text: data.text,
      senderId: data.senderId,
      conversationId: data.conversationId,
    });
  });

  socket.on("send-message-to-receiver", (data) => {
    const receivedUser = users.find((user) => user.userId === data.receiverId);
    if (receivedUser !== undefined) {
      io.to(receivedUser.socketId).emit("receive-message", {
        text: data.text,
        senderId: data.senderId,
        conversationId: data.conversationId,
      });
    }
  });

  socket.on("remove-user", (userId) => {
    removeUserByUserId(userId);
    io.emit("get-users", users);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);

    io.emit("get-users", users);
  });
});
