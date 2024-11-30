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
    <div className='w-full max-w-screen-xl mx-auto flex flex-col gap-6 py-6 px-4'>
      <form onSubmit={handleSubmit} className='w-full flex flex-col sm:flex-row sm:justify-start gap-3'>
        <div className="flex flex-col items-center w-full max-w-md mx-auto sm:w-1/2 sm:max-w-sm sm:mx-0 gap-3">
          <input
            type="text"
            name="username-input"
            id=""
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='w-full border border-slate-300 rounded p-1'
          />
          <select
            name="room-select"
            id=""
            value={room}
            onChange={e => handleChangeRoom(e.target.value)}
            className='w-full border border-slate-300 rounded p-1 cursor-pointer'
          >
            <option value="" disabled>Select a room</option>
            <option value="Room1">Room1</option>
            <option value="Room2">Room2</option>
            <option value="Room3">Room3</option>
          </select>
        </div>
        <div className="flex flex-col items-center w-full max-w-md mx-auto sm:w-1/2 sm:max-w-sm sm:mx-0  gap-3">
          <textarea
            name="message-input"
            id=""
            rows={3}
            placeholder='Message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='w-full border border-slate-300 rounded p-1'
          />
          <button type="submit" className='w-full text-white bg-neutral-800 hover:opacity-90 rounded py-2'>Send Message</button>
        </div>
      </form>
      {error && (
        <p className='w-full text-center text-lg text-red-500'>{error}</p>
      )}
      <ul className='max-w-3xl'>
        {receivedMessages.map((msg, index) => (
          <li key={index} className='my-1 border-b border-neutral-200'>
            <strong>{msg.username}</strong><br />
            {msg.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
