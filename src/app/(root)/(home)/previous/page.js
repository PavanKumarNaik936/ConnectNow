import React from 'react'
import CallList from '@/components/ui/CallList'
const Previous = () => {
  return (
    <section className='flex size-full flex-col gap-10 text-white'>
    <h1 className='text-3xl font-bold text-white'>
      Previous
    </h1>

    <CallList type='ended'/>
  </section>
  )
}

export default Previous