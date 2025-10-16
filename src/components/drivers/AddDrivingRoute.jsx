import React from 'react'

const AddDrivingRoute = () => {
  return (
    <>
    {/* Add Driving Route Section */}
      <div className="mb-8 pb-8">
        <h2 className="text-[26px] font-semibold mb-6 ">Add Driving Route</h2>
        <div className="flex gap-4 max-w-3xl">
          <input
            type="text"
            placeholder="Type Location"
            className="flex-1 bg-[#FFFFFF] p-3 pl-4 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          />
          <select
            className="flex-1 bg-[#FFFFFF] p-3 text-sm font-normal 
             focus:outline-none rounded-[100px]"
          >
            <option>Select Route</option>
            <option>Select Route</option>
            <option>Select Route</option>
          </select>
          <button className="ml-5  bg-[#0D3250] text-white font-medium
          py-3 px-7 rounded-[100px] cursor-pointer text-sm">
            Add Route
          </button>
        </div>
      </div>
    
    </>
  )
}

export default AddDrivingRoute
