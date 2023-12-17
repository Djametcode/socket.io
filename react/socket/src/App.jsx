import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function App() {
  const [message, setMessage] = useState([]);
  const [roomMessage, setRoomMessage] = useState([]);
  const [room, setRoom] = useState("");
  const [id, setId] = useState("");
  const [socket, setSocket] = useState(null);
  console.log(room);
  console.log(id);
  const [serverMsg, setServerMsg] = useState([]);
  console.log(serverMsg);
  const [myRoom, setMyRoom] = useState(null);
  const [roomList, setRoomList] = useState([]);
  console.log(roomList);

  const createRoomHandler = async () => {
    event.preventDefault();
    try {
      const sockets = await socket.emit("create-room", room);
      setMyRoom(room);
      console.log(sockets);
    } catch (error) {
      console.log(error);
    }
  };

  const joinRoomHandler = async () => {
    event.preventDefault();
    try {
      const response = await socket.emit("join-room", room);
      console.log(response);
      setMyRoom(room);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    event.preventDefault();
    try {
      const response = await socket.emit("message", message);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessageToMyRoom = async () => {
    event.preventDefault();
    try {
      const response = await socket.emit("room-chat", myRoom, message, id);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectSocket = async () => {
    event.preventDefault();
    try {
      const response = await socket.emit("disconnect-custom", room);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:3000");
    setSocket(socket);

    socket.on("connect", () => {
      console.log(socket.id);
    });

    socket.on("message", (data) => {
      console.log(data);
      setServerMsg((prev) => [...prev, data]);
    });

    socket.on("room-chat", (msg, id) => {
      console.log(msg);
      console.log(id);
      setServerMsg((prev) => [...prev, `${id}: ${msg}`]);
    });

    socket.on("room", (data) => {
      console.log(data);
      setRoomList((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <form onSubmit={sendMessage} action="">
          <input
            type="text"
            placeholder="text"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          <input
            onChange={(e) => setRoom(e.target.value)}
            type="text"
            placeholder="Room name"
          />
          <input type="submit" value="test" />
        </form>
        <div>
          {serverMsg.map((item) => {
            return <p key={item}>{item}</p>;
          })}
        </div>
      </div>
      <button onClick={(e) => disconnectSocket(e.preventDefault())}>
        disconnect
      </button>
      <div style={{ border: "10px", padding: "10px" }}>
        <h1>Create room Page</h1>
        <form>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              onChange={(e) => setRoom(e.target.value)}
              type="text"
              placeholder="Room name"
            />
          </div>
          <button onClick={(e) => createRoomHandler(e.preventDefault())}>
            Create Room
          </button>
        </form>
      </div>
      <div style={{ border: "10px", padding: "10px" }}>
        <h1>Join Room Page</h1>
        <form>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              onChange={(e) => setRoom(e.target.value)}
              type="text"
              placeholder="Room name"
            />
            <input
              onChange={(e) => setId(e.target.value)}
              type="text"
              placeholder="Your Id"
            />
          </div>
          <button onClick={(e) => joinRoomHandler(e.preventDefault())}>
            Join Room
          </button>
        </form>
      </div>
      <div style={{ border: "10px", padding: "10px" }}>
        <h1>Chat to Room</h1>
        <form>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              onChange={(e) => setRoom(e.target.value)}
              type="text"
              placeholder="Room name"
            />
            <input
              onChange={(e) => setId(e.target.value)}
              type="text"
              placeholder="Your Id"
            />
            <input
              type="text"
              placeholder="text"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
          </div>
          <button onClick={(e) => sendMessageToMyRoom(e.preventDefault())}>
            Send Chat To Room
          </button>
        </form>
        <div>
          <h1>Room Chat</h1>
          {roomList.map((item) => {
            return (
              <>
                <div>
                  <p>{item}</p>
                  <button>Join</button>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
