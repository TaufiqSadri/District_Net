import Navbar from "./components/Navbar";
import Hero from "./landing-page/Hero";
import PackageSection from "./landing-page/PackageSection";
import SubscribeSteps from "./landing-page/SubscribeSteps";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SubscribeSteps />
        <PackageSection />
        <footer className="h-32 bg-brand-purple" />
      </main>
    </>
  );
}
