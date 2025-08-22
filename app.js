require("./db/mongoDB");
const port = 5000;
const userRouter = require("./router/user.router");
const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const app = express();
const onlineUsers = {};
const room = {};
const fs = require("fs");
const db = require("./models/index");

app.use(cors({ origin: "*" }));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8,
});

// app.use((req, res, next) => {
//   console.log(`Method: ${req.method}, ip: ${req.ip}, path: ${req.path}`);
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/log-in.html"));
});
app.use("/", express.static(path.join(__dirname, "html")));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/image", express.static(path.join(__dirname, "image")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
console.log(path.join(__dirname, "js"));

app.use("/user", userRouter);

io.on("connection", (socket) => {
  socket.on("online", (user_id) => {
    onlineUsers[user_id] = socket.id;
    console.log("Socket id", socket.id, user_id);
    const keysAsIntegers = Object.keys(onlineUsers).map(Number);
    socket.emit("status", { status: true, user_id: keysAsIntegers });
  });

  socket.on("private-room", (con_id, sender_name) => {
    socket.join(`room-${con_id}`);
    room[con_id] = socket.id;
    console.log("save to room", room);
    socket.to(`room-${con_id}`).emit("user-joined", sender_name);
  });

  socket.on(
    "send",
    async (sender_name, user_id, con_id, friend_id, message) => {
      io.to(`room-${con_id}`).emit("receive", {
        sender_name: sender_name,
        message: message,
      });
      const keysAsIntegers = Object.keys(onlineUsers).map(Number);
      socket.broadcast.emit("new-message", {
        user_id,
        friend_id,
        keysAsIntegers,
      });
      console.log("Event Emitted");
      const chat = new db.Message({
        sender_id: user_id,
        receiver_id: friend_id,
        con_id: con_id,
        message: message,
        messageType: "Text",
      });
      await chat.save();
    }
  );

  socket.on(
    "image",
    async (sender_name, user_id, con_id, friend_id, imageData, type) => {
      console.log(room, "Saved rooms");
      const regex = /\/([^/]+)$/;
      const match = type.match(regex);
      let extension = match[1];
      console.log("extension", extension);

      const filename = Date.now() + "." + extension;
      const imagePath = path.join(__dirname, "/public/images", filename);
      // const con_id = Object.keys(room).find((key) => room[key] === socket.id);
      const result = imageData.replace(
        /^data:(image|application)\/(png|jpeg|jpg|gif|pdf);base64,/,
        ""
      );
      const imageBuffer = Buffer.from(result, "base64");
      console.log("Buffer", imageBuffer);
      const imageDirectory = path.join(__dirname, "public/images");
      console.log("Length of imageData:", imageData.length);
      console.log("Size of saved image:", imageBuffer.length);
      console.log("Path Of Image", imagePath);
      if (!fs.existsSync(imageDirectory)) {
        fs.mkdirSync(imageDirectory, { recursive: true });
      }
      fs.writeFile(imagePath, imageBuffer, async (err) => {
        if (err) {
          console.error("Error saving image:", err);
        } else {
          const imageUrl = `http://localhost:3000/images/${filename}`;
          console.log(con_id, imageUrl, "Conversation Id");
          socket.broadcast.emit("new-image", { user_id, friend_id });
          io.to(`room-${con_id}`).emit("imageURL", {
            imageUrl,
            sender_name,
            friend_id,
          });
          const chat = new db.Message({
            sender_id: user_id,
            receiver_id: friend_id,
            con_id: con_id,
            message: String(imageUrl),
            messageType: "Image",
          });
          await chat.save();
        }
      });
    }
  );

  socket.on("disconnect", () => {
    console.log("disconnect Users ---->>", socket.id);
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    if (userId) {
      delete onlineUsers[userId];
      socket.broadcast.emit("user-disconnected", userId);
    }
    socket.broadcast.emit("left-chat");
  });
});

server.listen(port, () => {
  console.log(`Server started at ${port}`);
});
