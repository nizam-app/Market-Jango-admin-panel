import React, { useRef, useState, useEffect } from "react";
import { Trash } from 'lucide-react'; // Importing Lucide's trash icon
import { deleteBanner, getBanners, uploadBanner } from "../../api/dashboardAPI";
import Modal from "../Modal/Modal";

const Banner = () => {
  const [mainBanner, setMainBanner] = useState(null); // {id, image_url}
  const [otherBanners, setOtherBanners] = useState([]); // array of {id, image_url}
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const thumbRef = useRef(null);

  // Fetch banners on load
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await getBanners();
        const data = res.data?.data ?? {};
        setMainBanner(data.data[0] || null);
        setOtherBanners(data.data || []);
      } catch (e) {
        console.error("Failed to load banners", e);
      }
    }
    fetchBanners();
  }, []);

  // Handle file change (uploading banner)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "main");

      const res = await uploadBanner(formData);
      const saved = res.data?.data;

      setMainBanner(saved || null);
      setOtherBanners((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Banner upload failed", err);
      alert("Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  // Scroll banners horizontally
  const scrollThumbs = (direction) => {
    const el = thumbRef.current;
    if (!el) return;

    const cardWidth = 100 + 8; // width + gap (px)
    const scrollAmount = cardWidth * 3;

    el.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  // Handle banner delete
  const handleDelete = async (bannerId) => {
    try {
      await deleteBanner(bannerId); // Call API to delete the banner
      setOtherBanners((prev) => prev.filter((banner) => banner.id !== bannerId));
      
      // Show success message
      setSuccessMessage("Banner deleted successfully!");
      
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(""); // Reset the message
      }, 3000);
    } catch (err) {
      console.error("Failed to delete banner", err);
      alert("Failed to delete banner");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-4xl font-medium mb-4">Top banner</h3>

      {/* Main banner */}
      <label
        htmlFor="bannerUpload"
        className="cursor-pointer w-full h-[460px] rounded-[15px] relative mb-3 overflow-hidden block"
      >
        <img
          src={mainBanner?.image || "https://i.ibb.co.com/chzBwTyK/Rectangle-206-1.png"}
          alt="Top Banner"
          className="w-full h-full object-cover rounded-md"
        />
        <div className="flex items-center justify-center absolute inset-0 bg-black/40">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white text-sm">{uploading ? "Uploading..." : "Click to upload banner"}</span>
          </div>
        </div>
        <input
          type="file"
          id="bannerUpload"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* Other banners (with delete button and slider) */}
      <div className="mt-2 relative overflow-x-hidden">
        <button
          type="button"
          onClick={() => scrollThumbs("prev")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        >
          ‹
        </button>

        {/* Thumbnails */}
        <div ref={thumbRef} className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-10">
          {otherBanners.map((b) => (
            <div key={b.id} className="w-[170px] h-[95px] rounded-[8px] relative overflow-hidden shrink-0">
              <img src={b.image} alt="Banner" className="w-full h-full object-cover" />

              {/* Delete Icon */}
              <button
                onClick={() => handleDelete(b.id)}
                className="absolute top-2 right-2 bg-gray-700 text-white p-2 rounded-full opacity-80 hover:opacity-100"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollThumbs("next")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Success Modal */}
      <Modal message={successMessage} onClose={() => setSuccessMessage('')} />
    </div>
  );
};

export default Banner;
