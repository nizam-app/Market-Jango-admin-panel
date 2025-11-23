// src/components/vendor/RequestedVendorModal.jsx
import React from "react";
import { updateVendorStatus } from "../../api/vendorAPI";

const RequestedVendorModal = ({ vendor, closeModal, onStatusChange }) => {
  const user = vendor.user || {};
  const images = vendor.images || [];

  // header avatar: vendor images এর প্রথমটা, না থাকলে placeholder
  const avatarSrc =
    images[0]?.image_path ||
    "https://via.placeholder.com/150x150.png?text=Vendor";

  // Trade license / docs হিসেবে সব vendor-type image দেখাচ্ছি
  const docImages = images.filter((img) => img.file_type === "image");

  const handleUpdateStatus = async (status) => {
    try {
      await updateVendorStatus(vendor.id, status);
      onStatusChange(vendor.id, status);
      alert(`Vendor status updated to ${status}`);
      closeModal();
    } catch (error) {
      console.error("Failed to update vendor status", error);
      alert("Failed to update vendor status. Please try again.");
    }
  };

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-black/40 flex justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white mt-15 rounded-lg shadow-xl w-full h-[85vh] max-w-3xl mx-4 overflow-hidden"
      >
        {/* Scrollable Content with hidden scrollbar */}
        <div className="h-full overflow-y-auto custom-scroll">
          {/* Header with Close Button */}
          <div className="relative">
            <div className="flex items-center p-10">
              <img
                src={avatarSrc}
                alt={user.name || "Vendor"}
                className="w-[130px] h-[130px] rounded-full mr-4 object-cover"
              />
              <div className="space-y-1.5">
                <h2 className="text-[26px] font-medium">
                  {vendor.business_name || user.name || "Vendor"}
                </h2>
                {user.phone && <p className="text-sm">{user.phone}</p>}
                {user.email && <p className="text-sm">{user.email}</p>}
                <p className="text-sm">
                  {vendor.address || vendor.country || "Address not available"}
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-[40px] h-[40px] bg-[#E2E2E2] bg-opacity-80 rounded-full text-[#000000] text-[26px] cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Content Body */}
          <div className="px-10 pb-10">
            {/* About This Vendor Section */}
            <div>
              <h3 className="text-[22px] font-medium mb-2">
                About this vendor
              </h3>
              <p className="font-normal leading-relaxed">
                {vendor.business_name || user.name} is a{" "}
                {vendor.business_type || "business"} based in{" "}
                {vendor.country || "N/A"}. Located at {vendor.address || "N/A"}.
                This vendor is currently in{" "}
                <span className="font-semibold">
                  {user.status || "Pending"}
                </span>{" "}
                status and waiting for admin review.
              </p>
            </div>

            {/* Trade License & Other Documents Section */}
            <div className="mt-6">
              <h3 className="text-[22px] font-medium mb-4">
                Trade license & Other Documents
              </h3>
              {docImages.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No documents uploaded by this vendor.
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {docImages.map((img) => (
                    <div
                      key={img.id}
                      className="w-64 h-48 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center"
                    >
                      <img
                        src={img.image_path}
                        alt="Vendor document"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 mt-7">
              <button
                onClick={() => handleUpdateStatus("Rejected")} // যদি backend "Cancelled" use করে তাহলে string change করো
                className="py-2 px-8 cursor-pointer bg-[#EA0C0C] text-white font-medium rounded-[100px]"
              >
                Canceled
              </button>
              <button
                onClick={() => handleUpdateStatus("Approved")}
                className="py-2 px-8 cursor-pointer bg-[#55A946] text-[#051522] font-medium rounded-[100px]"
              >
                Approved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestedVendorModal;
