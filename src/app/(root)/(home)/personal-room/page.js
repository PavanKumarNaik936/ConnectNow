'use client'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import React from 'react'
import { toast } from 'sonner'

const Table =({title,description})=>{
  return <div className='fle flex-col items-start gap-2  lg:flex-row'>
    <h1 className='text-base font-medium text-sky-1 md:text-md lg:min-w-32'>{title}</h1>
    <h1 className='truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl'>{description}</h1>
  </div>
}
const PersonalRoom = () => {
  const {user} = useUser();
  const meetingId=user?.id;
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  const startRoom = async ()=>{

  }
  return (
    <section className='flex size-full flex-col gap-10 text-white'>
    <h1 className='text-3xl font-bold text-white'>
      PersonalRoom
    </h1>
    <div className='flex w-full flex-col gap-8 lg:max-w-[900px]'>
      <Table title='Topic' description ={`${user?.username}'s Meeting Room`}/>
      <Table title='Meeting Id' description ={meetingId}/>
      <Table title='Invite Link' description ={meetingLink}/>
      <div className='flex gap-5'>
          <Button className='bg-blue-1' onClick={startRoom}>Start Meeting</Button>
          <Button className='bg-dark-3' onClick={()=>{
             navigator.clipboard.writeText(meetingLink);
             toast("Link Copied");
          }}>Copy Invitation</Button>
      </div>
    </div>
  </section>
  )
}

export default PersonalRoom