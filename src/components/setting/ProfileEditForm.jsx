import React from "react";
import AvatarImage from "./AvatarImage";

const ProfileEditForm = () => {
  const userInfo = {
    name: "Charlene Reed",
    userName: "Charlene Reed",
    email: "charlenereed@gmail.com",
    password: "",
    dateOfBirth: "25 January 1990",
    presentAddress: "San Jose, California, USA",
    permanentAddress: "San Jose, California, USA",
    city: "San Jose",
    zip: 45962,
    country: "USA",
  };

  return (
    <div className="flex">
      {/* Profile Picture and form fields */}
      <div className="w-1/4">
        {/* Profile Picture */}
        <AvatarImage />
      </div>

      {/* Form Fields */}
      <div className="w-3/4 ">
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {/* name input field */}
          <div>
          <label
            htmlFor="name"
            className="block text-[#232323] font-normal mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            value={userInfo.name}
            name="name"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* username input field */}
          <div>
          <label
            htmlFor="username"
            className="block text-[#232323] font-normal mb-1"
          >
            Your Name
          </label>
          <input
            type="text"
            value={userInfo.userName}
            name="username"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* email input field */}
          <div>
          <label
            htmlFor="email"
            className="block text-[#232323] font-normal mb-1"
          >
            Email
          </label>
          <input
            type="email"
            value={userInfo.email}
            name="email"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* password input field */}
          <div>
          <label
            htmlFor="password"
            className="block text-[#232323] font-normal mb-1"
          >
            Password
          </label>
          <input
            type="password"
            value={userInfo.password}
            name="password"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* Date of Birth input field */}
          <div>
          <label
            htmlFor="dob"
            className="block text-[#232323] font-normal mb-1"
          >
            Date Of Birth
          </label>
          <input
            type="text"
            value={userInfo.dateOfBirth}
            name="dob"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* present address input field */}
          <div>
          <label
            htmlFor="presentAddress"
            className="block text-[#232323] font-normal mb-1"
          >
            Present Address
          </label>
          <input
            type="text"
            value={userInfo.presentAddress}
            name="presentAddress"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
          <div>
          <label
            htmlFor="permanentAddress"
            className="block text-[#232323] font-normal mb-1"
          >
            Permanent Address
          </label>
          <input
            type="text"
            value={userInfo.permanentAddress}
            name="permanentAddress"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* city input field */}

          <div>
          <label
            htmlFor="city"
            className="block text-[#232323] font-normal mb-1"
          >
            City
          </label>
          <input
            type="text"
            value={userInfo.city}
            name="city"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* post code input field */}
          <div>
          <label
            htmlFor="zip"
            className="block text-[#232323] font-normal mb-1"
          >
            Post Code
          </label>
          <input
            type="text"
            value={userInfo.zip}
            name="zip"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        {/* country input field */}
          <div>
          <label
            htmlFor="country"
            className="block text-[#232323] font-normal mb-1"
          >
            Country
          </label>
          <input
            type="text"
            value={userInfo.country}
            name="country"
            className="w-full px-4 py-3    border border-[#DFEAF2] focus:outline-none rounded-[15px] text-[#337AB3] font-normal "
          />
        </div>
        </div>

        {/* Save Button */}
      <div className="text-right mt-8">
        <button className="bg-[#FF8C00] cursor-pointer
        font-medium py-3 px-15 rounded-[15px]">
          Save
        </button>
      </div>
      </div>

      
    </div>
  );
};

export default ProfileEditForm;
