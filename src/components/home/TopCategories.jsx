// src/components/home/TopCategories.jsx
import SelectSection from "./SelectSection";
import {
  fetchTopCategoriesItems,
  saveAdminSelectBulk,
} from "../../api/dashboardAPI";

const TopCategories = () => {
  return (
    <SelectSection
      title="Select top Categories"
      fetchItems={fetchTopCategoriesItems}
      saveSelection={(ids) => saveAdminSelectBulk("top_category", ids)}
      maxSelect={4}
    />
  );
};

export default TopCategories;
