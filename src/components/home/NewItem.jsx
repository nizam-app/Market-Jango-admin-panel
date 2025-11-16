// src/components/home/NewItem.jsx
import SelectSection from "./SelectSection";
import {
  fetchNewItemsItems,
  saveAdminSelectBulk,
} from "../../api/dashboardAPI";

const NewItem = () => {
  return (
    <SelectSection
      title="Select New Items"
      fetchItems={fetchNewItemsItems}
      saveSelection={(ids) => saveAdminSelectBulk("new_item", ids)}
      maxSelect={4}
    />
  );
};

export default NewItem;
