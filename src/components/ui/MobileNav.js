"use client"
import React from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
import Image from 'next/image'
import Link from 'next/link'
import { sideBarLinks } from '../../../constants'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'


const MobileNav = () => {
    const pathname=usePathname();
  return (
    <section className=' max-w-[264px]'>
        <Sheet>
            <SheetTrigger >
                <Image 
                    src='/icons/hamburger.svg'
                    width={36}
                    height={36}
                    alt="hamburger icon"
                    className='cursor-pointer sm:hidden'
                />
            </SheetTrigger>
            {/* Hidden title & description */}
            {/* <VisuallyHidden> */}
            <SheetTitle className="sr-only">Are you absolutely sure?</SheetTitle>
            <SheetDescription className="sr-only">
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </SheetDescription>

            {/* </VisuallyHidden> */}
            <SheetContent side='left' className="border-none bg-dark-1"  >
            <Link href='/' className='flex items-center gap-1'>
                <Image 
                src='/icons/logo.svg'
                alt='Yoom logo'
                width={32}
                height={32}
                className=' max-sm:size-10'
                />
                <p className='text-[26px] font-extrabold text-white max-sm:hidden'>Yoom</p>
            </Link>
            <SheetClose asChild>
            <button className="absolute top-4 right-4 p-2 text-white hover:text-red-500">
            <Image src="/icons/close.svg" width={25} height={25} className="absolute top-0 right-0 invert" alt="Close" />

            </button>
            </SheetClose>
            <div className='flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto'>
                <SheetClose asChild>
                    <section className='flex h-full flex-col gap-6 pt-16 text-white'>
                    {sideBarLinks.map((link)=>{
                    const isActive=pathname===link.route
                    return<SheetClose asChild key={link.route}>
                    <Link href={link.route} key={link.label} className={cn('flex gap-4  text-white items-center p-4 rounded-lg w-full max-w-60' ,{'bg-blue-1':isActive})}>
                    <Image
                        src={link.imgUrl}
                        alt={link.label}
                        width={20}
                        height={20}
                        

                    />
                    <p className='font-semibold'>{link.label}</p>
                    </Link>
                    </SheetClose>
                    })}
                

                    </section>
                </SheetClose>
            </div>
            </SheetContent>
        </Sheet>
  </section>
  )
}

export default MobileNav