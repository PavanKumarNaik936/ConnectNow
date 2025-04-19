// import { CallControls, CallParticipantsList, CallStatsButton, PaginatedGridLayout, SpeakerLayout } from '@stream-io/video-react-sdk';
// import React, { useState } from 'react';
// import { cn } from '@/lib/utils';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { LayoutList, Users } from 'lucide-react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import EndCallButton from './EndCallButton';

// const MeetingRoom = () => {
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal')
//   const [layout, setLayout] = useState('speaker-left');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const router =useRouter();
//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
//       <div className="relative flex size-full items-center justify-center">
//         <div className="flex size-full max-w-[1000px] items-center">
//           {CallLayout()} {/* Fixed function call */}
//         </div>
//         <div className={cn('h-[calc(100vh-86px)] hidden ml-2', { block: showParticipants })}>
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>
//       <div className='fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap'>
//         <CallControls  onLeave={()=>{router.push('/')}}/>
//         <DropdownMenu>
//           <div className='flex items-center'>
//           <DropdownMenuTrigger className='cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
//             <LayoutList size={20} className='text-white'/>
//           </DropdownMenuTrigger>
//           </div>
       
//         <DropdownMenuContent className='border-dark-1 bg-dark-1 text-white'>
//           {['Grid','Speaker-Left','Speaker-Right'].map((item,index)=>{
//             return <div key={index}>
//               <DropdownMenuItem className='cursor-pointer' onClick={()=>{
//                 setLayout(item.toLowerCase())
//               }}>
//                 {item}
//               </DropdownMenuItem>
//             </div>
//           })}
//           <DropdownMenuSeparator className='border-dark-1' />
          
//         </DropdownMenuContent>
//       </DropdownMenu>
//       <CallStatsButton/>
//       <button onClick={()=>setShowParticipants((prev)=>!prev)}>
//           <div className='cursor-pointer rounded-2xl  bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]'>
//             <Users size={20} className='text-white'/>
            
//           </div>
//       </button>
//       {!isPersonalRoom && <EndCallButton/>}


//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;
'use client';

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutList, Users, MessageCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import EndCallButton from './EndCallButton';
import { Channel, MessageList, MessageInput, Window, useMessageContext, MessageContext } from 'stream-chat-react';
import { useChatContext } from 'stream-chat-react';
import { useUser } from '@clerk/nextjs';
import Loader from '@/components/Loader';

