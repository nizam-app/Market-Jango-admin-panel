import React from 'react';

const ProductModal = ({ closeModal }) => {
  return (
    <div onClick={closeModal} className="fixed inset-0 bg-black/40 flex justify-center z-50">

      <div onClick={(e)=>e.stopPropagation()}  className="bg-white mt-15 rounded-lg shadow-xl 
      w-full h-[85vh] max-w-3xl mx-4 overflow-hidden">
        
        {/* Scrollable Content with hidden scrollbar */}
        <div className="h-full overflow-y-auto  custom-scroll">
          {/* Header with Close Button */}
          <div className="relative">
            <img
              src="https://i.ibb.co.com/xtzRb667/unsplash-3-Q3ts-J01nc.png"
              alt="Woman in fashion clothes"
              className="w-full h-80 object-cover rounded-t-lg"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-[40px] h-[40px] bg-[#E2E2E2] bg-opacity-80 
              rounded-full text-[#000000] text-[26px] cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6">
            <div className="flex space-x-2 mb-4">
              <span className="bg-[#FF8C00]  
              font-medium text-sm py-2.5 px-3.5  rounded-[100px]">Fashion</span>
              <span className="bg-[#FF8C00]  
              font-medium text-sm py-2.5 px-3.5  rounded-[100px]">T-shirt</span>
            </div>

            <h2 className="text-2xl font-medium mb-2">Everyday Elegance in Women's Fashion</h2>
            <p className="font-normal mb-4">
              Discover a curated collection of stylish and fashionable women's dresses designed for every mood and moment. From elegant evenings to everyday charm — dress to impress.
            </p>

            <p className="text-[26px] font-medium mb-4">$15,00</p>

            <div className="flex space-x-8 mb-6">
              <div>
                <p className="font-medium text-[22px]  ">Size</p>
                <div className="flex space-x-2 rounded-[24px] px-5 py-3 bg-[#E7EBEE]">
                  <span className="px-3 text-[#0168B8] py-1 rounded-md cursor-pointer">L</span>
                  <span className="px-3 text-[#0168B8] py-1 rounded-md cursor-pointer">XL</span>
                  <span className="px-3 text-[#0168B8] py-1 rounded-md cursor-pointer">2XL</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-[22px] ">Color</p>
                <div className="flex space-x-2 mt-2.5">
                  <span className="w-6 h-6 rounded-full bg-black border-2 border-blue-500"></span>
                  <span className="w-6 h-6 rounded-full bg-blue-500"></span>
                  <span className="w-6 h-6 rounded-full bg-red-500"></span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-medium text-2xl mb-2">Specifications</p>
              <p className="mb-2">Material:</p>
              <div className="flex space-x-2">
                <span className="bg-[#FCDFA2] px-2 py-0.5 rounded-[4px] text-sm font-medium">Cotton 95%</span>
                <span className="bg-[#FCDFA2] px-2 py-0.5 rounded-[4px] text-sm font-medium">Nylon 5%</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <img
                src="https://i.ibb.co.com/kgryPT7h/boy.png"
                alt="Store Avatar"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <p className="font-normal text-sm">R2A Store</p>
                <p className="text-[#0D4373] font-normal text-xs">Member Since December 2014</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="py-2 px-8 cursor-pointer bg-[#EA0C0C]
               text-white font-medium rounded-[100px]">
                Canceled
              </button>
              <button className="py-2 px-8 cursor-pointer bg-[#55A946]
               text-[#051522] font-medium rounded-[100px]">
                Approved
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductModal;
