// src/components/home/FlashSale.jsx
import SelectSection from "./SelectSection";
// import { getAllProducts } from "../../api/dashboardAPI";

const FlashSale = () => {
  return (
    <SelectSection
      title="Select Flash Sale" // চাইলে বদলে "Select Flash Sale Products"
      fetchItems={[]}
      saveSelection='coming soon.....'
      maxSelect={4}
    />
  );
};

export default FlashSale;
