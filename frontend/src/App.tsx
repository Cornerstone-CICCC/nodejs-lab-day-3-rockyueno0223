import { useState, useEffect } from 'react';
import { socket } from './sockets/socket';

interface ChatData {
  username: string;
  message: string;
  room: string;
}

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<Array<ChatData>>([]);
  const [room, setRoom] = useState('');
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
        setError("Unable to fetch chats");
      }
    }

    if (room) {
      fetchMessageDataByRoom();
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!room) {
      setError("Please select a room before sending a message");
      return;
    }
    if (!username) {
      setError("You must provide a username to send messages");
      return;
    }
    if (!message) {
      setError("Please enter a message before sending");
      return;
    }
    socket.emit('sendMessage', { message: message, username: username, room: room })
    setMessage('');
    setError(null);
  }

  const handleChangeRoom = (newRoom: string) => {
    if (!username) {
      setError("Please enter a username before joining a room");
      return;
    }

    if (room) {
      socket.emit('leave room', { room: room, username: username });
    }

    if (room !== newRoom) {
      socket.emit('join room', { room: newRoom, username: username })
      setRoom(newRoom);
      setError(null);
    }
  }

  return (
    <>
      <select
        name="room-select"
        id=""
        value={room}
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
          name="username-input"
          id=""
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
      {error && (
        <p className='text-red-500'>{error}</p>
      )}
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
