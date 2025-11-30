// src/components/drivers/DriverSearchBar.jsx
import React from 'react';

const DriverSearchBar = ({
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  onSubmit,
  loading,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="flex  
    items-center justify-center p-4 bg-[#37526D]
    rounded-full  max-w-4xl mx-auto">
      <div className="flex flex-grow  
      w-auto space-x-5  rounded-full p-2">
        {/* Pickup Location Input */}
        <div className="flex bg-[#FFFFFF]  rounded-[10px] items-center w-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-gray-500 ml-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Pick up location"
            className="w-full px-3 py-1 font-normal text-[#676767]
             placeholder-gray-400 bg-white rounded-full focus:outline-none"
            value={pickup}
            onChange={(e) => onPickupChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Destination Input */}
        <div className="flex bg-[#FFFFFF] p-2 rounded-[10px] items-center w-1/2 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-500 ml-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a6 6 0 00-6 6c0 1.25.4 2.45 1.15 3.35L10 18l4.85-6.65A6 6 0 0010 2zM10 10a2 2 0 110-4 2 2 0 010 4z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Destination"
            className="w-full px-3 py-1 font-normal text-[#676767]
             placeholder-gray-400 bg-white rounded-full focus:outline-none"
            value={drop}
            onChange={(e) => onDropChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-shrink-0   cursor-pointer
      px-6 py-3.5   font-medium bg-[#FF8C00] text-[#002440]
       rounded-[100px] transition-colors duration-200 disabled:opacity-60"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
};

export default DriverSearchBar;
