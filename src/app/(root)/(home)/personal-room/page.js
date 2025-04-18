'use client'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { useStreamVideoClient } from '@stream-io/video-react-sdk'
import React from 'react'
import { toast } from 'sonner'
import { useGetCallById } from '../../../../../hooks/useGetCallById'
import { useRouter } from 'next/navigation'

const Table =({title,description})=>{
  return <div className='flex flex-col items-start gap-2  lg:flex-row'>
    <h1 className='text-base font-medium text-sky-1 md:text-md lg:min-w-32'>{title}</h1>
    <h1 className='truncate text-sm font-bold max-sm:max-w-[320px] lg:text-lg'>{description}</h1>
  </div>
}
const PersonalRoom = () => {
  const {user} = useUser();
  const client = useStreamVideoClient();
  const meetingId=user?.id;
  const router =useRouter();
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;
  const {call}=useGetCallById(meetingId);
  const startRoom = async ()=>{
    if(!client || !user) return ;
  if(!call){
    const newCall=client.call('default',meetingId)
    await newCall.getOrCreate({
      data:{
          starts_at:new Date().toISOString(),
      }
  })
  }

  router.push(`/meeting/${meetingId}?personal=true`)
    
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