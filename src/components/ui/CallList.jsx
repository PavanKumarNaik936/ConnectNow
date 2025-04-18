'use client'
import React, { useEffect, useState } from 'react'
import { useGetCalls } from '../../../hooks/useGetCalls'
import { useRouter } from 'next/navigation';
import MeetingCard from './MeetingCard';
import Loader from '../Loader';
import { toast } from 'sonner';
const CallList = ({type}) => {
    const[recordings,setRecordings]=useState([]);
    const {endedCalls,upcomingCalls,callRecordings,isLoading} = useGetCalls();

    // console.log(callRecordings);
    const router = useRouter();
    const getCalls =()=>{
        switch(type){
            case 'ended':
                return endedCalls;
            case 'recordings':
                return recordings;
            case 'upcoming':
                return upcomingCalls;
            default:
                return [];
        }
    }
    const getNoCallsMessage =()=>{
        switch(type){
            case 'ended':
                return 'No Previous Calls';
            case 'recordings':
                return 'No Recordings';
            case 'upcoming':
                return 'No Upcoming Calls';
            default:
                return '';
        }
    }
    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const callData = await Promise.all(
                    callRecordings.map((meeting) => meeting.queryRecordings())
                );
    
                const recordings = callData
                    .filter((call) => call?.recordings?.length > 0)
                    .flatMap((call) => call?.recordings);
    
                setRecordings(recordings);
            } catch (error) {
                toast("Try again later")
                // console.error("Error fetching recordings:", error);
            }
        };
    
        if (type === 'recordings' && callRecordings?.length > 0) {
            fetchRecordings();
        }
    }, [type, callRecordings]);
    

    const calls = getCalls();
    const noCallMessage=getNoCallsMessage();
    if (isLoading) return <Loader />;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {calls && calls.length > 0 ? (
      calls.map((meeting) => {
        const isCall = meeting.state !== undefined;
        const isRecording = meeting.filename !== undefined;

        return (
          <MeetingCard
            key={isCall ? meeting.id : meeting?.filename}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              isCall
                ? meeting.state?.custom?.description?.substring(0,26) || "Personal Meeting"
                : isRecording
                ? meeting.filename?.substring(0, 20) || "Personal Meeting"
                : "Personal Meeting"
            }
            date={
              isCall && meeting.state?.startsAt
                ? new Date(meeting.state.startsAt).toLocaleString()
                : isRecording && meeting.start_time
                ? new Date(meeting.start_time).toLocaleString()
                : "Unknown Date"
            }
            isPreviousMeeting={type === "ended"}
            link={
              isRecording
                ? meeting.url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meeting.id}`
            }
            buttonIcon1={isRecording ? "/icons/play.svg" : undefined}
            buttonText={isRecording ? "Play" : "Start"}
            handleClick={() =>
              router.push(isRecording ? meeting.url : `/meeting/${meeting.id}`)
            }
          />
        );
      })
    ) : (
      <h1 className="text-2xl font-bold text-white">{noCallMessage}</h1>
    )}
  </div>
  )
}

export default CallList