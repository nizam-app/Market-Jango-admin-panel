// src/components/home/JustForYou.jsx
import SelectSection from "./SelectSection";
import {
  fetchJustForYouItems,
  saveAdminSelectBulk,
} from "../../api/dashboardAPI";

const JustForYou = () => {
  return (
    <SelectSection
      title="Select Just For you"
      fetchItems={fetchJustForYouItems}
      saveSelection={(ids) => saveAdminSelectBulk("just_for_you", ids)}
      maxSelect={4}
    />
  );
};

export default JustForYou;
