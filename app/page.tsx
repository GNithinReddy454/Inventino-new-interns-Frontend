import Hero from "./components/Hero";
import About from "./components/About";
import ShopByCategory from "./components/ShopByCategory";
import BestSellers from "./components/BestSellers";
import FeaturedCollection from "./components/FeaturedCollection";
import TryBeforeYouBuy from "./components/TryBeforeYouBuy";
import CorporateGifting from "./components/CorporateGifting";

export default function Home() {
  return (
<<<<<<< HEAD
    <main>
      {/* The Hero usually takes full width, so we keep it outside the padding container */}
      <Hero />
      
      {/* Wrap the rest of the sections in a container for consistent spacing */}
      <div className="px-6 md:px-16 py-12 space-y-16">
        <About />
        <ShopByCategory />
        <BestSellers />
        <FeaturedCollection />
        <TryBeforeYouBuy />
        <CorporateGifting />
      </div>
    </main>
=======
    <div>
      <Hero />
      <About />
      <ShopByCategory />
      <BestSellers />
      <FeaturedCollection />
      <TryBeforeYouBuy />
      <CorporateGifting />
    </div>
>>>>>>> 51708237cfc8e83e1495911b650bb94f3a4ab151
  );
}