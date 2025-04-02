import { CallingState, useCall, useCallStateHooks } from '@stream-io/video-react-sdk'
import React from 'react'
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import Loader from './Loader';

const EndCallButton = () => {
    const router=useRouter();
    const call=useCall();
    const {useCallCallingState,useLocalParticipant} = useCallStateHooks();
    const localParticipant = useLocalParticipant();
    
    const callingState=useCallCallingState();
    if(callingState!==CallingState.JOINED) return <Loader/>
   
    const isMeetingOwner=localParticipant && call?.state.createdBy && localParticipant.userId === call.state.createdBy.id;
    if(!isMeetingOwner)
            return null;
  return (
    <Button onClick={async ()=>{
        await call.endCall();
        router.push('/')
    }} className='bg-red-500'>End Call for EveryOne</Button>
  )
}

export default EndCallButton