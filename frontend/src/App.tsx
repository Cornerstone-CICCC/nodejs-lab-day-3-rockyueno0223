import { useState, useEffect } from 'react';
import { socket } from './sockets/socket';

interface ChatData {
  username: string;
  message: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<Array<ChatData>>([]);

  useEffect(() => {
    const fetchMessageData = async () => {
      try {
        const res = await fetch('http://localhost:3500/api/chat');
        const data = await res.json();
        setReceivedMessages(data.reverse());
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      }
    }

    fetchMessageData();

    const handleMessage = (data: ChatData) => {
      setReceivedMessages((prevMessages) => [...prevMessages, data]);
    };

    // Attach the listener
    socket.on('newMessage', handleMessage);

    return () => {
      socket.off('newMessage', handleMessage);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message) {
      socket.emit('sendMessage', { message: message, username: socket.id })
      setMessage('');
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="message-input"
          id=""
          placeholder='Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send Message</button>
      </form>
      <ul>
        {receivedMessages.map((msg, index) => (
          <li key={index}>{msg.message}</li>
        ))}
      </ul>
    </>
  )
}

export default App
