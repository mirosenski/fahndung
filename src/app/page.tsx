"use client";

import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import HomeContent from "~/components/home/HomeContent";
import { GlobalBackground } from "~/components/ui/GlobalBackground";
import { useAuth } from "~/hooks/useAuth";

export default function Home() {
  const { session } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <GlobalBackground />
      <Header variant="home" session={session} />
      <HomeContent />
      <Footer variant="home" />
    </main>
  );
}
