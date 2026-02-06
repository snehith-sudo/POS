"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ReportRow = {
  clientName: string;
  barcode: string;
  productName: string;
  quantityOrdered: number;
  revenue: number;
};

export default function ReportPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  type FilterMode = "client" | "date" | "client_date";

  const [filterMode, setFilterMode] = useState<FilterMode>("client");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  async function fetchReport() {
    setLoading(true);

    const toastId = toast.loading("Loading report...");

    try {
      const res = await fetch("/api/salesreport");

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to load report", { id: toastId });
        setLoading(false);
        return;
      }

      setData(result);
      toast.success("Report loaded successfully", { id: toastId });
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Something went wrong while fetching report", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    if ((filterMode === "client" && !clientName) || (filterMode === "client_date" && !clientName) ||
      ((filterMode === "date" || filterMode === "client_date") && (!startDate || !endDate))) {
      toast.error("Please fill required filters");
      return;
    }

    const payload: any = {};

    if (filterMode === "client" || filterMode === "client_date") {
      payload.clientName = clientName;
    }


    if (filterMode === "date" || filterMode === "client_date") {

      // Validate start/end date values
      // startDate and endDate are in YYYY-MM-DD from the <input type="date" />
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`; // local today's date in YYYY-MM-DD

      if (startDate > endDate) {
        toast.error("Start date must be earlier than or equal to End date");
        return;
      }

      if (endDate > todayStr) {
        toast.error("End date cannot be in the future");
        return;
      }

      // Convert startDate to UTC 00:00:00 and endDate to UTC 23:59:00
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const [ey, em, ed] = endDate.split("-").map(Number);

      const startUtc = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0)).toISOString();
      const endUtc = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 0)).toISOString();

      payload.startDate = startUtc;
      payload.endDate = endUtc;
    }

    const toastId = toast.loading("Fetching report...");

    try {
      const res = await fetch("/api/salesreport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(data)


      if (!res.ok) {
        toast.error(data.message || "Failed to fetch report", { id: toastId });
        return;
      }
      if (data.length === 0) {
        toast.success("No datafound", { id: toastId });
      } else toast.success("Report fetched", { id: toastId });
      setData(data);


    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
    }
  }


  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const total = data.reduce((sum, row) => sum + row.revenue, 0);
    setTotalRevenue(total);
  }, [data]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Sales Report
      </h1>

      <div className="flex items-end gap-4 mb-6">

        {/* Filter Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
          >
            <option value="client">Client</option>
            <option value="date">Date Range</option>
            <option value="client_date">Client + Date</option>
          </select>
        </div>

        {/* Client */}
        {(filterMode === "client" || filterMode === "client_date") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <input
              type="text"
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56 focus:ring-2 focus:ring-slate-500"
            />
          </div>
        )}

        {/* Start Date */}
        {(filterMode === "date" || filterMode === "client_date") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
        )}

        {/* End Date */}
        {(filterMode === "date" || filterMode === "client_date") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleFilter}
          className="h-9 px-6 bg-slate-900 text-white rounded-md hover:bg-slate-950 transition"
        >
          Search
        </button>

        {/* Total Revenue Display */}
        <div className="ml-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Revenue
          </label>
          <div className="h-9 px-10 py-7 bg-slate-900 text-white rounded-md flex items-center font-semibold">
            ₹{totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>


      {loading ? (
        <div className="text-center text-slate-600">
          Loading report...
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-slate-600">
          No report data available
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Barcode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {data.map((row, index) => (
                <tr
                  key={`${row.barcode}-${index}`}
                  className={`transition duration-200 
            ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} 
            hover:bg-slate-100`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {row.clientName}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-700">
                    {row.barcode}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-700">
                    {row.productName}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-700">
                    {row.quantityOrdered}
                  </td>

                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{row.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      )}
    </div>
  );
}
