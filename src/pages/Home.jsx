// src/pages/Home.jsx
import Stats from "../components/home/Stats";
import Banner from "../components/home/Banner";
import AdminProductSelectPage from "../components/home/AdminProductSelectPage";

const Home = () => {
  return (
    <>
      <Stats />
      <Banner />
      {/* <ProductList /> */}
      <AdminProductSelectPage></AdminProductSelectPage>
    </>
  );
};

export default Home;
