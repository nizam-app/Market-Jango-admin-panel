// src/components/home/Stats.jsx
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboardAPI";


const Stats = () => {
  const [stats, setStats] = useState([
    { key: "totalVendors", title: "Total Vendors", value: "-" },
    { key: "vendorRequests", title: "Vendor Requests", value: "-" },
    { key: "totalDrivers", title: "Total Drivers", value: "-" },
    { key: "driverRequests", title: "Drivers Requests", value: "-" },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getDashboardStats();
        console.log(data, "pitam");
        setStats((prev) =>
          prev.map((item) => ({
            ...item,
            value: data[item.key]?.toLocaleString() ?? "0",
          }))
        );
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item, index) => (
        <div
          key={item.key ?? index}
          className="bg-white p-6 rounded-[16px] border border-[#B0CCE2]"
        >
          <p className="text-xl font-medium text-[#585555]">{item.title}</p>
          <h3 className="mt-5 text-4xl font-bold">
            {loading && item.value === "-" ? "…" : item.value}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default Stats;
