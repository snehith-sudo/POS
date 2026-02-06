"use client";

import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type Order = {
  id: number;
  orderTime: string;
  status: string;
}

type OrderItemAdd = {
  orderedQty: number;
  barcode: string;
  sellingPrice: number;
}
// keep these in separate  folder 'TYPES'
// Abstract API calling method
type OrderItem = {
  orderItemId: number;
  orderId: number;
  productId: number;
  orderedQty: number;
  sellingPrice: number;
}
const PAGE_SIZE = 10;


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItemAdd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);


  async function fetchOrders(currentPage: number) {
    setLoading(true);
    try {
      const page = Math.max(0, currentPage - 1);
      const size = PAGE_SIZE;

      console.log("Fetching orders - page:", page, "size:", size, "types:", typeof page, typeof size);

      const res = await fetch("/api/order/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page,
          size,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("API Error:", data?.message || "Failed to fetch orders");
        toast.error(data?.message || "Failed to fetch orders");
        setOrders([]);
        return;
      }

      console.log("fetchOrders - backend returned:", data);

      if (Array.isArray(data)) {
        setOrders(data as Order[]);
      } else if (data && Array.isArray((data as any).orders)) {
        setOrders((data as any).orders as Order[]);
      } else if (data && Array.isArray((data as any).data)) {
        setOrders((data as any).data as Order[]);
      } else {
        console.error("Unexpected orders response shape", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Error fetching orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  function updateItem(
    index: number,
    field: keyof OrderItemAdd,
    value: string
  ) {
    setItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "barcode") {
          return { ...item, barcode: value };
        }

        return {
          ...item,
          [field]: Number(value),
        };
      })
    );
  }
  // Safe checks with ?
  function addRow() {
    setItems([...items, { barcode: "", orderedQty: 0, sellingPrice: 0 }]);
  }

  function removeRow(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ⛔ prevent page reload
    handleOrderCreation();
  }

  async function handleOrderCreation() {

    const toastId = toast.loading("Saving Orders data...");
    setIsSaving(true)
    setLoading(true)

    try {
      if (!items || items.length == 0) {
        toast.error("Required Order Items to create an Order", { id: toastId });
        return;
      }

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ OrderItems: items })
      })

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Error Creating an Order", { id: toastId });
        setIsSaving(false);
        setLoading(false);
        return;
      }

      toast.success(result.message || "Order created successfully", { id: toastId });
      setIsSaving(false);
      setLoading(false)
      setItems([]);
      await fetchOrders(currentPage)
      setShowModal(false)
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Something went wrong", { id: toastId });
    }
  }

  async function fetchOrderItems(id: number) {
    console.log("Order id is ", id)
    setOpenOrderId(id)

    try {
      console.log("Fetching order items for order id:", id);
      const res = await fetch(`/api/orderitems/${id}`, { credentials: "include", });
      const data: OrderItem[] = await res.json();
      setOrderItems(data);

      console.log("order items:", data);
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      setLoading(false);
    }
  }
  async function invoiceOrder(id: number) {
    try {
      setLoading(true);

      const res = await fetch("/api/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Error in backend invoice");
        return;
      }

      toast.success("Order invoiced");
      await fetchOrders(currentPage);

    } catch (error) {
      console.error("Error invoicing order:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-green-100 text-green-800";
      case "INVOICED":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Orders Management
        </h1>
        <p className="text-gray-600">View and manage all your orders</p>
      </div>

      <button className="bg-slate-900 hover:bg-slate-950 text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 mb-6 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        + Create New Order
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-opacity-50  flex items-center justify-center z-50">
          <div className="bg-slate-500 rounded-lg shadow-xl p-8 w-225">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Order</h2>
            <div className="w-208 bg-white rounded-lg shadow p-8">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600">
                  <span>Barcode</span>
                  <span>Quantity</span>
                  <span>Price</span>
                  <span></span>
                </div>

                {/* Order Rows */}
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-center">
                    <input
                      type="text"
                      placeholder="P1001"
                      className="px-3 py-2 border rounded-lg"
                      value={item.barcode || ""}
                      onChange={e => updateItem(index, "barcode", e.target.value)}
                      required
                    />

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
                      value={item.orderedQty || ""}
                      onChange={e => {
                        const cleaned = e.target.value.replace(/\D+/g, "");
                        updateItem(index, "orderedQty", cleaned)}}
                      required
                    />

                    <input
                      type="number"
                      placeholder="Price"
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
                      
                      value={item.sellingPrice || ""}
                      onChange={e => {
                        const cleaned = e.target.value.replace(/\D+/g, "");
                        updateItem(index, "sellingPrice", cleaned)}}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="bg-slate-400 text-500 font-bold rouneded w-10"
                    >
                      X
                    </button>
                  </div>
                ))}

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                    disabled={isSaving}
                  >
                    + Add Item
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || items.length === 0}
                    className="px-6 py-2 rounded-lg transition duration-200 cursor-pointer bg-slate-300 text-slate-900 hover:bg-slate-950 hover:text-white hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:hover:bg-slate-200 disabled:hover:text-slate-500 disabled:hover:shadow-none"
                  >
                    Save Order
                  </button>
                  <button
                    type="button"
                    className="bg-slate-300 hover:bg-slate-950 text-slate-900 hover:text-white px-6 py-2 rounded-lg hover:shadow-lg transition duration-200 cursor-pointer"
                    onClick={() => setShowModal(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No orders found. Create your first order to get started.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
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
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  {/* MAIN ROW */}
                  <tr key={order.id} className="border-b hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setOpenOrderId(openOrderId === order.id ? null : order.id);
                          fetchOrderItems(order.id);
                        }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600
              text-white font-semibold px-4 py-2 rounded-lg hover:from-slate-800 hover:to-slate-900
              shadow-md hover:shadow-lg transition transform hover:scale-105"
                      >
                        #{order.id}
                        <span
                          className={`transition-transform ${openOrderId === order.id ? "rotate-180" : ""
                            }`}
                        >
                          ▾
                        </span>
                      </button>
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.orderTime.slice(2, 10)}
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
                      <button
                        className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg px-6 py-2 shadow-md
             hover:shadow-lg transition transform hover:scale-105
             disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-md disabled:hover:scale-100"
                        onClick={() => invoiceOrder(order.id)}
                        disabled={order.status === "INVOICED"}
                      >
                        {order.status === "INVOICED" ? "Invoiced" : "Invoice the Order"}
                      </button>
                    </td>
                  </tr>

                  {/* DROPDOWN ROW */}
                  {openOrderId === order.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-inner p-4">
                          <h4 className="font-bold text-slate-800 mb-3">
                            Order Items for Order #{order.id}
                          </h4>

                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-slate-600">
                                <th className="py-2">Product</th>
                                <th className="py-2">Quantity</th>
                                <th className="py-2">Price</th>
                                <th className="py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderItems.map((item, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="py-2">{item.productId}</td>
                                  <td className="py-2">{item.orderedQty}</td>
                                  <td className="py-2">₹{item.sellingPrice}</td>
                                  <td className="py-2 font-semibold">
                                    ₹{item.orderedQty * item.sellingPrice}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && (
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