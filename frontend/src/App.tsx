import { useState, useEffect } from 'react';
import { socket } from './sockets/socket';

interface ChatData {
  username: string;
  message: string;
  room: string;
}

function App() {
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<Array<ChatData>>([]);
  const [room, setRoom] = useState('');

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

  useEffect(() => {
    const fetchMessageDataByRoom = async () => {
      try {
        const res = await fetch(`http://localhost:3500/api/chat/${room}`);
        const data = await res.json();
        setReceivedMessages(data.reverse());
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      }
    }

    if (room) {
      fetchMessageDataByRoom();
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message && room) {
      socket.emit('sendMessage', { message: message, username: socket.id, room: room })
      setMessage('');
    }
  }

  const handleChangeRoom = (newRoom: string) => {
    if (room) {
      socket.emit('leave room', { room: room, username: socket.id });
    }
    if (room !== newRoom) {
      socket.emit('join room', { room: newRoom, username: socket.id })
      setRoom(newRoom);
    }
  }

  return (
    <>
      <select
        name="room-select"
        id=""
        defaultValue=""
        onChange={e => handleChangeRoom(e.target.value)}
      >
        <option value="" disabled>Select a room</option>
        <option value="Room1">Room1</option>
        <option value="Room2">Room2</option>
        <option value="Room3">Room3</option>
      </select>
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
          <li key={index}>
            <strong>{msg.username}: </strong>{msg.message}
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
