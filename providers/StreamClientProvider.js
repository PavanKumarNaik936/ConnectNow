// "use client"
// import { useUser } from "@clerk/nextjs";
// import {
//     StreamVideo,
//     StreamVideoClient,
//   } from "@stream-io/video-react-sdk";
// import { useEffect, useState } from "react";
// import { tokenProvider } from "../actions/stream.actions";
// import Loader from "@/components/Loader";
  
  

//   export const StreamVideoProvider = ({children}) => {
//     const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
//     const [videoClient,setVideoClient]=useState(null);
//     const {user,isLoaded}=useUser();
//     useEffect(()=>{
//         if(!isLoaded || !user)return;
//         if(!apiKey) throw new Error('Stream API key missing')
//         const client=new StreamVideoClient({
//             apiKey,
//             user:{
//                 id:user?.id,
//                 name:user?.username || user?.id,
//                 image:user?.imageUrl,
//             },
//             tokenProvider,
//         })
//         // console.log(tokenProvider);
//         setVideoClient(client);
//         return () => client.disconnectUser();
//     },[user,isLoaded]);
    
//     // if(!user) return <Loader/>

//     if(!videoClient ) return  <Loader/>;
//     return (
//       <StreamVideo client={videoClient}>
//         {children}
//       </StreamVideo>
//     );
//   };

//   export default StreamVideoProvider;




// "use client";

// import { useUser } from "@clerk/nextjs";
// import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
// import { StreamChat } from "stream-chat";
// import { Chat } from "stream-chat-react";
// import { useEffect, useState, useRef } from "react";
// import { tokenProvider } from "../actions/stream.actions";
// import Loader from "@/components/Loader";
// import "stream-chat-react/dist/css/v2/index.css";

// export const StreamVideoProvider = ({ children }) => {
//   const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
//   const { user, isLoaded } = useUser();
//   const [videoClient, setVideoClient] = useState(null);
//   const [chatClient, setChatClient] = useState(null);
//   const initializedRef = useRef(false);

//   useEffect(() => {
//     if (!apiKey) {
//       console.error("Stream API key is missing");
//       return;
//     }

//     if (!isLoaded || !user || initializedRef.current) return;

//     let video;
//     let chat;

//     const initializeClients = async () => {
//       try {
//         initializedRef.current = true;
        
//         const userInfo = {
//           id: user.id,
//           name: user.username || user.id,
//           image: user.imageUrl,
//         };

//         // Initialize Stream Video Client (singleton)
//         video = StreamVideoClient.getOrCreateInstance({
//           apiKey,
//           user: userInfo,
//           tokenProvider,
//         });
//         setVideoClient(video);

//         // Initialize Stream Chat Client
//         chat = StreamChat.getInstance(apiKey);
//         const token = await tokenProvider();
//         await chat.connectUser(userInfo, token);
//         setChatClient(chat);

//       } catch (error) {
//         console.error("Error initializing Stream clients:", error);
//         initializedRef.current = false;
//       }
//     };

//     initializeClients();

//     return () => {
//       if (chat) {
//         chat.disconnectUser().catch(console.error);
//       }
//       // Don't disconnect video client as it's meant to be singleton
//       initializedRef.current = false;
//     };
//   }, [apiKey, isLoaded, user?.id]);

//   if (!videoClient || !chatClient) {
//     return <Loader />;
//   }

//   return (
//     <StreamVideo client={videoClient}>
//       <Chat client={chatClient} theme="messaging light">
//         {children}
//       </Chat>
//     </StreamVideo>
//   );
// };

// export default StreamVideoProvider;

"use client";

import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import { useEffect, useState, useRef } from "react";
import { tokenProvider } from "../actions/stream.actions";
import Loader from "@/components/Loader";
import "stream-chat-react/dist/css/v2/index.css";

export const StreamVideoProvider = ({ children }) => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const { user, isLoaded } = useUser();
  const [videoClient, setVideoClient] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [error, setError] = useState(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!apiKey) {
      setError("Stream API key is missing");
      return;
    }

    if (!isLoaded || !user || initializedRef.current) return;

    let video;
    let chat;

    const initializeClients = async () => {
      try {
        initializedRef.current = true;
        
        const userInfo = {
          id: user.id,
          name: user.username || user.id,
          image: user.imageUrl,
        };

        // 1. Initialize Video Client
        video = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: userInfo,
          tokenProvider,
          options: {
            logLevel: 'error', // Reduce console noise
          },
        });
        setVideoClient(video);
        console.log(video);
        // 2. Initialize Chat Client
        chat = StreamChat.getInstance(apiKey);
        const token = await tokenProvider();
        console.log(chat);
        // Validate token before connecting
        if (!token) throw new Error("Failed to generate chat token");
        
        await chat.connectUser(userInfo, token);
        setChatClient(chat);

      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to initialize services");
        initializedRef.current = false;
        
        // Clean up partial initialization
        if (chat) chat.disconnectUser().catch(console.error);
        if (video) video.disconnectUser().catch(console.error);
      }
    };

    initializeClients();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
      // Video client remains connected as singleton
    };
  }, [apiKey, isLoaded, user?.id]);

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Service Error: {error}. Please refresh.
      </div>
    );
  }

  if (!videoClient || !chatClient) {
    return <Loader />;
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient} theme="messaging light">
        {children}
      </Chat>
    </StreamVideo>
  );
};

export default StreamVideoProvider;