import React from "react";
import AvatarImage from "./AvatarImage";

const AboutMe = () => {
  return (
    <>
      <div className="flex justify-between ">
        <div className="flex gap-8 items-center">
          {/* Profile Picture */}
          <AvatarImage />
      
          <div className="space-y-1">
            <h1 className="text-[26px] font-medium text-[#337AB3]">Charlene Reed</h1>
            <p className="text-[#337AB3] text-sm font-normal ">@Charlene Reed</p>
            <p className="text-[#337AB3]  font-normal">charlenereed@gmail.com</p>
            <p className="text-[#337AB3] font-normal">(603) 555-0123</p>
          </div>
        </div>
        {/* address */}
        <div className="text-right space-y-1">
          <p className="text-[#232323] font-normal">Permanent Address</p>
          <p className="text-[#337AB3] text-sm font-normal">San Jose, California, USA</p>
          <p className="text-[#232323] font-normal mt-3">Present Address</p>
          <p className="text-[#337AB3] text-sm font-normal">San Jose, California, USA</p>
        </div>
      </div>

      {/* About Me Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-medium text-[#000000]">About Me</h2>
        <p className="mt-4 font-normal leading-relaxed">
          TrendLoop is your all-in-one shopping destination for everything
          trendy and essential. From fashion to electronics, home goods to
          personal care — we bring a wide range of quality products under one
          roof. Whether you’re looking for the latest gadgets or timeless
          lifestyle items, TrendLoop makes shopping easy, reliable, and
          enjoyable.
        </p>
      </div>
    </>
  );
};

export default AboutMe;
