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
        {receivedMessages.map((msg) => (
          <li>{msg.message}</li>
        ))}
      </ul>
    </>
  )
}

export default App
