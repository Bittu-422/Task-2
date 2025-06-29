import React, { useEffect, useState } from "react";

function ChatBox() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
    setSocket(ws);

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.send(input);
      setInput("");
    }
  };

  return (
    <div>
      <h2>💬 Real-Time Chat</h2>
      <div style={{ minHeight: "200px", border: "1px solid black", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;
