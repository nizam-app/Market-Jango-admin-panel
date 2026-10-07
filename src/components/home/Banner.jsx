import React, { useRef, useState, useEffect, useCallback } from "react";
import { Trash, Pencil } from "lucide-react";
import {
  deleteBanner,
  getManageBanners,
  uploadBanner,
  updateBanner,
} from "../../api/dashboardAPI";
import { getZones } from "../../api/adminApi";
import Modal from "../Modal/Modal";

const BRAND = "#FF8C00";

const Banner = () => {
  const [mainBanner, setMainBanner] = useState(null);
  const [otherBanners, setOtherBanners] = useState([]);
  const [zones, setZones] = useState([]);
  const [uploadZoneId, setUploadZoneId] = useState("");
  const [filterZoneId, setFilterZoneId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editZoneId, setEditZoneId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const thumbRef = useRef(null);

  const zoneLabel = useCallback(
    (zoneId) => {
      if (zoneId == null || zoneId === "" || zoneId === 0) return "Global";
      const z = zones.find((item) => String(item.id) === String(zoneId));
      return z?.name ? `${z.name} (#${z.id})` : `Zone #${zoneId}`;
    },
    [zones]
  );

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterZoneId) params.zone_id = filterZoneId;
      const res = await getManageBanners(params);
      const page = res.data?.data ?? {};
      const list = Array.isArray(page?.data) ? page.data : Array.isArray(page) ? page : [];
      setMainBanner(list[0] || null);
      setOtherBanners(list);
    } catch (e) {
      console.error("Failed to load banners", e);
      setMainBanner(null);
      setOtherBanners([]);
    } finally {
      setLoading(false);
    }
  }, [filterZoneId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const zRes = await getZones(200);
        const zPag = zRes?.data?.data;
        if (!cancelled) {
          setZones(Array.isArray(zPag?.data) ? zPag.data : Array.isArray(zPag) ? zPag : []);
        }
      } catch (e) {
        console.error("Failed to load zones", e);
        if (!cancelled) setZones([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "main");
      if (uploadZoneId) {
        formData.append("zone_id", uploadZoneId);
      } else {
        formData.append("zone_id", "");
      }

      await uploadBanner(formData);
      setSuccessMessage(
        uploadZoneId
          ? `Banner uploaded for ${zoneLabel(uploadZoneId)}`
          : "Global banner uploaded"
      );
      setTimeout(() => setSuccessMessage(""), 3000);
      await fetchBanners();
    } catch (err) {
      console.error("Banner upload failed", err);
      alert(err?.response?.data?.message || "Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  const scrollThumbs = (direction) => {
    const el = thumbRef.current;
    if (!el) return;
    const cardWidth = 180 + 8;
    el.scrollBy({
      left: direction === "next" ? cardWidth * 3 : -cardWidth * 3,
      behavior: "smooth",
    });
  };

  const handleDelete = async (bannerId) => {
    try {
      await deleteBanner(bannerId);
      setOtherBanners((prev) => prev.filter((banner) => banner.id !== bannerId));
      setMainBanner((prev) => (prev?.id === bannerId ? null : prev));
      if (editingId === bannerId) {
        setEditingId(null);
        setEditZoneId("");
      }
      setSuccessMessage("Banner deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete banner", err);
      alert(err?.response?.data?.message || "Failed to delete banner");
    }
  };

  const startEdit = (banner) => {
    setEditingId(banner.id);
    setEditZoneId(banner.zone_id ? String(banner.zone_id) : "");
  };

  const saveZoneEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("zone_id", editZoneId || "");
      await updateBanner(editingId, formData);
      setSuccessMessage("Banner zone updated");
      setTimeout(() => setSuccessMessage(""), 3000);
      setEditingId(null);
      setEditZoneId("");
      await fetchBanners();
    } catch (err) {
      console.error("Failed to update banner zone", err);
      alert(err?.response?.data?.message || "Failed to update banner zone");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-4xl font-medium">Top banner</h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose a zone before upload. Leave as Global for default guest home banners.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Upload for zone
            <select
              value={uploadZoneId}
              onChange={(e) => setUploadZoneId(e.target.value)}
              className="min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Global (all zones)</option>
              {zones.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.name || `Zone #${z.id}`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Filter list
            <select
              value={filterZoneId}
              onChange={(e) => setFilterZoneId(e.target.value)}
              className="min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">All banners</option>
              <option value="global">Global only</option>
              {zones.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.name || `Zone #${z.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

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
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <span className="text-white text-sm">
              {uploading
                ? "Uploading..."
                : loading
                  ? "Loading banners..."
                  : "Click to upload banner"}
            </span>
            {!uploading && (
              <span className="text-white/80 text-xs">
                Target: {zoneLabel(uploadZoneId || null)}
              </span>
            )}
          </div>
        </div>
        <input
          type="file"
          id="bannerUpload"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </label>

      <div className="mt-2 relative overflow-x-hidden">
        <button
          type="button"
          onClick={() => scrollThumbs("prev")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        >
          ‹
        </button>

        <div
          ref={thumbRef}
          className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-10 py-1"
        >
          {otherBanners.length === 0 && !loading ? (
            <p className="text-sm text-gray-500 py-6">No banners for this filter.</p>
          ) : (
            otherBanners.map((b) => (
              <div
                key={b.id}
                className="w-[180px] shrink-0 rounded-[8px] overflow-hidden border border-gray-100 bg-white shadow-sm"
              >
                <div className="w-full h-[95px] relative">
                  <img src={b.image} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(b)}
                      className="bg-white/90 text-gray-800 p-1.5 rounded-full shadow hover:bg-white"
                      title="Edit zone"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="bg-gray-700 text-white p-1.5 rounded-full opacity-90 hover:opacity-100"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
                <div className="px-2 py-2 space-y-1.5">
                  <p className="text-[11px] font-medium text-gray-700 truncate" title={zoneLabel(b.zone_id)}>
                    {zoneLabel(b.zone_id)}
                  </p>
                  {editingId === b.id ? (
                    <div className="space-y-1.5">
                      <select
                        value={editZoneId}
                        onChange={(e) => setEditZoneId(e.target.value)}
                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white"
                      >
                        <option value="">Global</option>
                        {zones.map((z) => (
                          <option key={z.id} value={String(z.id)}>
                            {z.name || `Zone #${z.id}`}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={saveZoneEdit}
                          className="flex-1 text-xs text-white rounded-md py-1 disabled:opacity-60"
                          style={{ backgroundColor: BRAND }}
                        >
                          {savingEdit ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => {
                            setEditingId(null);
                            setEditZoneId("");
                          }}
                          className="flex-1 text-xs border border-gray-200 rounded-md py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollThumbs("next")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        >
          ›
        </button>
      </div>

      <Modal message={successMessage} onClose={() => setSuccessMessage("")} />
    </div>
  );
};

export default Banner;
