// src/components/home/TopProducts.jsx
import SelectSection from "./SelectSection";
import {
  fetchTopProductsItems,
  saveAdminSelectBulk,
} from "../../api/dashboardAPI";

const TopProducts = () => {
  return (
    <SelectSection
      title="Select top Products"
      fetchItems={fetchTopProductsItems}                  // nested → simple list
      saveSelection={(ids) => saveAdminSelectBulk("top_product", ids)}
      maxSelect={4}
    />
  );
};

export default TopProducts;
