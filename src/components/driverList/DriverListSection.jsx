import React from "react";
import DriverCard from "./DriverCard";
import DriverSearchBar from "./DriverSearchBar";

const driversData = [
  {
    name: "Nguyen, Shane",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Nguyen, Shane",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Nguyen, Shane",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Nguyen, Shane",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: false,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
  {
    name: "Henry, Arthur",
    phone: "+00123456789",
    address: "australia, road 19 house 1",
    price: "$48",
    isOnline: true,
    image: "https://i.ibb.co.com/JTQ5SWD/Image-105.png",
  },
];


const DriverListSection = () => {
  return (
    <div className="">
      <DriverSearchBar />
      <div className="grid grid-cols-3  gap-4 mt-8">
        {driversData.map((driver, index) => (
          <DriverCard key={index} {...driver} />
        ))}
      </div>
    </div>
  );
};

export default DriverListSection;
