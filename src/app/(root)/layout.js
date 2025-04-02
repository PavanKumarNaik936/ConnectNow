import { ReactNode } from 'react';
import StreamVideoProvider from '../../../providers/StreamClientProvider';

export const metadata = {
  title: "ConnectNow",
  description: "Video Conferencing tool",
  icons:{
    icon:'/icons/logo.svg'
  }
};


const RootLayout = ({ children }) => {
  return (
    <main>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  );
};

export default RootLayout;