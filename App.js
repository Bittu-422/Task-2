import React, { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = async (event) => {
      const text = await event.data.text();
      try {
        const parsed = JSON.parse(text);
        setMessages((prev) => [...prev, parsed]);
      } catch (err) {
        console.error("Invalid message format:", text);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (socket && input.trim() !== "") {
      const message = { user: username, text: input };
      socket.send(JSON.stringify(message));
      setInput("");
      setShowEmojiPicker(false); // 👈 Hides emoji picker after send
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  if (!isUsernameSet) {
    return (
      <div className="chat-container">
        <div className="chat-header">💬 Welcome to Chat</div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Enter your name to join the chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
          />
          <button onClick={() => setIsUsernameSet(true)}>Join</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">💬 Real-Time Chat</div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.user === username ? "you" : "other"}`}
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div style={{ margin: "10px auto" }}>
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="chat-input">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          😊
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
