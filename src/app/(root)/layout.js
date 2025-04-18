'use client';

import StreamVideoProvider from '../../../providers/StreamClientProvider';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Loader from "@/components/Loader";

const RootLayout = ({ children }) => {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <Loader />; // Or null if you prefer no spinner
  }

  return (
    <main>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  );
};

export default RootLayout;
