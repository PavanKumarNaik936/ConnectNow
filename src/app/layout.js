import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// import { UserTokenProvider } from "@/app/userContextToken";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import { Toaster } from "@/components/ui/sonner"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ConnectNow",
  description: "Video Conferencing tool",
  icons:{
    icon:'/icons/logo.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <ClerkProvider
      appearance={{
        variables: {
          colorText: "#fff",
          colorPrimary: "#0E78F9",
          colorBackground: "#1c1f2e",
          colorInputBackground: "#252a41",
          colorInputText: "#fff",
          
        },
        layout: {
          logoImageUrl: "http://localhost:3000/icons/yoom-logo.svg", // Moved inside variables
          socialButtonsVariant: "iconButton", // This is correctly placed
        },
      }}
    >

{/* `       <UserTokenProvider> */}
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-dark-2`}>
            {children}
            <Toaster />
          </body>
        {/* </UserTokenProvider> */}
      </ClerkProvider>
    </html>
  );
}
