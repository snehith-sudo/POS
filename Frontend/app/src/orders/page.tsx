"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Dropdown } from "@/app/commons/DropDown";
import { LabeledInput } from "@/app/commons/LabelInput";
import { CommonButton, SaveButton, CancelButton } from "@/app/commons/Button";
import { Order, OrderItem, OrderItemAdd, formatUtcToIst } from "@/app/tools/OrderTools";
import { CommonNumberInput } from "@/app/commons/CommonNumberInput";
import { createNewOrder, fetchOrderItemsById, fetchPagedOrders, filterOrdersService, invoiceOrderService, validateBarcodeService } from "@/app/service/order-service";

const PAGE_SIZE = 10;
const today = new Date().toISOString().split("T")[0];


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  // `items` holds confirmed/added items. `currentItem` is the single editing row.
  const [items, setItems] = useState<OrderItemAdd[]>([]);
  const [currentItem, setCurrentItem] = useState<OrderItemAdd>({ barcode: "", orderedQty: null, sellingPrice: null });
  const [pendingProduct, setPendingProduct] = useState<any | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFirst, setIsFirst] = useState<boolean>(true);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [isCheckingBarcode, setCheckingBarcode] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<{
    mode: filterBy;
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null);
  const prevPageRef = useRef<number | null>(null);

  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  type filterBy = "orderStatus" | "dates";
  type orderStatus = "CREATED" | "INVOICED";


  const [filterBy, setfilterBy] = useState<filterBy>("orderStatus");
  const [orderStatus, setOrderStatus] = useState<orderStatus>("CREATED");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (prevPageRef.current === currentPage) return;

    prevPageRef.current = currentPage;
    if (activeFilter) {
      fetchFilteredOrders(currentPage);
    } else {
      fetchOrders(currentPage);
    }
  }, [currentPage, activeFilter]);

  function normalizeOrdersResponse(data: any): Order[] {
    if (data?.content && Array.isArray(data.content))
      return data.content;

    if (Array.isArray(data))
      return data;

    if (data?.orders && Array.isArray(data.orders))
      return data.orders;

    return [];
  }

  async function fetchOrders(currentPage: number) {
    setLoading(true);

    try {
      const data = await fetchPagedOrders(currentPage - 1, PAGE_SIZE);

      setOrders(data.content);
      setIsFirst(data.first);
      setIsLast(data.last);

    } catch (err: any) {
      toast.error(err.message + "is the error" || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchFilteredOrders(currentPage: number, filter = activeFilter) {
    setLoading(true);

    try {
      console.log("Fetching filtered orders with filter:", filter, "and page:", currentPage);
      const data = await filterOrdersService(currentPage, filter, PAGE_SIZE);

      setOrders(normalizeOrdersResponse(data));
      setIsFirst(data?.first ?? false);
      setIsLast(data?.last ?? false);

    } catch (err: any) {
      toast.error(err.message || "Failed to fetch filtered orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function validateAndAddCurrentItem() {
    const barcode = currentItem.barcode.trim();

    if (!barcode)
      return toast.error("Barcode is required");

    setCheckingBarcode(true);

    try {
      const product = await validateBarcodeService(barcode);
      if (product.empty) return toast.error("Invalid Barcode");
      console.log("Barcode validation successful, product:", product.empty);

      setPendingProduct(product);

      setCurrentItem(prev => ({
        ...prev,
        barcode: product.barcode,
        orderedQty: 1,
        sellingPrice: product.Mrp ?? prev.sellingPrice,
      }));

    } catch (err: any) {
      toast.error(err.message || "Invalid Barcode");
    } finally {
      setCheckingBarcode(false);
    }
  }


  async function handleOrderCreation() {
    const toastId = toast.loading("Saving Orders data...");
    setIsSaving(true);
    setLoading(true);

    try {

      console.log("Creating order with items:", items);

      await createNewOrder(items);

      toast.success("Order created successfully", { id: toastId });

      setItems([]);
      setShowModal(false);
      await fetchOrders(currentPage);

    } catch (err: any) {
      toast.error(err.message || "Error Creating an Order", { id: toastId });
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  }


  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleOrderCreation();
  }

  async function fetchOrderItems(id: number) {
    try {
      const data: OrderItem[] = await fetchOrderItemsById(id);
      setOrderItems(data);

    } catch (err: any) {
      toast.error(err.message || "Failed to fetch order items");
      setOrderItems([]);
    }

  }

  async function invoiceOrder(id: number) {
    try {
      setLoading(true);

      await invoiceOrderService(id);

      toast.success("Order invoiced");
      await fetchOrders(currentPage);

    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED": return "bg-green-100 text-green-800";
      case "INVOICED": return "bg-amber-100 text-amber-800";
    }
  };

  function handleFilter() {
    if (filterBy === "orderStatus") {
      if (!orderStatus.trim()) {
        toast.error("Required a value for filtering");
        return;
      }

      const newFilter = { mode: "orderStatus" as filterBy, orderStatus: orderStatus.trim() };
      setActiveFilter(newFilter);
      setCurrentPage(1);
      toast.success("Filter applied");
      fetchFilteredOrders(1, newFilter);

    } else if (filterBy === "dates") {
      if (!startDate || !endDate) {
        toast.error("Start and end dates are required");
        return;
      }

      const tzOffset = "+05:30";
      const zoneId = "Asia/Kolkata";
      const startDateTime = `${startDate}T00:00:00${tzOffset}[${zoneId}]`;
      const endDateTime = `${endDate}T23:59:59${tzOffset}[${zoneId}]`;

      const newFilter = {
        mode: "dates" as filterBy,
        startDate: startDateTime,
        endDate: endDateTime,
      };
      setActiveFilter(newFilter);
      setCurrentPage(1);
      toast.success("Filter applied");
      fetchFilteredOrders(1, newFilter);
    }
  }

  function handleClearFilter() {
    setActiveFilter(null);
    setCurrentPage(1);
    setOrderStatus("CREATED");
    setStartDate("");
    setEndDate("");
    fetchOrders(1);
    toast.success("Filter cleared");
  }
  /** Functions for handling the Modal Form */
  function confirmAddItem() {
    if (!pendingProduct) return;
    const maxQty = Number(pendingProduct.quantity ?? pendingProduct.quantityAvailable ?? 0);
    const maxMrp = Number(pendingProduct.Mrp ?? pendingProduct.MRP ?? pendingProduct.mrp ?? 0);

    if (!currentItem.orderedQty || currentItem.orderedQty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // compute how many units of this product are already reserved in the items list
    const pid = pendingProduct.id ?? pendingProduct.productId ?? pendingProduct.barcode;
    const existingQty = items.reduce((sum, it, idx) => {
      if (idx === editingIndex) return sum; // exclude the item we're editing
      if ((it as any).productId === pid || (it as any).barcode === pendingProduct.barcode) {
        return sum + Number((it as any).orderedQty ?? 0);
      }
      return sum;
    }, 0);

    if (editingIndex === null) {
      const duplicate = items.some(it => (it as any).productId === pid || (it as any).barcode === pendingProduct.barcode);
      if (duplicate) {
        toast.error("Duplicate barcode not allowed. Edit the existing item instead.");
        return;
      }
    }

    if (existingQty + Number(currentItem.orderedQty ?? 0) > maxQty) {
      const remaining = Math.max(0, maxQty - existingQty);
      toast.error(`Quantity cannot exceed available stock. Remaining available: ${remaining}`);
      return;
    }

    if (!currentItem.sellingPrice || currentItem.sellingPrice <= 0) {
      toast.error("Selling price must be greater than 0");
      return;
    }

    if (currentItem.sellingPrice > maxMrp) {
      toast.error(`Selling price cannot exceed MRP ($${maxMrp})`);
      return;
    }

    const enriched = {
      ...currentItem,
      name: pendingProduct.name,
      productId: pendingProduct.id,
      availableQty: maxQty,
      Mrp: maxMrp,
    } as any;

    if (editingIndex !== null) {
      setItems(prev => prev.map((it, i) => i === editingIndex ? enriched : it));
      setEditingIndex(null);
    } else {
      setItems(prev => [...prev, enriched]);
    }

    setPendingProduct(null);
    addEmptyCurrentItem();
    console.log("Current items in order:", items);
    toast.success("Item added");
  }

  function startEditItem(index: number) {
    const it = items[index] as any;
    setEditingIndex(index);
    setCurrentItem({ barcode: it.barcode, orderedQty: it.orderedQty, sellingPrice: it.sellingPrice });
    setPendingProduct({ id: it.productId, barcode: it.barcode, name: it.name, quantity: it.availableQty ?? it.quantity ?? 0, Mrp: it.Mrp ?? it.sellingPrice });
  }

  function addEmptyCurrentItem() {
    setCurrentItem({ barcode: "", orderedQty: null, sellingPrice: null });
    setPendingProduct(null);
    setEditingIndex(null);
  }

  function updateCurrentItem(field: keyof OrderItemAdd, value: any) {
    if (field === "barcode") {
      setCurrentItem(prev => ({ ...prev, barcode: String(value) }));
      return;
    }

    if (field === "orderedQty") {
      const n = Number(value);
      let final = Number.isNaN(n) ? null : n;
      if (final !== null && effectiveAvailable > 0 && final > effectiveAvailable) final = effectiveAvailable;
      setCurrentItem(prev => ({ ...prev, orderedQty: final }));
      return;
    }

    if (field === "sellingPrice") {
      const n = Number(value);
      const maxMrp = Number(pendingProduct?.Mrp ?? pendingProduct?.MRP ?? pendingProduct?.mrp ?? 0);
      let final = Number.isNaN(n) ? null : n;
      if (final !== null && maxMrp > 0 && final > maxMrp) final = maxMrp;
      setCurrentItem(prev => ({ ...prev, sellingPrice: final }));
      return;
    }
  }

  function removeRow(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  const canAddItem = pendingProduct
    ? Boolean(
      currentItem.orderedQty && currentItem.orderedQty > 0 &&
      currentItem.sellingPrice && currentItem.sellingPrice > 0 &&
      Number(currentItem.orderedQty) <= Number(pendingProduct.quantity ?? pendingProduct.quantityAvailable ?? 0) &&
      Number(currentItem.sellingPrice) <= Number(pendingProduct.Mrp ?? pendingProduct.MRP ?? pendingProduct.mrp ?? 0)
    )
    : Boolean(currentItem.barcode && currentItem.barcode.trim().length > 0);

  const productName = pendingProduct ? pendingProduct.name || pendingProduct.barcode : "";
  const availableQty = pendingProduct ? Number(pendingProduct.quantity ?? pendingProduct.quantityAvailable ?? pendingProduct.availableQty ?? 0) : 0;
  const productMrp = pendingProduct ? Number(pendingProduct.Mrp ?? pendingProduct.MRP ?? pendingProduct.mrp ?? 0) : 0;
  const editingReservedQty = editingIndex !== null ? Number(items[editingIndex]?.orderedQty ?? 0) : 0;
  const effectiveAvailable = availableQty + editingReservedQty;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900">
            Orders Management
          </h1>
          <p className="text-gray-600">View and manage all your orders</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full h-full sm:h-auto overflow-auto sm:max-w-3xl md:max-w-6xl sm:max-h-[85vh] flex flex-col">
            <form onSubmit={handleSubmit} className="bg-white rounded-t-lg sm:rounded-lg w-full h-full sm:h-auto overflow-auto sm:max-w-3xl md:max-w-6xl sm:max-h-[85vh] flex flex-col">
              <div className="px-8 py-4 border-b border-gray-200
                      bg-slate-200 rounded-t-lg shrink-0">
                <h2 className="text-2xl font-bold text-slate-900">
                  Create New Order
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-gray-600 sticky top-0 py-2 z-10">
                  <div>
                    <span className="font-semibold text-slate-900 text-lg">Barcode</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 text-lg">Quantity</span>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 text-lg">Price</span>
                  </div>

                  <div className="flex justify-end">
                    <span className="font-semibold text-slate-900 text-lg">Actions</span>
                  </div>
                </div>
              </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                {/* Current editing row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center mt-0 border-b pb-4">

                  {/* If we don't have a pendingProduct, ask barcode first */}
                  {!pendingProduct ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter Barcode"
                        className="px-3 py-2 border rounded-lg text-lg"
                        value={currentItem.barcode || ""}
                        onChange={e => updateCurrentItem("barcode", e.target.value)}
                      />

                      <div className="flex gap-2">
                        <SaveButton type="button" disabled={!currentItem.barcode.trim() || isCheckingBarcode} onClick={validateAndAddCurrentItem}>
                          {isCheckingBarcode ? "Checking..." : "Fetch"}
                        </SaveButton>
                        <CancelButton type="button" onClick={addEmptyCurrentItem} disabled={isCheckingBarcode || isSaving}>
                          Clear
                        </CancelButton>
                      </div>
                    </>
                  ) : (
                    /* pendingProduct available — show qty and price inputs bounded by backend values */
                    <>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Product: {productName}</label>
                        <input
                          type="text"
                          placeholder="Barcode"
                          className="px-3 py-2 border rounded-lg bg-gray-50 w-full text-lg"
                          value={pendingProduct.barcode}
                          readOnly
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Available: {availableQty}</label>
                        <CommonNumberInput
                          placeholder="Qty"
                          value={currentItem.orderedQty ?? ""}
                          required
                          onChange={(val) => updateCurrentItem("orderedQty", val)}
                          max={pendingProduct.quantity ?? pendingProduct.quantityAvailable ?? undefined}
                          min={1}
                          className="w-full text-lg"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">MRP: ${productMrp}</label>
                        <CommonNumberInput
                          placeholder="Selling Price"
                          required
                          value={currentItem.sellingPrice ?? ""}
                          onChange={(val) => updateCurrentItem("sellingPrice", val)}
                          className="w-full text-lg"
                        />
                      </div>

                      <div className="flex gap-2 items-center">
                        <SaveButton type="button" disabled={!canAddItem || isCheckingBarcode} onClick={confirmAddItem}>
                          {editingIndex !== null ? "Save" : "Add"}
                        </SaveButton>
                        <CancelButton type="button" onClick={() => { setPendingProduct(null); addEmptyCurrentItem(); setEditingIndex(null); }} disabled={isCheckingBarcode || isSaving}>
                          Cancel
                        </CancelButton>
                      </div>
                    </>
                  )}
                </div>

                {/* Confirmed items list */}
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500 mt-4">No items added yet.</div>
                ) : (
                  items.map((item: any, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-center mt-3">
                      {/* Name / Barcode cell */}
                      <div className="px-3 py-2 border rounded-lg">
                        <div className="font-medium">{item.name ?? item.barcode}</div>
                        <div className="text-xs text-gray-500">{item.barcode}</div>
                      </div>

                      {/* Quantity cell */}
                      <div className="px-3 py-2 border rounded-lg">{item.orderedQty}</div>

                      {/* Price cell */}
                      <div className="px-3 py-2 border rounded-lg">${item.sellingPrice}</div>

                      {/* Actions */}
                      {confirmIndex === index ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              removeRow(index);
                              setConfirmIndex(null);
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmIndex(null)}
                            className="bg-green-300 px-3 py-1 rounded"
                          >
                            Keep
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditItem(index)}
                            className="bg-slate-400 px-3 py-1 rounded hover:bg-slate-600 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmIndex(index)}
                            className="bg-red-400 px-3 py-1 rounded hover:bg-red-800 hover:text-white"
                          >
                            Remove Item
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}

              </div>

              <div className="px-8 py-4 border-t border-gray-200
                      bg-slate-100 rounded-b-lg
                      flex gap-3 justify-start shrink-0">

                <CommonButton onClick={validateAndAddCurrentItem} disabled={isSaving || !canAddItem}>
                  Add Item
                </CommonButton>

                <SaveButton disabled={isSaving || items.length === 0} type="submit">
                  Save Order
                </SaveButton>

                <CancelButton onClick={() => { setShowModal(false); setItems([]) }} disabled={isSaving}>
                  Cancel
                </CancelButton>
              </div>
            </form>

          </div>
        </div>
      )}



      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Loading orders...
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-6">

              {/* Filter Type */}
              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter By
                </label>
                <Dropdown
                  value={filterBy}
                  onChange={(v) => setfilterBy(v)}
                  options={[
                    { value: "orderStatus", label: "Order Status" },
                    { value: "dates", label: "Date Range" },
                  ]}
                />
              </div>

              {/* Client */}
              {(filterBy === "orderStatus") && (
                <div className="w-full sm:w-auto">
                  <Dropdown
                    value={orderStatus}
                    onChange={(v) => setOrderStatus(v)}
                    options={[
                      { value: "CREATED", label: "Created" },
                      { value: "INVOICED", label: "Invoiced" },
                    ]}
                  />
                </div>
              )}

              {/* Start Date */}
              {(filterBy === "dates") && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    max={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              )}

              {/* End Date */}
              {(filterBy === "dates") && (
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              )}

              {/* Search Button */}
              <div className="w-full sm:w-auto">
                <CommonButton onClick={handleFilter}
                  disabled={(filterBy === "dates" && (!startDate || !endDate)) ||
                    (filterBy === "orderStatus" && !orderStatus.trim())} className="w-full sm:w-auto">
                  Search
                </CommonButton>
              </div>

              {/* Clear Filter Button - Show only when filter is active */}
              {activeFilter && (
                <div className="w-full sm:w-auto">
                  <CommonButton onClick={handleClearFilter} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                    Clear Filter
                  </CommonButton>
                </div>
              )}
            </div>
            <CommonButton onClick={() => setShowModal(true)} className="w-full sm:w-auto">
              Create New Order
            </CommonButton>
          </div>
          <div className="flex justify-end gap-3">
            <CommonButton disabled={isFirst || loading} onClick={() => setCurrentPage(p => p - 1)}>
              Prev
            </CommonButton>

            <span className="py-1 mt-5">
              Page {currentPage}
            </span>

            <CommonButton disabled={isLast || loading} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </CommonButton>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow mt-2">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6">
                      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        No orders found. Create your first order to get started.
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      {/* MAIN ROW */}
                      <tr key={order.id} className="border-b hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              const isOpen = openOrderId === order.id;

                              if (isOpen) {
                                setOpenOrderId(null);
                              } else {
                                setOpenOrderId(order.id);
                                fetchOrderItems(order.id);
                              }
                            }}

                            className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600
              text-white font-semibold px-4 py-2 rounded-lg hover:from-slate-800 hover:to-slate-900
              shadow-md hover:shadow-lg transition transform hover:scale-105"
                          >
                            #{(currentPage - 1) * PAGE_SIZE + index + 1}
                            <span
                              className={`transition-transform ${openOrderId === order.id ? "rotate-180" : ""
                                }`}
                            >
                              ▾
                            </span>
                          </button>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatUtcToIst(order.orderTime)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 space-x-2">
                          <CommonButton onClick={() => invoiceOrder(order.id)}
                            disabled={order.status === "INVOICED"}
                          >
                            {order.status === "INVOICED" ? "Invoiced" : "Invoice the Order"}
                          </CommonButton>
                        </td>
                      </tr>

                      {/* DROPDOWN ROW */}
                      {openOrderId === order.id && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-inner p-4">
                              <h4 className="font-bold text-slate-800 mb-3">
                                Order Items for Order
                              </h4>

                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-slate-600">
                                    <th className="py-2">Product Name</th>
                                    <th className="py-2">Barcode</th>
                                    <th className="py-2">Quantity</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderItems.map((item, idx) => (
                                    <tr key={idx} className="border-t">
                                      <td className="py-2">{item.name}</td>
                                      <td className="py-2">{item.barcode}</td>
                                      <td className="py-2">{item.orderedQty}</td>
                                      <td className="py-2">${item.sellingPrice}</td>
                                      <td className="py-2 font-semibold">
                                        ${item.orderedQty * item.sellingPrice}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}