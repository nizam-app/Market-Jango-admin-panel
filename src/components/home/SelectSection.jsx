// src/components/home/SelectSection.jsx
import { useEffect, useMemo, useState } from "react";

const SelectSection = ({
  title,
  placeholder = "Search for something",
  fetchItems,        // Promise< {id, value, name}[] >
  saveSelection,     // (selectedValues: number[]) => Promise
  maxSelect = 4,
  initialSelectedIds = [],
}) => {
  const [items, setItems] = useState([]); // [{id, value, name}]
  const [selectedValues, setSelectedValues] = useState(initialSelectedIds);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // initial selected sync
  useEffect(() => {
    setSelectedValues(initialSelectedIds);
  }, [initialSelectedIds]);

  // একবার list load
  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      try {
        const list = await fetchItems();
        if (!isMounted) return;
        setItems(list);
      } catch (e) {
        console.error("Failed to load list", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, []); // [] যেন loop না হয়

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((item) =>
      (item.name || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggleItem = (value) => {
    setSelectedValues((prev) => {
      const exists = prev.includes(value);
      if (exists) {
        return prev.filter((x) => x !== value);
      }
      if (prev.length >= maxSelect) {
        alert(`You can select maximum ${maxSelect} items.`);
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleApply = async () => {
    try {
      setSaving(true);
      await saveSelection(selectedValues);  // backend এ যাবে product_id / category_id
      alert("Selection updated successfully.");
    } catch (e) {
      console.error("Failed to save selection", e);
      alert("Failed to save selection");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10">
      {/* Heading + Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-medium">{title}</h2>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {/* search icon */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={placeholder}
            className="pl-13 py-3 rounded-[40px] bg-white text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-5">
            {filteredItems.map((item) => {
              const isSelected = selectedValues.includes(item.value);
              return (
                <button
                  key={item.id}                // 🔑 এখন unique row.id
                  type="button"
                  onClick={() => toggleItem(item.value)}   // select value
                  className={`px-4 py-2 rounded-[10px] border text-sm font-medium transition cursor-pointer
                    ${
                      isSelected
                        ? "bg-[#FF8C00] text-white border-[#FF8C00]"
                        : "border-[#FF8C00] text-[#051522] bg-white"
                    }`}
                >
                  {item.name}
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-sm text-gray-500 col-span-7">
                No item found.
              </p>
            )}
          </div>

          {/* Apply Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleApply}
              disabled={saving}
              className="bg-[#0168B8] disabled:opacity-60 cursor-pointer text-white 
                px-6 py-3 rounded-[100px] font-medium transition"
            >
              {saving ? "Saving..." : "Apply"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectSection;
