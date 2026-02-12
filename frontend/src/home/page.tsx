"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function page() {
    const [invoicedItemsCount, setinvoicedItemsCount] = useState("");
    const [invoicedOrdersCount, setinvoicedOrdersCount] = useState("");
    const [loading, setLoading] = useState(false)
    const [totalRevenue, settotalRevenue] = useState()

    useEffect(() => {
        console.log("Fetching daily report...");
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchReport();
    }, []);

    const fetchedRef = useRef(false);

    const stats = [
        { label: "Total Sales", value: `$ ${totalRevenue}`, icon: "📊", gradient: "from-slate-800 to-slate-800" },
        { label: "Orders Today", value: invoicedOrdersCount || '0', icon: "📦", gradient: "from-slate-800 to-slate-800" },
        { label: "Items Ordered Today", value: invoicedItemsCount || '0', icon: "🛍️", gradient: "from-slate-800 to-slate-800" },
    ];

    const quickActions = [
        { label: "Create Order", href: "/src/orders", icon: "➕", gradient: "from-slate-800 to-slate-800" },
        { label: "Add Product", href: "/src/products", icon: "🛒", gradient: "from-slate-800 to-slate-800" },
        { label: "Add Inventory", href: "/src/inventory", icon: "📦", gradient: "from-slate-800 to-slate-800" },
        { label: "View Clients", href: "/src/clients", icon: "👨‍💼", gradient: "from-slate-800 to-slate-800" },
        { label: "Sales Report", href: "/src/reports", icon: "📈", gradient: "from-slate-800 to-slate-800" },
    ];

    async function fetchReport() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const payload = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };

        const toastId = toast.loading("Fetching sales report...");
        setLoading(true);

        try {
            const res = await fetch("/api/dailyreport", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            setinvoicedItemsCount(result.invoicedItemsCount);
            setinvoicedOrdersCount(result.invoicedOrdersCount);
            settotalRevenue(result.totalRevenue);

            if (!res.ok) {
                toast.error(result.message || "Failed to fetch report", {
                    id: toastId,
                });
                return;
            }
            toast.dismiss(toastId);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong", { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-2 text-slate-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">Point of Sale Management System</p>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className={`bg-gradient-to-br ${stat.gradient} text-white rounded-lg shadow-lg hover:shadow-xl transition duration-200 p-6`}
                        >
                            <div className="text-4xl mb-2">{stat.icon}</div>
                            <p className="opacity-90 text-sm font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className={`bg-gradient-to-r ${action.gradient} text-white rounded-lg shadow-lg hover:shadow-xl transition duration-200 p-6 flex items-center justify-between group`}
                            >
                                <span className="font-semibold">{action.label}</span>
                                <span className="text-2xl group-hover:scale-110 transition">{action.icon}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
