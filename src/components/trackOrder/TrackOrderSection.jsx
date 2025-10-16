import React from "react";

const TrackOrderSection = () => {
  return (
    <div className="min-h-screen">
      <h2 className="text-lg font-semibold mb-6 text-[#343C6A]">
        Order Overview
      </h2>

      <div className="flex gap-5 rounded-lg w-full ">
        {/* Left Side: Order List */}
        <div className="w-1/3 flex flex-col">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by order name"
              className="w-full py-4 pl-12 bg-[#FFFFFF]   rounded-[40px] 
              focus:outline-none  text-sm placeholder-[#3C3C3C]"
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 absolute left-4 top-1/2 
              transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="space-y-4 overflow-y-auto">
            {/* Active Order Card */}
            <div
              className="bg-[#0168B8] text-white p-4 rounded-[10px]  
           relative space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-normal">Order ID ORD12345</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#fff"
                  height="24px"
                  width="24px"
                  viewBox="0 0 458 458"
                >
                  <g>
                    <g>
                      <path
                        d="M428,41.534H30c-16.569,0-30,13.431-30,30v252c0,16.568,13.432,30,30,30h132.1l43.942,52.243    
          c5.7,6.777,14.103,10.69,22.959,10.69c8.856,0,17.258-3.912,22.959-10.69l43.942-52.243H428c16.568,0,30-13.432,30-30v-252    
          C458,54.965,444.568,41.534,428,41.534z M323.916,281.534H82.854c-8.284,0-15-6.716-15-15s6.716-15,15-15h241.062    
          c8.284,0,15,6.716,15,15S332.2,281.534,323.916,281.534z M67.854,198.755c0-8.284,6.716-15,15-15h185.103c8.284,0,15,6.716,15,15    
          s-6.716,15-15,15H82.854C74.57,213.755,67.854,207.039,67.854,198.755z M375.146,145.974H82.854c-8.284,0-15-6.716-15-15    
          s6.716-15,15-15h292.291c8.284,0,15,6.716,15,15C390.146,139.258,383.43,145.974,375.146,145.974z"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://i.ibb.co.com/WNcDtfmZ/Ellipse-36.png"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-normal text-sm">Wade Warren</span>
              </div>
              <div className="h-7 border-l border-white"></div>
            </div>

            {/* Inactive Order Card = 1 */}
            <div
              className="bg-[#FFFFFF] text-[#151515] 
            p-4 rounded-[10px]  
            cursor-pointer relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-normal">Order ID ORD12345</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#151515"
                  height="24px"
                  width="24px"
                  viewBox="0 0 458 458"
                >
                  <g>
                    <g>
                      <path
                        d="M428,41.534H30c-16.569,0-30,13.431-30,30v252c0,16.568,13.432,30,30,30h132.1l43.942,52.243    
          c5.7,6.777,14.103,10.69,22.959,10.69c8.856,0,17.258-3.912,22.959-10.69l43.942-52.243H428c16.568,0,30-13.432,30-30v-252    
          C458,54.965,444.568,41.534,428,41.534z M323.916,281.534H82.854c-8.284,0-15-6.716-15-15s6.716-15,15-15h241.062    
          c8.284,0,15,6.716,15,15S332.2,281.534,323.916,281.534z M67.854,198.755c0-8.284,6.716-15,15-15h185.103c8.284,0,15,6.716,15,15    
          s-6.716,15-15,15H82.854C74.57,213.755,67.854,207.039,67.854,198.755z M375.146,145.974H82.854c-8.284,0-15-6.716-15-15    
          s6.716-15,15-15h292.291c8.284,0,15,6.716,15,15C390.146,139.258,383.43,145.974,375.146,145.974z"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://i.ibb.co.com/WNcDtfmZ/Ellipse-36.png"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-normal text-sm">Wade Warren</span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#151515]">
                  From: 288 Thorndige Cir. Syracuse, Connecticut
                </p>
                <div className="h-6 border-l border-[#818181]"></div>
                <p className="text-xs text-[#151515]">
                  Destination: 288 Thorndige Cir. Syracuse, 334567
                </p>
              </div>
            </div>
            {/* Inactive Order Card = 2 */}
            <div
              className="bg-[#FFFFFF] text-[#151515] 
            p-4 rounded-[10px]  
            cursor-pointer relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-normal">Order ID ORD12345</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#151515"
                  height="24px"
                  width="24px"
                  viewBox="0 0 458 458"
                >
                  <g>
                    <g>
                      <path
                        d="M428,41.534H30c-16.569,0-30,13.431-30,30v252c0,16.568,13.432,30,30,30h132.1l43.942,52.243    
          c5.7,6.777,14.103,10.69,22.959,10.69c8.856,0,17.258-3.912,22.959-10.69l43.942-52.243H428c16.568,0,30-13.432,30-30v-252    
          C458,54.965,444.568,41.534,428,41.534z M323.916,281.534H82.854c-8.284,0-15-6.716-15-15s6.716-15,15-15h241.062    
          c8.284,0,15,6.716,15,15S332.2,281.534,323.916,281.534z M67.854,198.755c0-8.284,6.716-15,15-15h185.103c8.284,0,15,6.716,15,15    
          s-6.716,15-15,15H82.854C74.57,213.755,67.854,207.039,67.854,198.755z M375.146,145.974H82.854c-8.284,0-15-6.716-15-15    
          s6.716-15,15-15h292.291c8.284,0,15,6.716,15,15C390.146,139.258,383.43,145.974,375.146,145.974z"
                      />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://i.ibb.co.com/WNcDtfmZ/Ellipse-36.png"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-normal text-sm">Wade Warren</span>
              </div>
              <div className="mt-3">
                <p className="text-xs text-[#151515]">
                  From: 288 Thorndige Cir. Syracuse, Connecticut
                </p>
                <div className="h-6 border-l border-[#818181]"></div>
                <p className="text-xs text-[#151515]">
                  Destination: 288 Thorndige Cir. Syracuse, 334567
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Details */}
        <div className="w-2/3 flex rounded-[10px] bg-[#FFFFFF]">
          {/* right side packed details */}

          <div className="w-4/7 p-4">
            {/* Progress Bar */}
            <div className="relative   flex items-center justify-between mb-4">
  {/* Full Bar Background */}
  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 rounded-full -translate-y-1/2 z-0" />

  {/* Progress Fill (adjust width dynamically if needed) */}
  <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#64748b] via-[#004CFF] to-[#003158] rounded-full -translate-y-1/2 z-0"
    style={{ width: "100%" }} 
  />

  {/* First Dot */}
  <div className="relative z-10 w-5 h-5 bg-white border-2 border-[#64748B] rounded-full flex items-center justify-center shadow-md">
    <div className="w-3 h-3 bg-[#64748B] rounded-full" />
  </div>

  {/* Second Dot */}
  <div className="relative z-10 w-5 h-5 bg-white border-2 border-[#004CFF] rounded-full flex items-center justify-center shadow-md">
    <div className="w-3 h-3 bg-[#004CFF] rounded-full" />
  </div>

  {/* Third Dot */}
  <div className="relative z-10 w-5 h-5 bg-white border-2 border-[#003158] rounded-full flex items-center justify-center shadow-md">
    <div className="w-3 h-3 bg-[#003158] rounded-full" />
  </div>
</div>


            {/* Tracking Status */}
            <div className="flex-1 overflow-y-auto mt-8">
              <div className="space-y-6">
              <h3 className="text-2xl font-medium text-[#0168B8]">Packed</h3>

                <div className="bg-[#F9F9F9] rounded-[10px] p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#202020] font-semibold">
                      Tracking Number
                    </span>
                     <button className="cursor-pointer"><svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 0 32 32"
    fill="#0B1719"
  >
    <path d="M10,6c0,0.552,0.448,1,1,1h10c0.552,0,1-0.448,1-1V3c0-0.552-0.448-1-1-1h-2.184 
      C18.403,0.837,17.304,0,16,0s-2.403,0.837-2.816,2H11c-0.552,0-1,0.448-1,1V6z M28,6v23c0,1.657-1.343,3-3,3H7
      c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h2v2H7C6.448,5,6,5.448,6,6v23c0,0.552,0.448,1,1,1h18c0.552,0,1-0.448,1-1V6
      c0-0.552-0.448-1-1-1h-2V3h2C26.657,3,28,4.343,28,6z M23,6c0,1.103-0.897,2-2,2H11C9.897,8,9,7.103,9,6H7v23h18V6H23z
      M19.5,19h-7c-0.276,0-0.5-0.224-0.5-0.5c0-0.276,0.224-0.5,0.5-0.5h7c0.276,0,0.5,0.224,0.5,0.5
      C20,18.776,19.776,19,19.5,19z M19.5,17h-7c-0.276,0-0.5-0.224-0.5-0.5c0-0.276,0.224-0.5,0.5-0.5h7
      c0.276,0,0.5,0.224,0.5,0.5C20,16.776,19.776,17,19.5,17z M19.5,15h-7c-0.276,0-0.5-0.224-0.5-0.5
      c0-0.276,0.224-0.5,0.5-0.5h7c0.276,0,0.5,0.224,0.5,0.5C20,14.776,19.776,15,19.5,15z"/>
  </svg></button>
                    
                  </div>
                  <p className="font-normal text-xs text-[#000000]">
                    LGB-82827638360076378
                  </p>
                </div>

                {/* Timeline */}
                <div className="">
                  {/* Packed event */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#000000]">Packed</p>
                      <span className="text-xs rounded-[4px] bg-[#F9F9F9] px-2 py-0.5">
                        Apr 19 12:30
                      </span>
                    </div>
                    <p className="text-xs font-normal mt-0.5">
                      Your parcel is packed and will be handed over to our
                      delivery partner.
                    </p>
                  </div>

                  {/* On the way event */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#000000]">On the Way to Logistic Facility</p>
                      <span className="text-xs rounded-[4px] bg-[#F9F9F9] px-2 py-0.5">
                        April,19 16:20
                      </span>
                    </div>
                    <p className="text-xs font-normal mt-0.5">
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.
                    </p>
                  </div>

                  {/* Arrived event */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#000000]">Arrived at Logistic Facility</p>
                      <span className="text-xs rounded-[4px] bg-[#F9F9F9] px-2 py-0.5">
                        April,19 19:07
                      </span>
                    </div>
                    <p className="text-xs font-normal mt-0.5">
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.
                    </p>
                  </div>

                  {/* Shipped event (Future) */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-[#8AB3D3]">Arrived at Logistic Facility</p>
                      <span className="text-xs text-[#5490BF] rounded-[4px] bg-[#E6F0F8] px-2 py-0.5">
                        April,19 19:07
                      </span>
                    </div>
                    <p className="text-xs text-[#8AB3D3] font-normal mt-0.5">
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="mx-1 h-full border-1  border-[#929292]" />

          {/* right side pickup location and products */}
          <div className="w-3/7 p-4">
            {/* pickup location  */}
            <div className="space-y-1">
              <p className="text-xs font-normal text-[#767676]">Pick up location</p>
              <p className="text-lg font-medium text-[#525252]">2118 Thorndige Cir. Syracuse, 3508</p>
            </div>

            {/* Product List */}
            <div className="mb-6 mt-4">
              <h3 className="text-lg font-semibold mb-4 text-[#2D2D2D]">
                Product list
              </h3>
              <div className="space-y-4">
                {/* Product Item */}
                <div className="flex items-center space-x-4 ">
                  <img src="https://i.ibb.co.com/Qv7j2mL4/Rectangle-1.png" alt="MacBook Pro" 
                  className="w-17 h-17  object-cover rounded-[10px]" />
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <p className="font-normal  text-[#344054]">MacBook Pro 14"</p>
                     <div className="-space-y-1.5">
                      <p className="text-xs text-[#1D2939] ">$2599.00</p>
                      <span className="text-[10px] font-semibold text-[#667085] "> Qty: 1</span>
                     </div>
                  </div>
              </div>
                {/* Product Item */}
                <div className="flex items-center space-x-4 ">
                  <img src="https://i.ibb.co.com/Qv7j2mL4/Rectangle-1.png" alt="MacBook Pro" 
                  className="w-17 h-17  object-cover rounded-[10px]" />
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <p className="font-normal  text-[#344054]">MacBook Pro 14"</p>
                     <div className="-space-y-1.5">
                      <p className="text-xs text-[#1D2939] ">$2599.00</p>
                      <span className="text-[10px] font-semibold text-[#667085] "> Qty: 1</span>
                     </div>
                  </div>
              </div>
                {/* Product Item */}
                <div className="flex items-center space-x-4 ">
                  <img src="https://i.ibb.co.com/Qv7j2mL4/Rectangle-1.png" alt="MacBook Pro" 
                  className="w-17 h-17  object-cover rounded-[10px]" />
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <p className="font-normal  text-[#344054]">MacBook Pro 14"</p>
                     <div className="-space-y-1.5">
                      <p className="text-xs text-[#1D2939] ">$2599.00</p>
                      <span className="text-[10px] font-semibold text-[#667085] "> Qty: 1</span>
                     </div>
                  </div>
              </div>

              </div>
            </div>

            

            {/* Delivery Address */}
            <div>
            <h3 className="text-lg font-medium mb-2">Delivery</h3>
            <p className="text-sm font-normal text-[#667085]">Address</p>
            <p className="text-lg font-medium text-[#5D5D5D]">847 Jewess Bridge Apt. 174 London, UK,474-769-3919</p>
      
          </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrackOrderSection;
