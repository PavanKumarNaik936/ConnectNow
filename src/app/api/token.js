import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-server-sdk';

const chatServer = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY);
const videoServerClient = new StreamVideoClient(process.env.STREAM_API_KEY, process.env.STREAM_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { userID } = req.body;
    const chatToken = chatServer.createToken(userID);
    const videoToken = videoServerClient.createToken(userID);
    
    res.status(200).json({ token: chatToken }); // Can use same token for both
  } catch (error) {
    res.status(500).json({ error: 'Token generation failed' });
  }
}