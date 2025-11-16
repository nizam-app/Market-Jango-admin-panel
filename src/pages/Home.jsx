// src/pages/Home.jsx
import Stats from "../components/home/Stats";
import Banner from "../components/home/Banner";
import TopCategories from "../components/home/TopCategories";
import TopProducts from "../components/home/TopProducts";
import FlashSale from "../components/home/FlashSale";
import NewItem from "../components/home/NewItem";
import JustForYou from "../components/home/JustForYou";

const Home = () => {
  return (
    <>
      <Stats />
      <Banner />
      <TopCategories />
      <TopProducts />
      <FlashSale />
      <NewItem />
      <JustForYou />
    </>
  );
};

export default Home;
