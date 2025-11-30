// src/components/drivers/DriverDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { getDriverDetails, updateDriverStatus } from "../../api/driverApi";

const STATUS = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const DriverDetailsModal = ({
  driverId,
  closeModal,
  showStatusActions = true, // AllDriverList theke false pathabo
}) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    const loadDetails = async () => {
      try {
        setLoading(true);
        const res = await getDriverDetails(driverId);
        setDriver(res.data?.data || null);
      } catch (err) {
        console.error("Failed to load driver details", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [driverId]);

  // const handleUpdateStatus = async (status) => {
  //   if (!driver) return;

  //   const confirmText =
  //     status === STATUS.APPROVED
  //       ? "Are you sure you want to approve this driver?"
  //       : "Are you sure you want to reject this driver?";

  //   if (!window.confirm(confirmText)) return;

  //   try {
  //     setSaving(true);
  //     const targetId = driver.user?.id || driver.id;
  //     await updateDriverStatus(targetId, status);

  //     alert(
  //       status === STATUS.APPROVED
  //         ? "Driver approved successfully."
  //         : "Driver rejected successfully."
  //     );

  //     // modal close dile uporer list reload hobe (sekhan theke handle kortecho)
  //     closeModal();
  //   } catch (err) {
  //     console.error("Failed to update driver status", err);
  //     alert("Failed to update driver status.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };


const handleUpdateStatus = async (status) => {
  if (!driver) return;

  const confirmText =
    status === STATUS.APPROVED
      ? "Are you sure you want to approve this driver?"
      : "Are you sure you want to reject this driver?";

  if (!window.confirm(confirmText)) return;

  try {
    setSaving(true);

    // এখানে প্রাধান্য দিচ্ছি DRIVER ID কে, user id না
    const targetId =
      driver.id ||           // driver details API (driver.show) দিলে
      driver.driver_id ||    // অন্য কোন ফিল্ডে driver id থাকলে
      driver.driver?.id;     // nested হলে

    if (!targetId) {
      console.error("Driver id not found for status update", driver);
      alert("Driver id not found for status update.");
      return;
    }

    await updateDriverStatus(targetId, status);

    alert(
      status === STATUS.APPROVED
        ? "Driver approved successfully."
        : "Driver rejected successfully."
    );

    closeModal(); // modal বন্ধ, উপরের লিস্ট তুমি রিফ্রেশ করছো
  } catch (err) {
    console.error("Failed to update driver status", err);
    alert("Failed to update driver status.");
  } finally {
    setSaving(false);
  }
};



  const profileImg =
    driver?.user?.image ||
    "https://via.placeholder.com/80/1e40af/ffffff?text=DR";

  const carImages =
    driver?.images && driver.images.length > 0
      ? driver.images.map((img) => img.image_path)
      : [
          "https://via.placeholder.com/150x100/000000/ffffff?text=Car+1",
          "https://via.placeholder.com/150x100/000000/ffffff?text=Car+2",
          "https://via.placeholder.com/150x100/000000/ffffff?text=Car+3",
          "https://via.placeholder.com/150x100/000000/ffffff?text=Car+4",
          "https://via.placeholder.com/150x100/000000/ffffff?text=Car+5",
        ];

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 bg-black/40 flex justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white mt-10 rounded-lg w-full h-[85vh] max-w-4xl mx-4 overflow-hidden"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">Loading driver details...</p>
          </div>
        ) : !driver ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">Driver not found.</p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto custom-scroll">
            {/* Header */}
            <div className="relative">
              <div className="flex items-center p-10">
                <img
                  src={profileImg}
                  alt={driver.user?.name || "Driver"}
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                />
                <div className="space-y-1.5">
                  <h2 className="text-[26px] font-medium">
                    {driver.user?.name || "Driver Name"}
                  </h2>
                  <p className="text-sm">{driver.user?.phone || "N/A"}</p>
                  <p className="text-sm">{driver.user?.email || "N/A"}</p>
                  <p className="text-sm">{driver.location || "No address"}</p>
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

            {/* Body */}
            <div className="px-10 pb-10">
              {/* About */}
              <div>
                <h3 className="text-[22px] font-medium mb-2">
                  About this driver
                </h3>
                <p className="font-normal leading-relaxed text-sm">
                  {driver.description && driver.description.trim().length > 0
                    ? driver.description
                    : "This driver is part of the Market Jango transport network. More description for the driver has not been provided yet."}
                </p>
              </div>

              {/* License & Docs – placeholder images */}
              <div className="mt-6">
                <h3 className="text-[22px] font-medium mb-4">
                  License & Other Documents
                </h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    "https://via.placeholder.com/260x200/9ca3af/ffffff?text=License+1",
                    "https://via.placeholder.com/260x200/9ca3af/ffffff?text=License+2",
                    "https://via.placeholder.com/260x200/9ca3af/ffffff?text=Plate",
                  ].map((doc, index) => (
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

              {/* Car info */}
              <div className="mt-6">
                <div className="flex flex-wrap gap-10 mb-4">
                  <div className="flex gap-2">
                    <p className="text-sm font-bold">Car Brand:</p>
                    <p className="text-sm">{driver.car_name || "N/A"}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-sm font-bold">Car Model:</p>
                    <p className="text-sm">{driver.car_model || "N/A"}</p>
                  </div>
                  <div className="flex gap-2">
                    <p className="text-sm font-bold">Price per KM:</p>
                    <p className="text-sm">
                      {driver.price ? `${driver.price} ৳` : "N/A"}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Car Images</h3>
                <div className="flex flex-wrap justify-start gap-2">
                  {carImages.map((img, index) => (
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

              {/* Driver Route */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Driver Routes</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-200 rounded-full px-4 py-1 text-sm font-medium">
                    Route Name: {driver?.route?.name ?? "N/A"}
                  </span>
                </div>
              </div>

              {/* Action buttons – only for RequestedDriver page */}
              {
              (
                <div className="flex space-x-4 mt-7">
                  <button
                    disabled={saving}
                    onClick={() => handleUpdateStatus(STATUS.REJECTED)}
                    className="py-2 px-8 cursor-pointer bg-[#EA0C0C]
                      text-white font-medium rounded-[100px] disabled:opacity-60"
                  >
                    {saving ? "Please wait..." : "Cancelled"}
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => handleUpdateStatus(STATUS.APPROVED)}
                    className="py-2 px-8 cursor-pointer bg-[#55A946]
                      text-white font-medium rounded-[100px] disabled:opacity-60"
                  >
                    {saving ? "Please wait..." : "Approved"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDetailsModal;
