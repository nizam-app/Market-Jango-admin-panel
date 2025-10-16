import React, { useState } from 'react';
import ProductModal from './ProductModal';

const ProductSection = () => {
  const data = [
    {
      date: 'Dec 30, 2019 05:18',
      vendor: 'Abstergo Ltd.',
      product: 'Renuar',
      location: '3605 Parker Rd.',
      action: 'See Details',
      accepted: false,
    },
    {
      date: 'Dec 4, 2019 21:42',
      vendor: 'Abstergo Ltd.',
      product: 'Renuar',
      location: '8080 Railroad St.',
      action: 'See Details',
      accepted: true,
    },
    {
      date: 'Dec 30, 2019 05:18',
      vendor: 'Binford Ltd.',
      product: 'Renuar',
      location: '8080 Railroad St.',
      action: 'See Details',
      accepted: false,
    },
    {
      date: 'Dec 30, 2019 07:52',
      vendor: 'Binford Ltd.',
      product: 'American Eagle',
      location: '8080 Railroad St.',
      action: 'See Details',
      accepted: false,
    },
    {
      date: 'Feb 2, 2019 19:28',
      vendor: 'Binford Ltd.',
      product: 'H&M',
      location: '7529 E. Pecan St.',
      action: 'See Details',
      accepted: true,
    },
    {
      date: 'Feb 2, 2019 19:28',
      vendor: 'Barone LLC.',
      product: 'Bershka',
      location: '3890 Poplar Dr.',
      action: 'See Details',
      accepted: false,
    },
    {
      date: 'Dec 30, 2019 07:52',
      vendor: 'Big Kahuna Burger Ltd.',
      product: 'Renuar',
      location: '8080 Railroad St.',
      action: 'See Details',
      accepted: false,
    },
  ];

  // modal settings
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
  <> 
    <div className="">
      <h2 className="text-2xl font-semibold mb-4">Product Requested vendor</h2>
       <div className="overflow-x-auto rounded-[8px] ">
  <table className="min-w-full ">
    <thead className="bg-white">
      <tr>
        <th className="p-2 text-left font-normal tracking-wider">Date</th>
        <th className="p-2 text-left font-normal tracking-wider">Vendor Name</th>
        <th className="p-2 text-left font-normal tracking-wider">Product Name</th>
        <th className="p-2 text-left font-normal tracking-wider">Location</th>
        <th className="p-2 text-left font-normal tracking-wider">Action</th>
      </tr>
    </thead>
    <tbody className="divide-y-[5px] divide-white">
       {data.map((row, index) => (
              <tr key={index} >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-normal ">{row.date}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">{row.vendor}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">{row.product}</td>
                <td className="px-2 py-4 whitespace-nowrap text-sm font-normal">{row.location}</td>
                <td className="px-2 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" 
                      fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </span>
                      <span className="text-green-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>
                    <button  onClick={openModal}
                    className="px-4 py-2 cursor-pointer font-medium text-xs  bg-[#FF8C00] 
                    rounded-[10px]">
                       See Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
    </tbody>
  </table>
</div>
    </div>
            {isModalOpen && <ProductModal closeModal={closeModal} />}
    </> 
  );
};

export default ProductSection;