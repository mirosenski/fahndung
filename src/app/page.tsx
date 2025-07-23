import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import HomeContent from "~/components/home/HomeContent";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="home" />
      <HomeContent />
      <Footer variant="home" />
    </main>
  );
}
