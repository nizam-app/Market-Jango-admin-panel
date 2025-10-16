import { useState } from "react";
import RequestedVendorModal from "./RequestedVendorModal";

const vendorData = [
  {
    date: 'Jul 5, 2025',
    name: 'Guy Hawkins',
    location: '6391 Elgin St. Celina',
    number: '(303) 555-0105',
    action: 'See Details'
  },
  {
    date: 'Jul 7, 2025',
    name: 'Ronald Richards',
    location: '6391 Elgin St. Celina',
    number: '(239) 555-0108',
    action: 'See Details'
  },
  {
    date: 'Jul 8, 2025',
    name: 'Kristin Watson',
    location: '6391 Elgin St. Celina',
    number: '(316) 555-0116',
    action: 'See Details'
  },
  {
    date: 'Jul 9, 2025',
    name: 'Theresa Webb',
    location: '6391 Elgin St. Celina',
    number: '(270) 555-0117',
    action: 'See Details'
  },
  {
    date: 'Jul 10, 2025',
    name: 'Floyd Miles',
    location: '6391 Elgin St. Celina',
    number: '(603) 555-0123',
    action: 'See Details'
  },
  {
    date: 'Jul 12, 2025',
    name: 'Brooklyn Simmons',
    location: '6391 Elgin St. Celina',
    number: '(319) 555-0115',
    action: 'See Details'
  },
  {
    date: 'Jul 14, 2025',
    name: 'Esther Howard',
    location: '6391 Elgin St. Celina',
    number: '(405) 555-0128',
    action: 'See Details'
  },
  {
    date: 'Jul 15, 2025',
    name: 'Dianne Russell',
    location: '6391 Elgin St. Celina',
    number: '(207) 555-0119',
    action: 'See Details'
  },
  {
    date: 'Jul 15, 2025',
    name: 'Kathryn Murphy',
    location: '6391 Elgin St. Celina',
    number: '(629) 555-0129',
    action: 'See Details'
  }
];

const RequestedVendor = () => {
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
    <div class="mt-7">

    <div class="mb-2">
      <h2 class="text-[26px] font-semibold  md:mb-0">Requested Vendor</h2>
    </div>

    <div class="overflow-x-auto rounded-lg">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Date</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Name</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Location</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Number</th>
            <th scope="col" class="px-2 py-3 text-left  font-normal uppercase tracking-wider">Action</th>
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
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.number}</td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[200px]">
  <div className="flex items-center space-x-2 flex-wrap">
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
     {isModalOpen && <RequestedVendorModal closeModal={closeModal} />}
    </>
  )
}
export default  RequestedVendor;