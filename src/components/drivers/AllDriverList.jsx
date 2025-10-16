import React, { useState } from 'react'
import DriverDetailsModal from './DriverDetailsModal';

const vendorData = [
  {
    date: 'Jul 5, 2025',
    name: 'Guy Hawkins',
    carName: 'Toyota Prius',
    location: '6391 Elgin St. Celina',
    carNumber: 'ABC-1234',
    isActive: true
  },
  {
    date: 'Jul 7, 2025',
    name: 'Ronald Richards',
    carName: 'Honda Civic',
    location: '6391 Elgin St. Celina',
    carNumber: 'XYZ-5678',
    isActive: false
  },
  {
    date: 'Jul 8, 2025',
    name: 'Kristin Watson',
    carName: 'Ford Focus',
    location: '6391 Elgin St. Celina',
    carNumber: 'DEF-9012',
    isActive: true
  },
  {
    date: 'Jul 9, 2025',
    name: 'Theresa Webb',
    carName: 'Chevrolet Malibu',
    location: '6391 Elgin St. Celina',
    carNumber: 'GHI-3456',
    isActive: false
  },
  {
    date: 'Jul 10, 2025',
    name: 'Floyd Miles',
    carName: 'Nissan Altima',
    location: '6391 Elgin St. Celina',
    carNumber: 'JKL-7890',
    isActive: true
  },
  {
    date: 'Jul 12, 2025',
    name: 'Brooklyn Simmons',
    carName: 'Hyundai Elantra',
    location: '6391 Elgin St. Celina',
    carNumber: 'MNO-2345',
    isActive: true
  },
  {
    date: 'Jul 14, 2025',
    name: 'Esther Howard',
    carName: 'Kia Forte',
    location: '6391 Elgin St. Celina',
    carNumber: 'PQR-6789',
    isActive: false
  },
  {
    date: 'Jul 15, 2025',
    name: 'Dianne Russell',
    carName: 'Mazda 3',
    location: '6391 Elgin St. Celina',
    carNumber: 'STU-0123',
    isActive: true
  },
  {
    date: 'Jul 15, 2025',
    name: 'Kathryn Murphy',
    carName: 'Volkswagen Jetta',
    location: '6391 Elgin St. Celina',
    carNumber: 'VWX-4567',
    isActive: false
  }
];



const AllDriverList = () => {
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
    <div class="my-5">

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
      <h2 class="text-[26px] font-semibold  md:mb-0">All vendor list</h2>
      <div class="relative w-full md:w-auto">
        <input 
  type="text" 
  placeholder="Search for something" 
  class="pl-10 pr-4 py-2 rounded-[100px] w-full md:w-64  bg-white
         shadow-sm focus:outline-none"
/>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg p-2">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Date</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Name</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Location</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Car Brand</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Car Number</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody >
  {vendorData.map((item, index) => (
    <tr
      key={index}
      class="odd:bg-transparent even:bg-white"
    >
      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">{item.date}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.name}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.location}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.carName}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.carNumber}</td>
      <td class="px-3 py-4 space-x-4 whitespace-nowrap text-sm font-medium">
        <span className={`font-normal ${item.isActive ? 'text-[#55A946]' : 'text-[#EA0C0C]'} `}>
           {item.isActive ? 'Online' : 'Offline'}
        </span>
        <button onClick={openModal} class="bg-[#FF8C00] font-medium text-sm py-2 px-4 rounded-[10px]">
          See Details
        </button>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>

</div>
     {isModalOpen && <DriverDetailsModal closeModal={closeModal} />}
    </>
  )
}

export default AllDriverList;
