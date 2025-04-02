import { SignUp } from '@clerk/nextjs'
import React from 'react'

const SignUpPage = () => {
  return (
    <main className='flex h-screen w-full items-center justify-center'>
        <SignUp className="mt-10"
      appearance={{
        elements: {
          card: "mt-[190px]",
        },
        variables: {
          colorText: "#fff",
          colorPrimary: "#0E78F9",
          colorBackground: "#1c1f2e",
          colorInputBackground: "#252a41",
          colorInputText: "#fff",
          
        },
        layout: {
          logoImageUrl: "http://localhost:3000/icons/yoom-logo.svg",
          socialButtonsVariant: "iconButton",
        },
      }}
    />
    </main>
  )
}

export default SignUpPage