const CustomMessage = () => {
  const { message, isMyMessage } = useMessageContext();
  // console.log(message,isMyMessage());
  const { user } = useUser();

  return (
    <div className={`flex ${isMyMessage() ? 'justify-end' : 'justify-start'} mb-4 px-2`}>
      <div className={`flex ${isMyMessage() ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {!isMyMessage() && (
          <img 
            src={message.user?.image || '/default-avatar.png'} 
            alt={message.user?.name} 
            className="w-8 h-8 rounded-full"
          />
        )}
        
        <div className={`flex flex-col ${isMyMessage() ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-lg p-3 ${isMyMessage() 
              ? 'bg-blue-600 rounded-tr-none' 
              : 'bg-dark-4 rounded-tl-none'}`}
          >
            {message.text && <p className="text-white text-sm">{message.text}</p>}
          </div>
          
          <div className={`flex items-center mt-1 gap-2 ${isMyMessage() ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={`text-xs ${isMyMessage() ? 'text-blue-300' : 'text-gray-300'}`}>
              {isMyMessage() ? 'You' : message.user?.name || 'Unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const meetingId = searchParams.get('id') || 'default-room';
  const router = useRouter();
  const { user } = useUser();
  const { client: chatClient } = useChatContext();

  const [layout, setLayout] = useState('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [channel, setChannel] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const CallLayout = useCallback(() => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  }, [layout]);

  const handleLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      if (channel) {
        // Remove the channel from the client's active channels
        await channel.stopWatching();
        // Remove all messages from the channel
        await channel.truncate();
      }
    } catch (err) {
      console.error('Error cleaning up chat:', err);
    } finally {
      router.push('/');
    }
  }, [channel, router]);

  const handleEndCall = useCallback(async () => {
    setIsLeaving(true);
    try {
      if (channel) {
        // Remove all participants and messages
        await channel.truncate();
        await channel.stopWatching();
      }
    } catch (err) {
      console.error('Error ending call:', err);
    } finally {
      router.push('/');
    }
  }, [channel, router]);

  useEffect(() => {
    // if (!chatClient || !user?.id) return;
    if (!chatClient || !user?.id || !meetingId) return;

    const initChannel = async () => {
      try {
        const newChannel = chatClient.channel('messaging', `meeting-${meetingId}`, {
          name: `Meeting ${meetingId}`,
          members: [user.id],
          meeting_id: meetingId,
          created_by: {
            id: user.id,
            name: user.username || user.id,
            image: user.imageUrl,
          },
        });

        newChannel.on('message.new', (event) => {
          if (!showChat && event.user.id !== user.id) {
            setUnreadCount((prev) => prev + 1);
          }
        });

        // Set channel to be ephemeral (messages won't persist after meeting ends)
        await newChannel.create({
          ephemeral: true,
        });

        await newChannel.watch();
        setChannel(newChannel);
        setIsConnected(true);
        setChatError(null);
        newChannel.markRead();
      } catch (err) {
        setChatError('Failed to initialize chat.');
        console.error(err);
      }
    };

    initChannel();

    return () => {
      if (channel && !isLeaving) {
        // Clean up channel when component unmounts (user leaves without explicitly ending call)
        channel.stopWatching().catch(console.error);
        channel.truncate().catch(console.error);
      }
    };
  }, [chatClient, user, meetingId, isLeaving]);

  useEffect(() => {
    if (showChat && channel) {
      channel.markRead();
      setUnreadCount(0);
    }
  }, [showChat, channel]);

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className={cn(
          'flex size-full items-stretch transition-all duration-300',
          {
            'max-w-full': !showChat,
            'max-w-[calc(100%-350px)]': showChat,
          },
        )}>
          <div className="flex-grow flex items-center justify-center">
            <CallLayout />
          </div>

          {showParticipants && (
            <div className="hidden md:block h-[calc(100vh-86px)] ml-2 w-[300px] bg-dark-2 rounded-lg overflow-hidden">
              <CallParticipantsList
                onClose={() => setShowParticipants(false)}
                ParticipantViewUI={({ participant }) => (
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-dark-3 flex items-center justify-center">
                      {participant.name?.charAt(0) || 'U'}
                    </div>
                    <span>{participant.name || 'Unknown user'}</span>
                  </div>
                )}
              />
            </div>
          )}
        </div>

        <div
          className={cn(
            'absolute right-0 top-0 h-full bg-dark-2 border-l border-gray-700 transition-all duration-300 z-10',
            {
              'w-0 opacity-0': !showChat,
              'w-full md:w-[350px] opacity-100': showChat,
            },
          )}
        >
          {channel ? (
            <Channel channel={channel} key={`channel-${meetingId}`}>
              <Window>
                <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-dark-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">Meeting Chat</h3>
                      <span
                        className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                      ></span>
                    </div>
                    <button 
                      onClick={() => setShowChat(false)} 
                      className="text-gray-400 hover:text-white text-xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-4">
                    <MessageList 
                      disableDateSeparator={false}
                      Message={CustomMessage}
                      messageActions={['react', 'reply']}
                    />
                  </div>
                  <div className="p-3 border-t border-gray-700 bg-dark-3 mb-24">
                    <MessageInput
                      focus
                      disableFileUpload
                      additionalTextareaProps={{
                        placeholder: 'Type your message...',
                        className:
                          'bg-dark-4 text-white rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500',
                      }}
                    />
                  </div>
                </div>
              </Window>
            </Channel>
          ) : (
            <div className="flex items-center justify-center h-full">
              {chatError || <Loader />}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center justify-center gap-3 md:gap-5 p-3 bg-dark-1 z-20">
        <CallControls onLeave={handleLeave} />

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] p-2 md:px-4 md:py-2 hover:bg-[#4c535b]">
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item) => (
              <DropdownMenuItem 
                key={item} 
                onClick={() => setLayout(item.toLowerCase())}
                className="hover:bg-dark-3 cursor-pointer"
              >
                {item}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="border-dark-1" />
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button
          onClick={() => setShowParticipants((prev) => !prev)}
          className={cn(
            'cursor-pointer rounded-2xl p-2 md:px-4 md:py-2 hover:bg-[#4c535b] relative',
            showParticipants ? 'bg-[#4c535b]' : 'bg-[#19232d]'
          )}
        >
          <Users size={20} className="text-white" />
        </button>

        <button
          onClick={() => setShowChat((prev) => !prev)}
          className={cn(
            'cursor-pointer rounded-2xl p-2 md:px-4 md:py-2 hover:bg-[#4c535b] relative',
            showChat ? 'bg-[#4c535b]' : 'bg-[#19232d]'
          )}
        >
          <MessageCircle size={20} className="text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
              {Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}
            </span>
          )}
        </button>

        {!isPersonalRoom && <EndCallButton onEndCall={handleEndCall} />}
      </div>
    </section>
  );
};

export default MeetingRoom;