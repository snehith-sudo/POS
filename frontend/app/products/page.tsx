"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SnackLoader from "../Utils/SnackLoader";
import { Upload } from "lucide-react";

type Product = {
  barcode: string;
  clientId: string;
  id: number;
  imageUrl: string;
  mrp: number;
  name: string;
}
const PAGE_SIZE = 10;


export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showmodal, setShowModal] = useState(false);
  const [showmodalTSV, setShowModalTsv] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTsv, setIsSavingTsv] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [clientId, setClientId] = useState("");
  const [mrp, setMrp] = useState("");
  const [imageUrl, setimageUrl] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [role, setRole] = useState<string | null>(null);

  type FilterBy = "barcode" | "clientName";

  const [filterBy, setFilterBy] = useState<FilterBy>("barcode");
  const [searchValue, setSearchValue] = useState("");



  async function fetchData(currentPage: number) {
    setLoading(true);

    try {
      const page = Math.max(0, currentPage - 1);
      const size = PAGE_SIZE;

      console.log("Fetching products - page:", page, "size:", size, "types:", typeof page, typeof size);

      const res = await fetch("/api/products/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page,
          size,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data?.message || "Failed to fetch products");
        toast.error(data?.message || "Failed to fetch products");
        setProducts([]);
        return;
      }

      setProducts(data);
      console.log("Products fetched:", data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Error fetching products");
      setProducts([]);
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
    if (isEditMode) {
      handleProductUpdate();
    } else {
      handleProductAddition();
    }
  }

  async function handleFilter() {

    const toastId = toast.loading("Saving Product data...");

    if (!searchValue.trim()) toast.error("Required a value for filtering", { id: toastId });

    const res = await fetch("/api/products/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ search: searchValue, filter: filterBy })
    })
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to add Product", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Result got successfully",
      { id: toastId });


    const normalizedProducts = Array.isArray(result) ? result : [result];

    setProducts(normalizedProducts);
  }

  async function handleProductAddition() {
    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to add products");
      setIsSaving(false);
      setLoading(false);
      return;
    }

    setIsSaving(true);
    setLoading(true);

    const payload = {
      backendBarcode: barcode,
      backendProductName: productName,
      backendClientId: clientId,
      backendMrp: mrp,
      backendImageUrl: imageUrl
    };
    const toastId = toast.loading("Saving Product data...");

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("Got hit #2")

    if (!res.ok) {
      toast.error(result.message || "Failed to add Product", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Product added successfully",
      { id: toastId });

    setBarcode("");
    setClientId("");
    setMrp("");
    setProductName("");
    setimageUrl("");
    setIsSaving(false);
    setShowModal(false);
    await fetchData(currentPage);
    setLoading(false)
    console.log("Got hit #4")
  }

  async function handleProductUpdate() {
    const currentRole = sessionStorage.getItem("role");
    if (currentRole === "OPERATOR") {
      toast.error("Not authorized to update products");
      setIsSaving(false);
      setLoading(false);
      return;
    }
    setIsSaving(true);
    setLoading(true);

    const payload = {
      barcode,
      productName,
      clientId,
      mrp,
      url: imageUrl
    };

    const toastId = toast.loading("Updating Product data...");

    const res = await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to update Product", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Product updated successfully", { id: toastId });

    setBarcode("");
    setClientId("");
    setMrp("");
    setProductName("");
    setimageUrl("");
    setIsSaving(false);
    setShowModal(false);
    setIsEditMode(false);
    setEditingProduct(null);
    await fetchData(currentPage);
    setLoading(false)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setProductName(product.name);
    setBarcode(product.barcode);
    setClientId(product.clientId);
    setMrp(String(product.mrp));
    setimageUrl(product.imageUrl);
    setIsEditMode(true);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsEditMode(false);
    setEditingProduct(null);
    setBarcode("");
    setClientId("");
    setMrp("");
    setProductName("");
    setimageUrl("");
  }

  const handleProductTsvAddition = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name); // show filename

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setBase64File(base64); // store base64
      console.log("Base64 file loaded:", base64); // log AFTER file is read
    };

    reader.readAsDataURL(file);
  };

  async function handleProductTsvUpload() {
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

      const res = await fetch("/api/products/tsv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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



  if (loading) return <SnackLoader />



  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Products Management
        </h1>
        <p className="text-gray-600">View and manage your product inventory</p>
      </div>

      <div className="flex items-end gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="barcode">Barcode</option>
            <option value="clientName">Client Name</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder={`Search by ${filterBy}`}
            
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        <button
          onClick={handleFilter}
          disabled={!searchValue.trim()}
          className="h-9 px-4 bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white rounded-lg hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>

        {role !== "OPERATOR" && (
          <>
            <button
              className="ml-60 bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              + Add New Product
            </button>

            {/* Upload TSV */}
            <button
              className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
              onClick={() => setShowModalTsv(true)}
            >
              + Upload TSV File
            </button>
          </>
        )}
      </div>


      {showmodal && (
        <div className="fixed inset-0 bg-opacity-50  flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="max-w-2xl bg-white rounded-lg shadow p-8">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter product name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      placeholder="P00981"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      value={barcode}
                      onChange={e => setBarcode(e.target.value)}
                      disabled={isEditMode}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        value={mrp}
                        onChange={e => setMrp(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        value={clientId}
                        onChange={e => setClientId(e.target.value)}
                        disabled={isEditMode}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      value={imageUrl}
                      onChange={e => setimageUrl(e.target.value)}
                    />
                  </div>


                  <div className="flex gap-3">
                    <button
                      className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                      type="submit"
                    >
                      {isEditMode ? "Update Product" : "Save Product"}
                    </button>
                    <button
                      onClick={closeModal}
                      disabled={isSaving}
                      className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"                    >
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
                      onChange={handleProductTsvAddition}
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
                    onClick={handleProductTsvUpload}
                    className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingTsv ? "Uploading..." : "Upload"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowModalTsv(false)}
                    disabled={isSavingTsv}
                    className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white
               px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
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
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No products found. Add your first product to get started.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border-2 border-slate-800">
          <table className="min-w-full">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-2 border-r border-slate-700 text-left text-sm font-semibold">S.No</th>
                <th className="px-4 py-2 border-r border-slate-700 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-2 border-r border-slate-700 text-left text-sm font-semibold">Barcode</th>
                <th className="px-4 py-2 border-r border-slate-700 text-left text-sm font-semibold">Price</th>
                <th className="px-4 py-2 border-r border-slate-700 text-left text-sm font-semibold">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-4 py-2 border-r border-slate-300 text-center">{product.id}</td>
                  <td className="px-4 py-2 border-r border-slate-300">{product.name}</td>
                  <td className="px-4 py-2 border-r border-slate-300">{product.barcode}</td>
                  <td className="px-4 py-2 border-r border-slate-300">₹{product.mrp}</td>
                  <td className="px-4 py-2 border-r border-slate-300 text-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-500">No Image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {role !== "OPERATOR" ? (
                      <button 
                        onClick={() => openEditModal(product)}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
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
