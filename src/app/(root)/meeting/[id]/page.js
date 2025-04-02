"use client";
import MeetingRoom from '@/components/MeetingRoom';
import MeetingSetup from '@/components/MeetingSetup';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import React, { useState } from 'react';
import { useGetCallById } from '../../../../../hooks/useGetCallById';
import Loader from '@/components/Loader';
import { useParams } from 'next/navigation';

const Meeting = () => {
  const { id } = useParams(); // ✅ Correct use of useParams
  const { user, isLoaded } = useUser();
  const { call, isCallLoading } = useGetCallById(id); // ✅ Calling the hook correctly
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) return <Loader />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default Meeting;
