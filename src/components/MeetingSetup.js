"use client"
import { DeviceSettings, useCall, VideoPreview } from '@stream-io/video-react-sdk'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'

const MeetingSetup = ({setIsSetupComplete}) => {
    const [isMicCamToggleOn,SetISMicCamToggledOn]=useState(false)
    const call=useCall();
    if(!call){
        throw new Error('useCall must be used within StreamCall component')
    }
    useEffect(()=>{

        if(isMicCamToggleOn){
            call?.camera.disable();
            call?.microphone.disable();
        }
        else{
            call?.camera.enable();
            call?.microphone.enable();
        }
    },[isMicCamToggleOn,call?.camera,call?.microphone])
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 px-4 text-white">
  <h1 className="text-2xl font-bold md:text-3xl">Setup</h1>

  <VideoPreview className="w-full max-w-md h-auto md:max-w-lg md:h-64 lg:max-w-xl lg:h-80" />

  <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
    <label className="flex items-center gap-3 text-sm md:text-base">
      <input 
        type="checkbox"
        checked={isMicCamToggleOn}
        onChange={(e) => SetISMicCamToggledOn(e.target.checked)}
        className="w-4 h-4 accent-green-500"
      />
      Join with mic and camera off
    </label>

    <DeviceSettings />

    <Button 
      className="w-full max-w-[200px] rounded-md bg-green-500 px-6 py-2.5 text-sm font-medium transition duration-300 hover:bg-green-600 md:text-base"
      onClick={() => {
        call.join();
        setIsSetupComplete(true);
      }}
    >
      Join Meeting
    </Button>
  </div>
    </div>

  )
}

export default MeetingSetup