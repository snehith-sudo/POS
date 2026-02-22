"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderItem } from "@/app/tools/OrderItemTools";
import { toast } from "react-hot-toast";
import { fetchOrderItemsService } from "@/app/service/order-service";

export default function OrderItemsPage() {
  const params = useParams();
  const id = params.id;
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);


async function fetchOrderItems() {

  setLoading(true);

  try {

    const data: OrderItem[] = await fetchOrderItemsService(Number(id));
    setOrderItems(data);

  } catch (err: any) {
    toast.error(err.message || "Failed to fetch order items");
    setOrderItems([]);
  } finally {
    setLoading(false);
  }
}



  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchOrderItems();
    }
  }, [id]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/orders" className="text-slate-700 hover:text-slate-900 font-medium mb-4 inline-block">
          ← Back to Orders
        </Link>
        <h1 className="text-4xl font-bold mb-2 text-slate-900">
          Order #{id} Items
        </h1>
        <p className="text-gray-600">View all items in this order</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          Loading order items...
        </div>
      ) : orderItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No items found in this order.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Item ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Product ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orderItems.map((item, index) => (
                <tr key={item.orderItemId} className={`transition duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-100`}>
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.orderItemId}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.productId}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{item.orderedQty} units</td>
                  <td className="px-6 py-4 font-medium text-gray-700">${item.sellingPrice}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">${(item.orderedQty * item.sellingPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-slate-900 text-white px-6 py-4">
            <p className="text-right text-lg font-bold">
              Grand Total: ${orderItems.reduce((sum, item) => sum + (item.orderedQty * item.sellingPrice), 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
