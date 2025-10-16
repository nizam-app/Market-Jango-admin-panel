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

const SuspendedDriver = () => {
  return (
    <>
    <div class="my-5">

    <div class="mb-2">
      <h2 class="text-[26px] font-semibold  md:mb-0">Suspended Vendor</h2>
    </div>

    <div class="overflow-x-auto rounded-lg ">
      <table class="min-w-full ">
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
      class="odd:bg-[#E6EEF6] even:bg-transparent"
    >
      <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">{item.date}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.name}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.location}</td>
      <td class="px-3 py-4 whitespace-nowrap text-sm">{item.number}</td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium max-w-[200px]">
  <div className="flex items-center space-x-2 flex-wrap">
                     <button className="cursor-pointer">
                       <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17"
      stroke="#EA0C0C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
                     </button>
                    <button  
                    className="px-4 py-2 cursor-pointer font-medium text-xs  bg-[#FF8C00] 
                    rounded-[10px]">
                     Restore Request
                    </button>
                    {/* onClick={openModal} */}
                  </div>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>

</div>
    </>
  )
}
export default  SuspendedDriver;