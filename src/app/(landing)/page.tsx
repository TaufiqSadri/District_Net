import Banner from "./components/Banner";
import Hero from "./components/Hero";
import PackageSection from "./components/PackageSection";
import RecoveryRedirect from "./RecoveryRedirect";
import SubscribeSteps from "./components/SubscribeSteps";
export const dynamic = 'force-static'

export default function Home() {
  return (
    <>
      <RecoveryRedirect />
      <main>
        <Banner />
        <Hero />
        <SubscribeSteps />
        <PackageSection />
      </main>
    </>
  );
}
