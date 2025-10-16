import React from 'react';

const DriverCard = ({ name, phone, address, price, isOnline, image }) => {
  return (
    <div className="bg-[#FFFFFF] rounded-[10px]  
    px-4 py-3 flex flex-col relative">
      {/* upper content */}
      <div className="flex items-center space-x-4">
        {/* Profile Image with Status Indicator */}
        <div className="">
          <img
            src={image}
            alt={name}
            className="w-20 h-20 rounded-[18px] bg-green-500 object-cover"
          />
        </div>

        {/* Driver Info */}
        <div className="flex-grow space-y-2">
          <h3 className="text-sm text-[#1F1F1F] font-semibold ">{name}</h3>
          <p className="text-[#3A3A3A] text-xs">{phone}</p>
          <p className="text-[#3A3A3A] text-[10px]">{address}</p>
        </div>

        {/* Price Tag */}
        <div className="flex-shrink-0">
          <span className="text-2xl font-medium text-[#1F1F1F]">{price}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4 mt-4">
        <button className="flex-grow px-4 py-2 font-medium 
        text-[#051522] bg-[#FF8C00] rounded-[8px] 
        transition-colors duration-200 cursor-pointer">
          Assign order
        </button>
        <button className="flex-grow px-4 py-2 font-medium 
        text-[#FFFFFF] bg-[#0168B8] rounded-[8px] 
        transition-colors duration-200 cursor-pointer">
          View details
        </button>
  
      </div>

      {/* status badge */}
        <div
            className={`absolute
              right-3 top-3 px-2 py-0.5 rounded-[50px] text-[9px]  border-white
               bg-[#00C27A] 
            }`}
          >
            Online
          </div>
    </div>
  );
};

export default DriverCard;