import Hero from "./components/Hero";
import About from "./components/About";
import ShopByCategory from "./components/ShopByCategory";
import BestSellers from "./components/BestSellers";
import FeaturedCollection from "./components/FeaturedCollection";
import TryBeforeYouBuy from "./components/TryBeforeYouBuy";
import CorporateGifting from "./components/CorporateGifting";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <ShopByCategory />
      <BestSellers />
      <FeaturedCollection />
      <TryBeforeYouBuy />
      <CorporateGifting />
    </>
  );
}
