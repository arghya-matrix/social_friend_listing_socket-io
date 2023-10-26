// const io = require("socket.io")(3000);

const users = {};
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors"); // Import the cors middleware
const app = express();

// Enable CORS for all routes
app.use(cors({ origin: "*" }));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  socket.on("new-user-joined", (user) => {
    console.log(user, "<--user name");
    users[socket.id] = user;
    socket.broadcast.emit("user-joined", user);
  });

  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id]
  });
});

// Rest of your server code...

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
