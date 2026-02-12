"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Dropdown } from "@/app/commons/DropDown";
import { CommonButton, CancelButton } from "@/app/commons/Button";
import { LabeledInput } from "@/app/commons/LabelInput";
import { ReportRow } from "@/app/tools/SalesReportTools";
import { EndDate } from "@/app/commons/EndDate";
import { StartDate } from "@/app/commons/StartDate";
import { DataTable } from "@/app/commons/DataTable";


const today = new Date().toISOString().split("T")[0];

export default function ReportPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);
  const prevPageRef = useRef<number | null>(null);
  const prevFilterRef = useRef<typeof activeReportFilter>(null);

  type FilterMode = "client" | "date" | "client_date";

  const [filterMode, setFilterMode] = useState<FilterMode>("client");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeReportFilter, setActiveReportFilter] = useState<{
    mode: FilterMode;
    clientName?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);


  async function fetchReport(pageNum: number = 1) {
    setLoading(true);
    const toastId = toast.loading("Loading report...");

    try {
      const page = Math.max(0, pageNum - 1);
      const res = await fetch("/api/salesreport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, size: 10 }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to load report", { id: toastId });
        setLoading(false);
        return;
      }

      setData(result.content || []);
      setIsFirst(result.first || false);
      setIsLast(result.last || false);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error("Something went wrong while fetching report", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function fetchFilteredReport(pageNum: number) {

    console.log("Fetching filtered report with filter:", activeReportFilter, "and page:", pageNum);
    if (!activeReportFilter) return fetchReport(pageNum);

    setLoading(true);
    const toastId = toast.loading("Fetching report...");

    try {
      const page = Math.max(0, pageNum - 1);
      const payload: any = { page, size: 10 };

      if (activeReportFilter.mode === "client" || activeReportFilter.mode === "client_date") {
        payload.clientName = activeReportFilter.clientName;
      }

      if (activeReportFilter.mode === "date" || activeReportFilter.mode === "client_date") {
        payload.startDate = activeReportFilter.startDate;
        payload.endDate = activeReportFilter.endDate;
      }

      const res = await fetch("/api/salesreport/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to fetch report", { id: toastId });
        setData([]);
        return;
      }

      setData(result.content || []);
      setIsFirst(result.first || false);
      setIsLast(result.last || false);
      toast.success("Report fetched", { id: toastId });
    } catch (err) {
      toast.error("Something went wrong", { id: toastId });
      setData([]);
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

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if ((filterMode === "date" || filterMode === "client_date") && startDate > endDate) {
      toast.error("Start date must be earlier than or equal to End date");
      return;
    }

    if ((filterMode === "date" || filterMode === "client_date") && endDate > todayStr) {
      toast.error("End date cannot be in the future");
      return;
    }

    // Convert dates to ISO format
    let startDateISO = "";
    let endDateISO = "";

    if (filterMode === "date" || filterMode === "client_date") {
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const [ey, em, ed] = endDate.split("-").map(Number);

      startDateISO = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0)).toISOString();
      endDateISO = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 0)).toISOString();
    }

    const newFilter: typeof activeReportFilter = {
      mode: filterMode,
    };

    if (filterMode === "client" || filterMode === "client_date") {
      newFilter.clientName = clientName;
    }

    if (filterMode === "date" || filterMode === "client_date") {
      newFilter.startDate = startDateISO;
      newFilter.endDate = endDateISO;
    }

    setActiveReportFilter(newFilter);
    setCurrentPage(1);
    await fetchFilteredReport(1);
  }

  function handleClearFilter() {
    setClientName("");
    setStartDate("");
    setEndDate("");
    setActiveReportFilter(null);
    setCurrentPage(1);
    fetchReport(1);
    toast.success("Filter cleared");
  }


  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchReport();
  }, []);

  const fetchedRef = useRef(false);

  useEffect(() => {

    const pageChanged = prevPageRef.current !== currentPage;
    const filterChanged = prevFilterRef.current !== activeReportFilter;

    if (!pageChanged && !filterChanged) return;

    prevPageRef.current = currentPage;
    prevFilterRef.current = activeReportFilter;

    if (activeReportFilter) {
      fetchFilteredReport(currentPage);
    } else {
      fetchReport(currentPage);
    }
  }, [currentPage, activeReportFilter]);

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <Dropdown
            value={filterMode}
            onChange={(v) => setFilterMode(v)}
            options={[
              { value: "client", label: "Client" },
              { value: "date", label: "Date Range" },
              { value: "client_date", label: "Client + Date" },
            ]}
          />
        </div>

        {/* Client */}
        {(filterMode === "client" || filterMode === "client_date") && (
          <div>
            <LabeledInput
              label="Client Name"
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e)}
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
            <StartDate
              value={startDate}
              onChange={(e) => setStartDate(e)}
            />
          </div>
        )}

        {/* End Date */}
        {(filterMode === "date" || filterMode === "client_date") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <EndDate
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e)}
            />
          </div>
        )}

        {/* Search Button */}
        <CommonButton
          onClick={handleFilter}
          disabled={(filterMode === "date" && (!startDate || !endDate)) ||
            (filterMode === "client" && !clientName) ||
            (filterMode === "client_date" && (!clientName || !startDate || !endDate))}>
          Search
        </CommonButton>

        {/* Clear Filter Button */}
        {activeReportFilter && (
          <CancelButton
            onClick={handleClearFilter}>
            Clear Filter
          </CancelButton>
        )}

        {/* Total Revenue Display */}
        <div className="ml-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Revenue
          </label>
          <div className="h-9 px-10 py-7 bg-slate-900 text-white rounded-md flex items-center font-semibold">
            ${totalRevenue.toLocaleString()}
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
        <div>
          <div className="flex justify-end gap-3 mt-4">
            <CommonButton disabled={isFirst || loading} onClick={() => setCurrentPage(p => p - 1)}>
              Prev
            </CommonButton>

            <span className="py-1">
              Page {currentPage}
            </span>

            <CommonButton disabled={isLast || loading} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </CommonButton>
          </div>
          <DataTable
            data={data}
            rowKey={(row, index) => `${row.barcode}-${index}`}
            columns={[
              {
                header: "Client",render: (row) => (row.clientName),
              },
              {
                header: "Barcode",render: (row) => row.barcode,
              },
              {
                header: "Product",render: (row) => row.productName,
              },
              {
                header: "Quantity",render: (row) => row.quantityOrdered,
              },
              {
                header: "Revenue",
                render: (row) => (
                    `$${row.revenue.toLocaleString()}`
                ),
              },
            ]}
          />

          {/* Pagination Controls */}

        </div>
      )}
    </div>
  );
}
