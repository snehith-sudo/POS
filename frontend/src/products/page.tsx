"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { Dropdown } from "@/app/commons/DropDown";
import { CommonButton, SaveButton, CancelButton } from "@/app/commons/Button";
import { LabeledInput } from "@/app/commons/LabelInput";
import { DataTable } from "@/app/commons/DataTable";
import { SAMPLE_TSV, PAGE_SIZE, Product, MAX_NAME_LENGTH } from "@/app/tools/ProductTools";
import { downloadSampleTsv } from "@/app/commons/TSVFileDownload";

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
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);
  const prevPageRef = useRef<number | null>(null);


  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [clientName, setclientName] = useState("");
  const [mrp, setMrp] = useState("");
  const [imageUrl, setimageUrl] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    barcode: "",
    mrp: "",
    imageUrl: ""
  });
  const [role, setRole] = useState<string | null>(null);

  type FilterBy = "barcode" | "clientName";

  const [filterBy, setFilterBy] = useState<FilterBy>("barcode");
  const [searchValue, setSearchValue] = useState("");
  const [barcodeFilterApplied, setBarcodeFilterApplied] = useState(false);
  const [activeProductFilter, setActiveProductFilter] = useState<{
    filter: FilterBy;
    search: string;
  } | null>(null);

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

      // Extract content array and pagination metadata
      setProducts(data.content || []);
      setIsFirst(data.first || false);
      setIsLast(data.last || false);
      console.log("Products fetched:", data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }




  async function fetchFilteredProducts(pageNum: number, filterObj: { filter: FilterBy; search: string }) {
    setLoading(true);
    try {
      const page = Math.max(0, pageNum - 1);
      const size = PAGE_SIZE;

      const res = await fetch("/api/products/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ search: filterObj.search, filter: filterObj.filter, page, size }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("API Error:", data?.message || "Failed to fetch filtered products");
        toast.error(data?.message || "Failed to fetch products");
        setProducts([]);
        return;
      }

      setProducts(data.content || []);
      setIsFirst(data.first || false);
      setIsLast(data.last || false);
    } catch (err) {
      console.error("Error fetching filtered products:", err);
      toast.error("Error fetching products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Skip if same value (covers StrictMode remount)
    if (prevPageRef.current === currentPage) return;

    prevPageRef.current = currentPage;
    if (activeProductFilter) {
      fetchFilteredProducts(currentPage, activeProductFilter);
    } else {
      fetchData(currentPage);
    }
  }, [currentPage, activeProductFilter]);


  useEffect(() => {
    setRole(sessionStorage.getItem("role"));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ⛔ prevent page reload
    handleProductAddition();
  }

  async function handleFilter() {

    const toastId = toast.loading("Fetching Product data...");
    setCurrentPage(1)

    if (!searchValue.trim()) {
      toast.error("Required a value for filtering", { id: toastId });
      return;
    }

    const res = await fetch("/api/products/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ search: searchValue, filter: filterBy })
    })
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Failed to fetch product", { id: toastId });
      setLoading(false)
      setIsSaving(false)
      return;
    }

    toast.success(result.message || "Result got successfully", { id: toastId });

    const normalizedProducts = Array.isArray(result) ? result : [result];

    // If filtering by clientName backend returns paginated response, handle accordingly
    if (filterBy === "clientName" && result && result.content) {
      setProducts(result.content || []);
      setIsFirst(result.first || false);
      setIsLast(result.last || false);
      setActiveProductFilter({ filter: filterBy, search: searchValue });
      setBarcodeFilterApplied(false);
    } else {
      // non-paginated response (barcode)
      setProducts(normalizedProducts);
      setBarcodeFilterApplied(true);
      setActiveProductFilter({ filter: filterBy, search: searchValue });
    }
  }

  function handleClearFilter() {
    setSearchValue("");
    setBarcodeFilterApplied(false);
    setActiveProductFilter(null);
    setCurrentPage(1);
    fetchData(1);
    toast.success("Filter cleared");
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
      backendclientName: clientName,
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
    setclientName("");
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
      barcode: editFormData.barcode,
      productName: editFormData.name,
      mrp: editFormData.mrp,
      url: editFormData.imageUrl
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

    setIsSaving(false);
    setIsEditMode(false);
    setEditingProduct(null);
    setEditingProductId(null);
    setEditFormData({
      name: "",
      barcode: "",
      mrp: "",
      imageUrl: ""
    });
    await fetchData(currentPage);
    setLoading(false)
  }

  function startInlineEdit(product: Product) {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      barcode: product.barcode,
      mrp: String(product.mrp),
      imageUrl: product.imageUrl
    });
    setIsEditMode(true);
  }

  function cancelInlineEdit() {
    setIsEditMode(false);
    setEditingProductId(null);
    setEditFormData({
      name: "",
      barcode: "",
      mrp: "",
      imageUrl: ""
    });
  }

  function closeModal() {
    setShowModal(false);
    setIsEditMode(false);
    setEditingProduct(null);
    setBarcode("");
    setclientName("");
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

      // Convert result to TSV format and download
      const tsvData = "Barcode\tStatus\n" +
        Object.entries(result)
          .map(([barcode, status]) => `${barcode}\t${status}`)
          .join("\n");

      downloadSampleTsv(tsvData, "upload_result");
      toast.success("Results downloaded as TSV", { id: toastId });

      setIsSavingTsv(false);

    } catch (error) {
      toast.error("Error uploading file", { id: toastId });
    } finally {
      setIsSavingTsv(false);
    }
  }
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Products Management
        </h1>
        <p className="text-gray-600">View and manage your product inventory</p>
      </div>

      <div className="flex items-end justify-between gap-4 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter By
            </label>
            <Dropdown
              value={filterBy}
              onChange={(v) => setFilterBy(v)}
              options={[
                { value: "barcode", label: "Barcode" },
                { value: "clientName", label: "Client Name" },
              ]}
            />
          </div>

          <div>

            <LabeledInput
              label={`Search by ${filterBy}`}
              placeholder={`Search by ${filterBy}`}
              value={searchValue}
              onChange={setSearchValue}
              className="w-56"
            />

          </div>

          <CommonButton onClick={handleFilter} disabled={!searchValue.trim()}>
            Search
          </CommonButton>

          {activeProductFilter !== null && (
            <CommonButton onClick={handleClearFilter} className="bg-orange-500 hover:bg-orange-600">
              Clear Filter
            </CommonButton>
          )}
        </div>

        {role !== "OPERATOR" && (
          <div className="flex gap-3">
            <CommonButton onClick={() => setShowModal(true)}>
              Add New Product
            </CommonButton>

            <CommonButton onClick={() => setShowModalTsv(true)}>
              Bulk Products Upload
            </CommonButton>
          </div>
        )}
      </div>


      {showmodal && (
        <div className="fixed inset-0 bg-opacity-50  bg-black/50 backdrop-blur-md  flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Add New Product
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
                      <p className={`text-sm ${productName.trim().length > MAX_NAME_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
                        {productName.length}/{MAX_NAME_LENGTH}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter barcode"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                      value={barcode}
                      onChange={e => {
                        setBarcode(e.target.value);
                      }}
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
                        placeholder="Qty"
                        className="px-3 py-2 border rounded-lg"
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
                        value={mrp}
                        onChange={e => {
                          const cleaned = e.target.value.replace(/\D+/g, "");
                          setMrp(cleaned);
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter client name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                        value={clientName}
                        onChange={e => setclientName(e.target.value)}
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
                    <SaveButton
                      type="submit"
                      disabled={isSaving || productName.trim().length > MAX_NAME_LENGTH}
                    >
                      Save Product
                    </SaveButton>

                    <CancelButton
                      onClick={closeModal}
                      disabled={isSaving}
                    >
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
            <CommonButton onClick={() => downloadSampleTsv(SAMPLE_TSV, "products")} className="bg-slate-700">
              Download Sample TSV
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

                    <CancelButton
                      type="button"
                      onClick={() => {
                        setUploadedFileName(null);
                        setBase64File(null);
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </CancelButton>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <SaveButton disabled={!base64File || isSavingTsv} onClick={handleProductTsvUpload}>
                    {isSavingTsv ? "Uploading..." : "Upload"}
                  </SaveButton>

                  <CancelButton onClick={() => setShowModalTsv(false)} disabled={isSavingTsv}>
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
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No products found.
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

            <CommonButton disabled={isLast || loading || barcodeFilterApplied} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </CommonButton>
          </div>

          <DataTable
            data={products}
            rowKey={(row, index) => `${row.id}-${index}`}
            columns={[
              {
                header: "S.No",
                render: (_row, index) => (currentPage - 1) * PAGE_SIZE + (index ?? 0) + 1,
              },
              {
                header: "Name",
                render: (product) => {
                  if (isEditMode && editingProductId === product.id) {
                    return (
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    );
                  }
                  return product.name;
                },
              },
              {
                header: "Barcode",
                render: (product) => product.barcode,
              },
              {
                header: "Price",
                render: (product) => {
                  if (isEditMode && editingProductId === product.id) {
                    return (
                      <input
                        type="number"
                        value={editFormData.mrp}
                        onChange={(e) => setEditFormData({ ...editFormData, mrp: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    );
                  }
                  return `$${product.mrp}`;
                },
              },
              {
                header: "Image",
                render: (product) => {
                  if (isEditMode && editingProductId === product.id) {
                    return (
                      <input
                        type="url"
                        value={editFormData.imageUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                        placeholder="Image URL"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    );
                  }
                  return product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <span className="text-gray-500">No Image</span>
                  );
                },
              },
              ...(role !== "OPERATOR"
                ? [
                  {
                    header: "Actions",
                    render: (product: Product) =>
                      isEditMode && editingProductId === product.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleProductUpdate}
                            disabled={isSaving}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded text-sm hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelInlineEdit}
                            disabled={isSaving}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm hover:shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startInlineEdit(product)}
                          className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                        >
                          Edit
                        </button>
                      ),
                  },
                ]
                : []),
            ]}
          />
        </>
      )}
    </div>
  );
}
