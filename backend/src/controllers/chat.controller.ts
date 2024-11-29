import { Request, Response } from 'express';
import { Chat } from '../models/chat.model';

// Get all chats
const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 }); // Sort by createdAt field
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
};

// Get chats by room
const getChatsById = async (req: Request<{ room: string }>, res: Response) => {
  const { room } = req.params;

  try {
    const chats = await Chat.find({ room }).sort({ createdAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats by room' });
  }
}

export default {
  getAllChats,
  getChatsById
}
