const DriverDetailsModal = ({ closeModal }) => {
    const exampleDriverData = {
  profileImage: 'https://via.placeholder.com/100', // URL of the profile picture
  name: 'Md. Rahim Ahmed',
  phone: '(603) 555-0123',
  email: 'michelle.rahim@example.com',
  address: '4517 Washington Ave. Manchester, Kentucky 39495',
  about:
    'Rahim is an experienced and verified transporter under TrendLoop’s logistics network. With over 4 years of driving and delivery experience, he ensures safe, timely, and reliable transportation of goods across cities. He is committed to professional behavior, client satisfaction, and maintaining high standards in every delivery.',
  documents: [
    'https://via.placeholder.com/192x128', // URL for license image 1
    'https://via.placeholder.com/192x128', // URL for license image 2
    'https://via.placeholder.com/192x128', // URL for license image 3 (car plate)
  ],
  car: {
    brand: 'Toyota',
    model: 'Cross Corolla',
    images: [
      'https://via.placeholder.com/96x64', // URL for car image 1
      'https://via.placeholder.com/96x64', // URL for car image 2
      'https://via.placeholder.com/96x64', // URL for car image 3
      'https://via.placeholder.com/96x64', // URL for car image 4
      'https://via.placeholder.com/96x64', // URL for car image 5
    ],
  },
  routes: ['Austin', 'Fairfield', 'Naperville', 'Orange', 'Toledo'],
};

const carData = {
  brand: 'Toyota',
  model: 'Cross Corolla',
  images: [
    'https://via.placeholder.com/96x64', // Placeholder for a black car image
    'https://via.placeholder.com/96x64', // Placeholder for a black car image
    'https://via.placeholder.com/96x64', // Placeholder for a black car image
    'https://via.placeholder.com/96x64', // Placeholder for a black car image
    'https://via.placeholder.com/96x64', // Placeholder for a black car image
  ],
};
const driverData = {
    id: 1,
    name: 'Md. Rahim Ahmed',
    phone: '(603) 555-0123',
    email: 'michelle.rahim@example.com',
    address: '4517 Washington Ave. Manchester, Kentucky 39495',
    profileImage: 'https://via.placeholder.com/100/1e40af/ffffff?text=RA',
    about:
      'Rahim is an experienced and verified transporter under TrendLoop’s logistics network. With over 4 years of driving and delivery experience, he ensures safe, timely, and reliable transportation of goods across cities. He is committed to professional behavior, client satisfaction, and maintaining high standards in every delivery.',
    documents: [
      'https://via.placeholder.com/192x128/9ca3af/ffffff?text=License+1',
      'https://via.placeholder.com/192x128/9ca3af/ffffff?text=License+2',
      'https://via.placeholder.com/192x128/9ca3af/ffffff?text=License+3',
    ],
    car: {
      brand: 'Toyota',
      model: 'Cross Corolla',
      images: [
        'https://via.placeholder.com/96x64/000000/ffffff?text=Car+1',
        'https://via.placeholder.com/96x64/000000/ffffff?text=Car+2',
        'https://via.placeholder.com/96x64/000000/ffffff?text=Car+3',
        'https://via.placeholder.com/96x64/000000/ffffff?text=Car+4',
        'https://via.placeholder.com/96x64/000000/ffffff?text=Car+5',
      ],
    },
    routes: ['Austin', 'Fairfield', 'Naperville', 'Orange', 'Toledo'],
  }
  return (
    <div onClick={closeModal} className="fixed inset-0 bg-black/40 flex justify-center z-50">

      <div onClick={(e)=>e.stopPropagation()}  className="bg-white mt-15 rounded-lg 
      w-full h-[85vh] max-w-4xl mx-4 overflow-hidden">
        
        {/* Scrollable Content with hidden scrollbar */}
        <div className="h-full overflow-y-auto  custom-scroll">
          {/* Header with Close Button */}
          <div className="relative">
            <div className="flex items-center p-10">
          <img
            src="https://via.placeholder.com/80" 
            alt="Michelle Rivera"
            className="w-20 h-20 bg-green-400 rounded-full mr-4 object-cover"
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

                {/* License & Other Documents */}
        <div className="mt-6">
          <h3 className="text-[22px] font-medium mb-4">License & Other Documents</h3>
          <div className="flex flex-wrap  gap-3">
            {exampleDriverData.documents.map((doc, index) => (
              <div
                key={index}
                className="w-[260px] h-[200px] rounded overflow-hidden"
              >
                <img
                  src={doc}
                  alt={`Document ${index + 1}`}
                  className="object-cover w-full h-full border"
                />
              </div>
            ))}
          </div>
        </div>

            {/* Car Information */}
        <div className="mt-6">
          <div className="flex gap-10 mb-4">
            <div className="flex gap-2">
              <p className="text-sm font-bold ">Car Brand:</p>
              <p className="text-sm ">{driverData.car.brand}</p>
            </div>
            <div className="flex gap-2">
              <p className="text-sm font-bold ">Car Model:</p>
              <p className="text-sm ">{driverData.car.model}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4">Car Images</h3>
          <div className="flex flex-wrap justify-start gap-2">
            {driverData.car.images.map((img, index) => (
              <div
                key={index}
                className="w-[150px] h-[100px] bg-gray-100 border border-gray-300 rounded overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Car ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Driver Routes */}
        <div className="mt-6">
          <h3 className="text-lg font-bold  mb-2">Driver Routes</h3>
          <div className="flex flex-wrap gap-2">
            {driverData.routes.map((route, index) => (
              <span
                key={index}
                className="bg-gray-200 rounded-full px-4 py-1 text-sm font-medium"
              >
                {route}
              </span>
            ))}
          </div>
        </div>
       

            {/* action button   */}
            <div className="flex space-x-4 mt-7">
              <button className="py-2 px-8 cursor-pointer bg-[#FF8C00]
                font-medium rounded-[100px]">
                Assigend order
              </button>
            </div>

           


       
          </div>

        </div>
      </div>

    </div>
  );
};

export default DriverDetailsModal;