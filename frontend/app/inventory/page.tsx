"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

type InventoryItem = {
  id: number;
  name: string;
  barcode: string;
  quantity: number;
  Mrp: number;
}
const PAGE_SIZE = 10;

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
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const [showmodalTSV, setShowModalTsv] = useState(false)
  const [isSavingTsv, setIsSavingTsv] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);

  const [role, setRole] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");


  async function fetchData(pageNum: number) {
    setLoading(true);

    try {
      console.log("Fetching inventory - page:", pageNum, "size:", PAGE_SIZE);

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

      setInventory(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      toast.error("Error fetching inventory");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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

    if (!searchValue.trim()) toast.error("Required a value for filtering", { id: toastId });

    const res = await fetch("/api/inventory/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: searchValue, })
    })
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to fetch Item", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Result got successfully",
      { id: toastId });

    const normalizedProducts = Array.isArray(result) ? result : [result];

    setInventory(normalizedProducts);
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

    toast.success(result.message || "Product added successfully",
      { id: toastId });

    setBarcode("");
    setQuantity("");
    setIsSaving(false);
    setLoading(false);
    await fetchData(currentPage);
    setShowModal(false);
  }
  const handleInventoryTSVAddition = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name); // show filename

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setBase64File(base64);
      console.log("Base64 file loaded:", base64); // log AFTER file is read
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
      console.log(result);

      if (!res.ok) {
        toast.error(result.message || "Failed to upload TSV file", { id: toastId });
        setIsSavingTsv(false);
        return;
      }
      toast.dismiss(toastId);

      if (!result || Object.keys(result).length === 0) {
        // ✅ All rows successful
        toast.success("TSV file uploaded successfully", { id: toastId });
        setUploadedFileName(null);
        setBase64File(null);
        setShowModalTsv(false);
        await fetchData(currentPage);
        return;
      }

      Object.entries(result).forEach(([barcode, status]) => {
        if (status === "SUCCESS") {
          toast.success(`${barcode} uploaded successfully`, {
            id: `${toastId}-${barcode}`,
            duration: 15000,
          });
        } else {
          toast.error(`${barcode}: ${status}`, {
            id: `${toastId}-${barcode}`,
            duration: 15000,
          });
        }
      });

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
        backendid:id,
        backendQuantity: newQuantity,
        backendBarcode: barcode
      };

      const res = await fetch("/api/inventory", {
        method: "PUT",
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
      await fetchData(currentPage);
    } catch (err) {
      console.error("Error updating inventory:", err);
      toast.error("Error updating inventory", { id: toastId });
    } finally {
      setIsSavingEdit(false);
    }
  }

  // Remove old useEffect - it's now handled by the currentPage dependency useEffect above

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Inventory Management
        </h1>
        <p className="text-gray-600">View and manage your inventory</p>
      </div>
      <div className="flex items-end gap-4 mb-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by Barcode"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          <button
            onClick={handleFilter}
            className="h-10 w-20 mx-4 bg-slate-900 text-white rounded-md hover:bg-slate-950 transition"
          >
            Search
          </button>
        </div>

        {/* Add New Item */}
          {role !== "OPERATOR" && (
            <>
              <button
                className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
                     px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                + Add New Item
              </button>

              {/* Upload TSV */}
              <button
                className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
                     px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                onClick={() => setShowModalTsv(true)}
              >
                + Upload TSV File
              </button>
            </>
          )}
      </div>


      {showModal && (
        <div className="fixed inset-0 bg-opacity-50  flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Inventory Item</h2>

            <div className="max-w-2xl bg-white rounded-lg shadow p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      placeholder="P00981"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      onChange={e => setBarcode(e.target.value)}
                      required
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
                    <button
                      className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                      type="submit"
                    >
                      Save Inventory Item
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 border border-slate-700 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showmodalTSV && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Upload TSV File
            </h2>

            <div className="bg-white rounded-lg shadow p-8">
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
                  <button
                    type="button"
                    disabled={!base64File || isSavingTsv}
                    onClick={handleInventoryTsvUpload}
                    className="bg-slate-500 hover:bg-slate-950 text-white px-6 py-2
                         rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingTsv ? "Uploading..." : "Upload"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModalTsv(false)}
                    disabled={isSavingTsv}
                    className="flex-1 px-4 py-2 border border-slate-700
                         text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
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
          No inventory items found. Add your first item to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product Barcode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Mrp</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {inventory.map((item, index) => (
                <tr key={item.id} className={`transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.barcode}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.Mrp}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editedQuantity}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm
             focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"

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
                          // filter out any non-digit characters from any source
                          const cleaned = e.target.value.replace(/\D+/g, "");
                          setEditedQuantity(cleaned);
                        }}
                      />

                    ) : (
                      <>{item.quantity} units</>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleInventoryEdit(item.id, editedQuantity,item.barcode)}
                          disabled={isSavingEdit || editedQuantity.trim() === "" || Number(editedQuantity) === item.quantity}
                          className="bg-slate-900 hover:bg-slate-950 text-white px-4 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50  cursor-pointer"
                        >
                          {isSavingEdit ? "Saving..." : "Save"}
                        </button>

                        <button
                          onClick={() => { setEditingId(null); setEditedQuantity(""); }}
                          disabled={isSavingEdit}
                          className="px-4 py-2 border border-slate-700 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      role !== "OPERATOR" ? (
                        <button
                          disabled={editingId !== null} // Disable edit button if another row is being edited
                          onClick={() => { setEditingId(item.id); setEditedQuantity(String(item.quantity)); }}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )
                    )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-900 text-white px-6 py-4">
            <p className="text-right font-semibold">Total Items: <span className="text-xl">{inventory.length}</span></p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && inventory.length > 0 && (
        <div className="flex justify-end gap-3 mt-4">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-4 py-1 text-sm">
            Page {currentPage}
          </span>

          <button
            disabled={!hasNextPage || loading}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
