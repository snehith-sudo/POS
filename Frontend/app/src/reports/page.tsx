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
import { fetchFilteredSalesReport, fetchSalesReport, ReportFilter as ServiceReportFilter } from "@/app/service/salesreport-service";

const PAGE_SIZE = 10;

type FilterMode = "client" | "date" | "client_date";

type ReportFilter = ServiceReportFilter | null;

export default function ReportPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);

  const prevPageRef = useRef<number | null>(null);
  const prevFilterRef = useRef<ReportFilter>(null);
  const fetchedRef = useRef(false);

  const [filterMode, setFilterMode] = useState<FilterMode>("client");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeReportFilter, setActiveReportFilter] = useState<ReportFilter>(null);



  async function loadReport(pageNum: number = 1, filter = activeReportFilter) {

    setLoading(true);
    const toastId = toast.loading("Loading report...");

    try {

      const page = Math.max(0, pageNum - 1);

      const result = filter
        ? await fetchFilteredSalesReport(filter, page, PAGE_SIZE)
        : await fetchSalesReport(page, PAGE_SIZE);

      setData(result.content);
      setIsFirst(result.first);
      setIsLast(result.last);

      toast.dismiss(toastId);

    } catch (err: any) {
      toast.error(err.message || "Failed to load report", { id: toastId });
      setData([]);
    } finally {
      setLoading(false);
    }
  }
  async function handleFilter() {

    if (
      (filterMode === "client" && !clientName) ||
      (filterMode === "client_date" && !clientName) ||
      ((filterMode === "date" || filterMode === "client_date") && (!startDate || !endDate))
    ) {
      toast.error("Please fill required filters");
      return;
    }

    if ((filterMode === "date" || filterMode === "client_date") && startDate > endDate)
      return toast.error("Start date must be earlier than End date");

    const todayStr = new Date().toISOString().split("T")[0];
    if ((filterMode === "date" || filterMode === "client_date") && endDate > todayStr)
      return toast.error("End date cannot be in the future");

    let startDateISO = "";
    let endDateISO = "";

    if (filterMode === "date" || filterMode === "client_date") {
      const [sy, sm, sd] = startDate.split("-").map(Number);
      const [ey, em, ed] = endDate.split("-").map(Number);
      startDateISO = new Date(Date.UTC(sy, sm - 1, sd, 0, 0, 0)).toISOString();
      endDateISO = new Date(Date.UTC(ey, em - 1, ed, 23, 59, 0)).toISOString();
    }

    let newFilter: ReportFilter;

    if (filterMode === "client") {

      newFilter = {
        mode: "client",
        clientName: clientName.trim(),
      };

    }
    else if (filterMode === "date") {

      newFilter = {
        mode: "date",
        startDate: startDateISO,
        endDate: endDateISO,
      };

    }
    else {

      newFilter = {
        mode: "client_date",
        clientName: clientName.trim(),
        startDate: startDateISO,
        endDate: endDateISO,
      };

    }

    setActiveReportFilter(newFilter);
    setCurrentPage(1);
    await loadReport(1, newFilter);
  }

  function handleClearFilter() {
    setClientName("");
    setStartDate("");
    setEndDate("");
    setActiveReportFilter(null);
    setCurrentPage(1);
    loadReport(1);
    toast.success("Filter cleared");
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadReport();
  }, []);

  useEffect(() => {
    const pageChanged = prevPageRef.current !== currentPage;
    const filterChanged = prevFilterRef.current !== activeReportFilter;
    if (!pageChanged && !filterChanged) return;
    prevPageRef.current = currentPage;
    prevFilterRef.current = activeReportFilter;
    if (activeReportFilter) loadReport(currentPage);
    else loadReport(currentPage);
  }, [currentPage, activeReportFilter]);

  useEffect(() => {
    const total = data.reduce((sum, row) => sum + (row.revenue || 0), 0);
    setTotalRevenue(total);
  }, [data]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Sales Report</h1>

      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 mb-6">
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter By</label>
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

        {(filterMode === "client" || filterMode === "client_date") && (
          <div className="w-full md:w-auto">
            <LabeledInput
              label="Client Name"
              placeholder="Client name"
              value={clientName}
              onChange={(e) => setClientName(e)}
              className="w-full md:w-56 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
            />
          </div>
        )}

        {(filterMode === "date" || filterMode === "client_date") && (
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <StartDate value={startDate} onChange={(e) => setStartDate(e)} />
          </div>
        )}

        {(filterMode === "date" || filterMode === "client_date") && (
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <EndDate value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e)} />
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto">
          <CommonButton onClick={handleFilter} disabled={(filterMode === "date" && (!startDate || !endDate)) ||
            (filterMode === "client" && !clientName) || (filterMode === "client_date" && (!clientName || !startDate || !endDate))} className="w-full sm:w-auto">
            Search
          </CommonButton>

          {activeReportFilter && (
            <CancelButton onClick={handleClearFilter} className="w-full sm:w-auto">Clear Filter</CancelButton>
          )}
        </div>

        <div className="ml-auto mt-4 md:mt-0 w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue</label>
          <div className="h-9 px-4 md:px-10 py-2 md:py-3 bg-slate-900 text-white rounded-md flex items-center font-semibold">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-600">Loading report...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-slate-600">No report data available</div>
      ) : (
        <div>
          <div className="flex justify-end gap-3 ">
            <CommonButton disabled={isFirst || loading} onClick={() => setCurrentPage(p => p - 1)}>Prev</CommonButton>
            <span className="py-1 mt-5">Page {currentPage}</span>
            <CommonButton disabled={isLast || loading} onClick={() => setCurrentPage(p => p + 1)}>Next</CommonButton>
          </div>

          <DataTable
            data={data}
            rowKey={(row, index) => `${row.barcode}-${index}`}
            columns={[
              { header: "Client", render: (row) => row.clientName },
              { header: "Barcode", render: (row) => row.barcode },
              { header: "Product", render: (row) => row.productName },
              { header: "Quantity", render: (row) => row.quantityOrdered },
              { header: "Revenue", render: (row) => `$${row.revenue.toLocaleString()}` },
            ]}
          />
        </div>
      )}
    </div>
  );
}
