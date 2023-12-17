import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import { connectDB } from "./database/connectDB";

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

io.on("connection", async (socket) => {
  console.log(socket.rooms)
  console.log(`A user connected : ${socket.id}, count ${io.engine.clientsCount}, size: ${io.of("/").sockets.size}`)

  socket.on("message", (msg) => {
    console.log(`Message from client: ${msg}`);

    socket.broadcast.emit("message", msg)

  });

  socket.on("create-room", async (room) => {
    const sockets = await io.fetchSockets()
    const items = sockets.findIndex((item) => item.rooms.has(room))

    if (items !== -1) {
      return io.emit("room-alert", 'room already created')
    }
    console.log(`${room} was created`)

    io.emit('room', room)
    socket.join(room)
  })

  socket.on("room-chat", (room, msg, id) => {
    console.log(`Message from ${id}, to room ${room}, : msg`)
    io.to(room).emit("room-chat", { id, msg });
  })

  socket.on('join-room', async (room, id) => {
    console.log(`user ${id} has joined to ${room}`)

    const sockets = await io.fetchSockets()
    for (const socket of sockets) {
      io.socketsJoin(room)
      console.log(socket.id)
      console.log(socket.data)
      console.log(socket.rooms)
    }


  })

  socket.on("check-room", (room) => {
    const item = io.in(room).fetchSockets()
    console.log(item)
  })

  socket.on("leave-room", (room) => {
    io.socketsLeave(room)
  })

  socket.on("disconnect-custom", (room) => {
    io.of("/").in(room).local.disconnectSockets();
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

io.of("/custom").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`)
})

io.of("/custom").adapter.on("join-room", (room, id) => {
  console.log(`user ${id} joined ${room}`)
})

const startServer = async () => {
  try {
    if (process.env.MONGO_URL !== undefined) {
      await connectDB(process.env.MONGO_URL);
    }
    server.listen(3000, () => console.log("server running"));
  } catch (error) {
    console.log(error);
  }
};

startServer();
