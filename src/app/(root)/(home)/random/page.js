'use client'
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export default function RandomChat() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const [showFindStranger, setShowFindStranger] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    });

    socketRef.current.on('matched', (partner) => {
      setIsLoading(false);
      setConnected(true);
      setPartnerId(partner);
      setShowFindStranger(false);
      createPeerConnection(partner, true);
    });

    socketRef.current.on('signal', async ({ from, signal }) => {
      if (!peerRef.current) createPeerConnection(from, false);

      if (signal.type === 'offer') {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        socketRef.current.emit('signal', { to: from, signal: answer });
      } else if (signal.type === 'answer') {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(signal));
      }
    });

    socketRef.current.on('chatMessage', ({ from, message }) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChat((prev) => [...prev, { from, text: message, time }]);
    });

    socketRef.current.on('skipped', () => {
      setIsLoading(false);
      setConnected(false);
      setPartnerId(null);
      peerRef.current?.close();
      peerRef.current = null;
      setShowFindStranger(true);
    });

    socketRef.current.on('showFindStrangerButton', () => {
      setShowFindStranger(true);
    });

    socketRef.current.on('strangerDisconnected', () => {
      alert("Stranger has disconnected.");
      setIsLoading(false);
      setConnected(false);
      setPartnerId(null);
      peerRef.current?.close();
      peerRef.current = null;
      setShowFindStranger(true);
    });

    socketRef.current.on('findStranger', () => {
      setIsLoading(false);
      setConnected(false);
      setPartnerId(null);
      setShowFindStranger(true);
    });

    socketRef.current.on('typing', () => {
      setIsTyping(true);
    });

    socketRef.current.on('stopTyping', () => {
      setIsTyping(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const createPeerConnection = async (partner, isInitiator) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerRef.current = peer;

    const stream = localVideoRef.current?.srcObject;
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('signal', { to: partner, signal: event.candidate });
      }
    };

    if (isInitiator) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socketRef.current.emit('signal', { to: partner, signal: offer });
    }
  };

  const handleFindStranger = () => {
    setIsLoading(true);
    setChat([]);
    setConnected(false);
    setPartnerId(null);
    setShowFindStranger(false);
    socketRef.current.emit('findStranger');
  };

  const handleSkip = () => {
    socketRef.current.emit('skip');
    setConnected(false);
    setPartnerId(null);
    setShowFindStranger(false);
  };

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || !partnerId) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socketRef.current.emit('chatMessage', {
      to: partnerId,
      message: trimmed,
    });

    setChat((prev) => [...prev, { from: 'me', text: trimmed, time }]);
    setMessage('');
  };

  const handleTyping = () => {
    socketRef.current.emit('typing', { to: partnerId });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🎥 Random Video Chat + Text</h1>

      <div style={styles.videoContainer}>
        <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
      </div>

      <div style={styles.buttonRow}>
        {showFindStranger && (
          <button onClick={handleFindStranger} style={styles.button}>Find a Stranger</button>
        )}
        {connected && (
          <button onClick={handleSkip} style={styles.button}>Skip</button>
        )}
        {isLoading && <div style={styles.spinner}></div>}
      </div>

      {connected && (
        <div style={styles.chatContainer}>
          <div style={styles.chatBox}>
            {chat.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.from === 'me' ? 'right' : 'left' }}>
                <div><strong>{msg.from === 'me' ? 'You' : 'Stranger'}:</strong> {msg.text}</div>
                <div style={styles.timestamp}>{msg.time}</div>
              </div>
            ))}
          </div>
          {isTyping && <div style={styles.typingIndicator}>Stranger is typing...</div>}
          <div style={styles.inputRow}>
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={styles.input}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '1.5rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  video: {
    width: '300px',
    height: '225px',
    backgroundColor: '#000',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  buttonRow: {
    marginBottom: '1rem',
  },
  button: {
    margin: '0 8px',
    padding: '10px 20px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4A90E2',
    color: '#fff',
    cursor: 'pointer',
  },
  spinner: {
    margin: '0 auto',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4A90E2',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite',
  },
  chatContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'left',
  },
  chatBox: {
    maxHeight: '250px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
    background: '#fafafa',
  },
  timestamp: {
    fontSize: '0.8rem',
    color: '#888',
  },
  inputRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    width: '80%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  sendButton: {
    padding: '10px 20px',
    marginLeft: '10px',
    fontSize: '1rem',
    backgroundColor: '#4A90E2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  typingIndicator: {
    fontSize: '1rem',
    color: '#888',
    marginTop: '10px',
  }
};