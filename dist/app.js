"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const connectDB_1 = require("./database/connectDB");
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
    },
});
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.sendFile("index.html");
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(socket.rooms);
    console.log(`A user connected : ${socket.id}, count ${io.engine.clientsCount}, size: ${io.of("/").sockets.size}`);
    socket.on("message", (msg) => {
        console.log(`Message from client: ${msg}`);
        socket.broadcast.emit("message", msg);
    });
    socket.on("create-room", (room) => __awaiter(void 0, void 0, void 0, function* () {
        const sockets = yield io.fetchSockets();
        console.log(sockets);
        const items = sockets.findIndex((item) => item.rooms.has(room));
        if (items !== -1) {
            return io.emit("room-alert", 'room already created');
        }
        console.log(`${room} was created`);
        io.emit('room', room);
        socket.join(room);
    }));
    socket.on("room-chat", (room, msg, id) => {
        console.log(`Message from ${id}, to room ${room}, : msg`);
        io.to(room).emit("room-chat", { id, msg });
    });
    socket.on('join-room', (room, id) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`user ${id} has joined to ${room}`);
        const sockets = yield io.fetchSockets();
        for (const socket of sockets) {
            io.socketsJoin(room);
            console.log(socket.id);
            console.log(socket.data);
            console.log(socket.rooms);
        }
    }));
    socket.on("check-room", (room) => {
        const item = io.in(room).fetchSockets();
        console.log(item);
    });
    socket.on("leave-room", (room) => {
        io.socketsLeave(room);
    });
    socket.on("disconnect-custom", (room) => {
        io.of("/").in(room).local.disconnectSockets();
    });
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
}));
io.of("/custom").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});
io.of("/custom").adapter.on("join-room", (room, id) => {
    console.log(`user ${id} joined ${room}`);
});
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (process.env.MONGO_URL !== undefined) {
            yield (0, connectDB_1.connectDB)(process.env.MONGO_URL);
        }
        server.listen(3000, () => console.log("server running"));
    }
    catch (error) {
        console.log(error);
    }
});
startServer();
