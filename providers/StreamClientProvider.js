"use client"
import { useUser } from "@clerk/nextjs";
import {
    StreamVideo,
    StreamVideoClient,
  } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { tokenProvider } from "../actions/stream.actions";
import Loader from "@/components/Loader";
  
  

  export const StreamVideoProvider = ({children}) => {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const [videoClient,setVideoClient]=useState(null);
    const {user,isLoaded}=useUser();
    useEffect(()=>{
        if(!isLoaded || !user)return;
        if(!apiKey) throw new Error('Stream API key missing')
        const client=new StreamVideoClient({
            apiKey,
            user:{
                id:user?.id,
                name:user?.username || user?.id,
                image:user?.imageUrl,
            },
            tokenProvider,
        })
        console.log(tokenProvider);
        setVideoClient(client);
        return () => client.disconnectUser();
    },[user,isLoaded]);
    
    // if(!user) return <Loader/>

    if(!videoClient ) return  <Loader/>;
    return (
      <StreamVideo client={videoClient}>
        {children}
      </StreamVideo>
    );
  };

  export default StreamVideoProvider;