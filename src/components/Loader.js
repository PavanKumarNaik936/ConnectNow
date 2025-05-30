import Image from 'next/image'
import React from 'react'

const Loader = () => {
  return (
    <div className='flex-center h-screen w-full'>
        <Image
            src={'/icons/loading-circle.svg'}
            alt='loading'
            width={50}
            height={50}
            priority
        />
    </div>
  )
}

export default Loader