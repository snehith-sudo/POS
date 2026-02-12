"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { CommonButton, SaveButton, CancelButton } from "@/app/commons/Button";
import { LabeledInput } from "@/app/commons/LabelInput";
import { InventoryItem, PAGE_SIZE, SAMPLE_TSV } from "@/app/tools/InventoryTools";
import { downloadSampleTsv } from "@/app/commons/TSVFileDownload";
import { DataTable } from "@/app/commons/DataTable";

const today = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear();
const time = new Date().getHours() + "." + new Date().getMinutes() + " - " + today;
console.log("Current Time:", Date.now(), "Formatted Time:", time);

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [filterapplied, setFilterApplied] = useState(false);
  const prevPageRef = useRef<number | null>(null);


  const [showmodalTSV, setShowModalTsv] = useState(false)
  const [isSavingTsv, setIsSavingTsv] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);

  const [role, setRole] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  async function fetchData(pageNum: number) {
    setLoading(true);

    try {

      const res = await fetch("/api/inventory/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page: pageNum - 1,
          size: PAGE_SIZE,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data?.message || "Failed to fetch inventory");
        toast.error(data?.message || "Failed to fetch inventory");
        setInventory([]);
        return;
      }
      // Extract content array and pagination metadata
      setInventory(data.content || []);
      setIsFirst(data.first || false);
      setIsLast(data.last || false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      toast.error("Error fetching inventory");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    if (prevPageRef.current === currentPage) return;
    prevPageRef.current = currentPage;
    fetchData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setRole(sessionStorage.getItem("role"));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ⛔ prevent page reload
    handleInventoryAddition();
  }


  async function handleFilter() {

    const toastId = toast.loading("Fetching Inventory data...");
    setFilterApplied(true);
    if (!searchValue.trim()) {
      toast.error("Required a value for filtering", { id: toastId });
      setLoading(false);
      return;
    }

    const res = await fetch("/api/inventory/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: searchValue, })
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result?.message || "Failed to fetch Item", { id: toastId });
      setLoading(false);
      return;
    }
    let content: InventoryItem[] = [];
    let first = true;
    let last = true;
    let pageNumber = 0;

    if (result && Array.isArray(result.content)) {
      content = result.content;
      first = !!result.first;
      last = !!result.last;
      pageNumber = typeof result.number === "number" ? result.number : 0;
    } else if (Array.isArray(result)) {
      content = result;
      first = true;
      last = true;
      pageNumber = 0;
    } else if (result && Object.keys(result).length === 0) {
      content = [];
    } else if (result) {
      content = [result];
      first = true;
      last = true;
      pageNumber = 0;
    }

    setInventory(content);
    setIsFirst(first);
    setIsLast(last);
    setCurrentPage(pageNumber + 1);

    console.log("Filter Result:", result);
    toast.success((result && result.message) || "Result fetched successfully", { id: toastId });
    setLoading(false);
  }

  async function handleInventoryAddition() {

    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to add inventory items");
      return;
    }

    setIsSaving(true)
    setLoading(true)

    const payload = {
      backendBarcode: barcode,
      backendQuantity: quantity
    }

    const toastId = toast.loading("Saving Inventory Item data...");

    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to add Product", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "INVENTORY added successfully",
      { id: toastId });

    setBarcode("");
    setQuantity("");
    setIsSaving(false);
    setLoading(false);
    await fetchData(currentPage);
    setShowModal(false);
  }
  const handleInventoryTSVAddition = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name); // show filename

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setBase64File(base64);
    };

    reader.readAsDataURL(file);
  };

  async function handleInventoryTsvUpload() {

    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to upload TSV");
      return;
    }

    if (!base64File) return;

    setIsSavingTsv(true);
    const toastId = toast.loading("Uploading TSV file...");

    try {
      const payload = {
        base64: base64File,
        fileName: uploadedFileName
      };

      const res = await fetch("/api/inventory/tsv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to upload TSV file", { id: toastId });
        setIsSavingTsv(false);
        return;
      }
      toast.dismiss(toastId);

      if (!result || Object.keys(result).length === 0) {
        toast.success("TSV file uploaded successfully", { id: toastId });
        setUploadedFileName(null);
        setBase64File(null);
        setShowModalTsv(false);
        await fetchData(currentPage);
        return;
      }
      const tsvData = "Barcode\tStatus\n" +
        Object.entries(result)
          .map(([barcode, status]) => `${barcode}\t${status}`)
          .join("\n");

      downloadSampleTsv(tsvData, `upload_result_${time}`);
      toast.success("Results downloaded as TSV", { id: toastId });

      setShowModalTsv(false);
      setUploadedFileName(null);
      setBase64File(null);
      await fetchData(1);
      setIsSavingTsv(false);

    } catch (error) {
      toast.error("Error uploading file", { id: toastId });
    } finally {
      setIsSavingTsv(false);
    }
  }

  async function handleInventoryEdit(id: number, newQuantity: string, barcode: string) {
    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to edit inventory");
      return;
    }
    setIsSavingEdit(true);
    const toastId = toast.loading("Saving inventory update...");

    try {
      const payload = {
        backendQuantity: newQuantity,
        backendBarcode: barcode
      };

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || "Failed to update inventory", { id: toastId });
        return;
      }

      toast.success(result?.message || "Inventory updated", { id: toastId });
      setEditingId(null);
      setEditedQuantity("");
      if(!filterapplied) await fetchData(currentPage);
    } catch (err) {
      console.error("Error updating inventory:", err);
      toast.error("Error updating inventory", { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Inventory Management
        </h1>
        <p className="text-gray-600">View and manage your inventory</p>
      </div>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-end gap-4">
          {/* Search */}
          <div className="flex items-end justify-between gap-4">

            <LabeledInput
              label="Search by Barcode"
              placeholder="Search by Barcode"
              value={searchValue}
              onChange={setSearchValue}
            />
            <CommonButton onClick={handleFilter} disabled={loading || !searchValue.trim()}>
              Search
            </CommonButton>
            {filterapplied && (
              <CommonButton
                onClick={() => {
                  setSearchValue("");
                  setFilterApplied(false);
                  fetchData(1);
                }}
              >
                Clear Filter
              </CommonButton>
            )}
          </div>
        </div>

        {role !== "OPERATOR" && (
          <div className="flex gap-3">
            <CommonButton onClick={() => setShowModal(true)}>
              Add New Item
            </CommonButton>

            {/* Upload TSV */}
            <CommonButton onClick={() => setShowModalTsv(true)}>
              Bulk Inventory Upload
            </CommonButton>
          </div>
        )}
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-opacity-50  bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Inventory Item</h2>

            <div className="max-w-2xl bg-white rounded-lg shadow p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <LabeledInput
                      label=""
                      placeholder="P00981"
                      onChange={setBarcode}
                      value={barcode}
                    />
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        onChange={e => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">

                    <SaveButton type="submit" disabled={isSaving || barcode.trim() === "" || quantity.trim() === "" || Number(quantity) < 0}>
                      Save Item
                    </SaveButton>

                    <CancelButton onClick={() => setShowModal(false)} disabled={isSaving}>
                      Cancel
                    </CancelButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showmodalTSV && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Upload TSV File
            </h2>
            <CommonButton onClick={() => downloadSampleTsv(SAMPLE_TSV, "inventory")}
              className="bg-slate-700"
            >
              Download sample TSV
            </CommonButton>

            <div className="bg-white rounded-lg shadow p-8 mt-2">
              <div className="space-y-6">

                {/* Upload block OR file name */}
                {!uploadedFileName ? (
                  <label
                    className="flex flex-col items-center justify-center gap-3
                         border-2 border-dashed border-slate-400
                         rounded-lg p-6 cursor-pointer
                         hover:bg-slate-50 transition"
                  >
                    <Upload className="w-8 h-8 text-slate-600" />

                    <span className="text-sm font-medium text-slate-700">
                      Click to upload TSV file
                    </span>

                    <span className="text-xs text-slate-500">
                      Only .tsv files supported
                    </span>

                    <input
                      type="file"
                      accept=".tsv,text/tab-separated-values"
                      onChange={handleInventoryTSVAddition}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between
                            border border-slate-300 rounded-lg p-4">
                    <span className="text-sm text-slate-700 font-medium">
                      📄 {uploadedFileName}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setBase64File(null);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <SaveButton disabled={!base64File || isSavingTsv} onClick={handleInventoryTsvUpload} >
                    {isSavingTsv ? "Uploading..." : "Upload"}
                  </SaveButton>

                  <CancelButton onClick={() => setShowModalTsv(false)} disabled={isSavingTsv} >
                    Cancel
                  </CancelButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Loading inventory...
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No inventory items found.
        </div>
      ) : (
        <>
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
            data={inventory}
            rowKey={(row, index) => `${row.barcode}-${index}`}
            columns={[
              {
                header: "S.No",
                render: (_row, index) => (currentPage - 1) * PAGE_SIZE + (index ?? 0) + 1,
              },
              {
                header: "Name",
                render: (row) => row.name,
              },
              {
                header: "Product Barcode",
                render: (row) => row.barcode,
              },
              {
                header: "Mrp",
                render: (row) => `$ ${row.mrp}`,
              },
              {
                header: "Quantity",
                render: (row) => {
                  if (editingId === row.id) {
                    return (
                      <input
                        type="number"
                        value={editedQuantity}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          const paste = e.clipboardData.getData("text");
                          if (!/^\d+$/.test(paste)) {
                            e.preventDefault();
                          }
                        }}
                        onDrop={(e) => e.preventDefault()}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D+/g, "");
                          setEditedQuantity(cleaned);
                        }}
                      />
                    );
                  }
                  return `${row.quantity} units`;
                },
              },
              {
                header: "Actions",
                render: (row) => {
                  if (role === "OPERATOR") return "-";

                  if (editingId === row.id) {
                    return (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInventoryEdit(row.id, editedQuantity, row.barcode)}
                          disabled={isSavingEdit || editedQuantity.trim() === "" || Number(editedQuantity) === row.quantity}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded text-sm hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditedQuantity(""); }}
                          disabled={isSavingEdit}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      disabled={editingId !== null}
                      onClick={() => { setEditingId(row.id); setEditedQuantity(String(row.quantity)); }}
                      className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
                    >
                      Edit
                    </button>
                  );
                },
              },
            ]}
          />

        </>
      )}

      {/* Pagination */}
      {/* {!loading && inventory.length > 0 && (
        
      )} */}
    </div>
  );
}
