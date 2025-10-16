import React from 'react'

const Stats = () => {
    
    const stats =[
            { title: "Total Vendors", value: "1,247" },
            { title: "Vendor Requests", value: "247" },
            { title: "Total Drivers", value: "1,247" },
            { title: "Drivers Requests", value: "1,247" },
          ]
  return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[16px]
            border border-[#B0CCE2]">
              <p className="text-xl font-medium text-[#585555]">{item.title}</p>
              <h3 className="mt-5 text-4xl font-bold">{item.value}</h3>
            </div>
          ))}
        </div>
  )
}

export default Stats
