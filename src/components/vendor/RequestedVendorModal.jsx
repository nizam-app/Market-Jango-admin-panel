import React from 'react';

const RequestedVendorModal = ({ closeModal }) => {
  return (
    <div onClick={closeModal} className="fixed inset-0 bg-black/40 flex justify-center z-50">

      <div onClick={(e)=>e.stopPropagation()}  className="bg-white mt-15 rounded-lg shadow-xl 
      w-full h-[85vh] max-w-3xl mx-4 overflow-hidden">
        
        {/* Scrollable Content with hidden scrollbar */}
        <div className="h-full overflow-y-auto  custom-scroll">
          {/* Header with Close Button */}
          <div className="relative">
            <div className="flex items-center p-10">
          <img
            src="https://i.ibb.co.com/4nryq5wt/Ellipse-34.png" 
            alt="Michelle Rivera"
            className="w-[130px] h-[130px]  rounded-full mr-4 object-cover"
          />
          <div className='space-y-1.5'>
            <h2 className="text-[26px] font-medium">TrendLoop</h2>
            <p className=" text-sm">(603) 555-0123</p>
            <p className=" text-sm">michelle.rivera@example.com</p>
            <p className="text-sm">4517 Washington Ave. Manchester, Kentucky 39495</p>
          </div>
            </div>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-[40px] h-[40px] bg-[#E2E2E2] bg-opacity-80 
              rounded-full text-[#000000] text-[26px] cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Content Body */}
          <div className="px-10 pb-10">
                {/* About This Vendor Section */}
                <div className="">
                <h3 className="text-[22px] font-medium  mb-2">About this vendor</h3>
                <p className="font-normal leading-relaxed">
                    TrendLoop is your all-in-one shopping destination for everything trendy and essential. From fashion to
                    electronics, home goods to personal care - we bring a wide range of quality products under one roof.
                    Whether you're looking for the latest gadgets or timeless lifestyle items, TrendLoop makes shopping easy,
                    reliable, and enjoyable.
                </p>
                </div>

         {/* Trade License & Other Documents Section */}
        <div className='mt-6' >
          <h3 className="text-[22px] font-medium mb-4">Trade license & Other Documents</h3>
          <div className="flex flex-wrap gap-4">
            {/* Document 1 */}
            <div className="w-64 h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
              <img
                src="https://i.ibb.co.com/4wRWv9sm/Rectangle-3999.png" // Replace with actual license image 1
                alt="Business License Certificate"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Document 2 */}
            <div className="w-64 h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
              <img
                src="https://i.ibb.co.com/5gsYgJBc/Rectangle-4000.png" // Replace with actual license image 2
                alt="State of Connecticut Business License"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

       

           
 <div className="flex space-x-4 mt-7">
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

export default RequestedVendorModal;

// extra vendor modal
// {/* Comment Section */}
//         <div className="p-6 pt-0">
//           <label htmlFor="comment" className="text-gray-800 font-semibold mb-2 block">Comment</label>
//           <textarea
//             id="comment"
//             rows="4"
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Type your comments here..."
//           ></textarea>
//         </div>

//         {/* Rating and Action Buttons */}
//         <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200">
//           {/* Star Rating */}
//           <div className="flex items-center">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <svg
//                 key={star}
//                 onClick={() => setRating(star)}
//                 className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
//                   star <= rating ? 'text-yellow-400' : 'text-gray-300'
//                 }`}
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.374 2.454a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.374-2.454a1 1 0 00-1.176 0l-3.374 2.454c-.785.57-1.84-.197-1.54-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.091 9.387c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69l1.286-3.96z" />
//               </svg>
//             ))}
//           </div>