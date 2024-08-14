const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));

const users = {};
const messageHistory = [];

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("setUsername", (username) => {
    // TODO: check if user is already loggedin
    users[socket.id] = username;
    io.emit("userList", Object.values(users));
    io.emit("notification", `${username} has joined the chat.`);
    socket.emit("messageHistory", messageHistory);
    socket.emit("userList", Object.values(users));
  });

  socket.on("message", (message) => {
    const fullMessage = { username: users[socket.id], message };
    messageHistory.push(fullMessage);
    if (messageHistory.length > 10) {
      messageHistory.shift();
    }
    io.emit("message", fullMessage);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit("userList", Object.values(users));
      io.emit("notification", `${username} has left the chat.`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000...");
});
