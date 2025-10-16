import React, { useState } from 'react'

const categories = [
  "Shoes", "Hoodies", "Electronics", "Watches", "car", "Property",
  "Shoes", "Hoodies", "Electronics", "Watches", "car", "Property",
  "Shoes", "Hoodies", "Electronics", "Watches", "car", "Property",
];

const TopCategories = () => {
  const [selectedCategories, setSelectedCategories] = useState(["Property"]);

  const toggleCategory = (category) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category)
        ? prevSelected.filter((c) => c !== category)
        : [...prevSelected, category]
    );
  };

  const applyCategories = () => {
    console.log("Selected categories:", selectedCategories);
    // You can save them to backend or local storage as needed
  };

  return (
    <>
      <div className="mt-10">
        {/* Heading + Search */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-medium">Select top Categories</h2>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for something"
              className="pl-13 py-3 rounded-[40px] bg-white text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-7 gap-5">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-[10px] border 
                border-[#FF8C00] text-sm font-medium transition cursor-pointer
                ${selectedCategories.includes(category)
                  ? 'bg-[#FF8C00] text-white'
                  : 'text-[#051522] bg-white'}
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={applyCategories}
            className="bg-[#0168B8] cursor-pointer text-white 
            px-6 py-3 rounded-[100px] font-medium transition"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default TopCategories;
