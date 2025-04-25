'use client';
import React, { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import { useGetCalls } from '../../../../hooks/useGetCalls';

const Home = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(now);

  const { upcomingCalls } = useGetCalls();
  const [nextMeetingTime, setNextMeetingTime] = useState(null);

  useEffect(() => {
    if (upcomingCalls && upcomingCalls.length > 0) {
      try {
        // Filter out calls that do not have a start time
        const validCalls = upcomingCalls.filter(call => call?.state?.startsAt);
        
        // Sort the valid calls based on the start time
        const sorted = [...validCalls].sort((a, b) => {
          const aTime = new Date(a.state.startsAt).getTime();
          const bTime = new Date(b.state.startsAt).getTime();
          return aTime - bTime;
        });

        // Get the next upcoming call
        const nextCall = sorted[0];

        if (nextCall) {
          const startsAt = nextCall?.state?.startsAt;

          if (startsAt) {
            const meetingDate = new Date(startsAt);

            // Format both date and time for the upcoming meeting
            const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(meetingDate);
            const formattedTime = meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            setNextMeetingTime(`${formattedDate} at ${formattedTime}`);
          }
        }
      } catch (error) {
        console.error("Error parsing upcomingCalls:", error);
      }
    } else {
      console.log("No upcoming meetings");
    }
  }, [upcomingCalls]);

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="h-[300px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
        <h2 className="glassmorphism max-w-[320px] rounded py-2 text-center font-normal sm:max-w-[350px] md:max-w-[400px] lg:max-w-[450px] xl:max-w-[500px]">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
            Upcoming Meeting:
          </span>
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl">
            {nextMeetingTime ? ` ${nextMeetingTime}` : ' No Upcoming Meeting'}
          </span>
        </h2>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-5xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>
      <MeetingTypeList />
    </section>
  );
};

export default Home;
