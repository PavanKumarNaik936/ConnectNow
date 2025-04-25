'use client'
import React, { useState, useEffect, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { 
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  CallControls,
  useCallStateHooks
} from '@stream-io/video-react-sdk';
import { Chat, Channel, MessageInput, MessageList } from 'stream-chat-react';

import '@stream-io/stream-chat-css/dist/v2/css/index.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const StrangerChat = ({ userId }) => {
  const [matched, setMatched] = useState(false);
  const [channel, setChannel] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [videoClient, setVideoClient] = useState(null);
  const [partnerId, setPartnerId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  // Initialize clients
  useEffect(() => {
    const initClients = async () => {
      try {
        // Get token from your backend
        const res = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID: userId }),
        });
        const { token } = await res.json();

        // Initialize Chat Client
        const chatClient = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_API_KEY);
        await chatClient.connectUser({ id: userId }, token);
        setChatClient(chatClient);

        // Initialize Video Client
        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
          user: { id: userId },
          token,
        });
        setVideoClient(videoClient);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize chat service');
      }
    };

    initClients();

    return () => {
      if (chatClient) chatClient.disconnectUser();
      if (call) call.leave();
    };
  }, [userId]);

  const findStranger = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, action: 'find' }),
      });
      
      const data = await res.json();
      
      if (data.matched) {
        // Set up chat channel
        const channel = chatClient.channel('messaging', data.channelId);
        await channel.watch();
        setChannel(channel);
        setPartnerId(data.partnerId);

        // Set up video call
        const call = videoClient.call('default', `stranger-call-${data.channelId}`, {
          members: [userId, data.partnerId],
        });
        await call.join({ create: true });
        setCall(call);

        setMatched(true);
      } else {
        // If not matched immediately, start polling
        const interval = setInterval(async () => {
          const pollRes = await fetch('/api/match/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID: userId }),
          });
          const pollData = await pollRes.json();
          
          if (pollData.matched) {
            clearInterval(interval);
            setIsSearching(false);
            
            const channel = chatClient.channel('messaging', pollData.channelId);
            await channel.watch();
            setChannel(channel);
            setPartnerId(pollData.partnerId);

            const call = videoClient.call('default', `stranger-call-${pollData.channelId}`, {
              members: [userId, pollData.partnerId],
            });
            await call.join({ create: true });
            setCall(call);

            setMatched(true);
          }
        }, 2000);

        return () => clearInterval(interval);
      }
    } catch (err) {
      console.error('Matching error:', err);
      setError('Failed to find match');
      setIsSearching(false);
    } finally {
      setIsSearching(false);
    }
  };

  const skipMatch = async () => {
    try {
      await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: userId, action: 'cancel' }),
      });

      if (call) {
        await call.leave();
        setCall(null);
      }
      
      setMatched(false);
      setChannel(null);
      setPartnerId('');
    } catch (err) {
      console.error('Skip error:', err);
      setError('Failed to skip match');
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!chatClient || !videoClient) {
    return <div>Loading chat service...</div>;
  }

  return (
    <div className="stranger-chat-container">
      <StreamVideo client={videoClient}>
        {!matched ? (
          <div className="match-screen">
            <h2>Find a Stranger to Video Chat</h2>
            {isSearching ? (
              <div className="searching">
                <div className="spinner"></div>
                <p>Looking for a stranger...</p>
                <button onClick={skipMatch}>Cancel</button>
              </div>
            ) : (
              <button onClick={findStranger} className="find-stranger-btn">
                Find a Stranger
              </button>
            )}
          </div>
        ) : (
          <div className="chat-container">
            <Chat client={chatClient} theme="stranger-chat">
              <Channel channel={channel}>
                <div className="video-call-section">
                  <StreamCall call={call}>
                    <SpeakerLayout />
                    <CallControls />
                  </StreamCall>
                </div>
                <div className="message-section">
                  <MessageList />
                  <MessageInput />
                </div>
              </Channel>
            </Chat>
            <button onClick={skipMatch} className="skip-btn">
              Skip Match
            </button>
          </div>
        )}
      </StreamVideo>
    </div>
  );
};

export default StrangerChat;