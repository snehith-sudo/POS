import Header from "./components/Header";
import Link from "next/link";

export default async function Home() {
  const data = {
    stats: {
      totalSales: 0,
      ordersToday: 0,
      activeClients: 0,
      totalProducts: 0,
    },
    recentOrders: [],
    topProducts: [],
    recentInventory: [],
  };

  const stats = [
    { label: "Total Sales", value: `$${data.stats.totalSales || '0.00'}`, icon: "📊", gradient: "from-slate-700 to-slate-800" },
    { label: "Orders Today", value: data.stats.ordersToday || '0', icon: "📦", gradient: "from-slate-600 to-slate-700" },
    { label: "Active Clients", value: data.stats.activeClients || '0', icon: "👥", gradient: "from-slate-700 to-slate-800" },
    { label: "Products", value: data.stats.totalProducts || '0', icon: "🛍️", gradient: "from-slate-600 to-slate-700" },
  ];

  const quickActions = [
    { label: "Create Order", href: "/orders", icon: "➕", gradient: "from-slate-700 to-slate-800" },
    { label: "Add Product", href: "/products", icon: "🛒", gradient: "from-slate-700 to-slate-800" },
    { label: "Add Inventory", href: "/inventory", icon: "📦", gradient: "from-slate-700 to-slate-800" },
    { label: "View Clients", href: "/clients", icon: "👨‍💼", gradient: "from-slate-700 to-slate-800" },
    { label: "Sales Report", href: "/salesreport", icon: "📈", gradient: "from-slate-700 to-slate-800" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2 text-slate-900">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Point of Sale Management System</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{order.client}</p>
                      <p className="text-sm text-gray-600">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-700">{order.amount}</p>
                      <p className={`text-xs font-medium ${
                        order.status === "Completed"
                          ? "text-green-600"
                          : order.status === "Pending"
                          ? "text-amber-600"
                          : "text-slate-600"
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">No recent orders</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Top Products</h2>
            <div className="space-y-3">
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} units sold</p>
                    </div>
                    <p className="font-semibold text-slate-700">{product.revenue}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">No products data</p>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Inventory</h2>
            <div className="space-y-3">
              {data.recentInventory.length > 0 ? (
                data.recentInventory.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Product ID: {item.productId}</p>
                      <p className="text-sm text-gray-600">ID: {item.id}</p>
                    </div>
                    <p className="font-semibold text-slate-700">{item.quantity} units</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-6">No inventory data</p>
              )}
            </div>
            <Link href="/inventory" className="mt-4 block text-center text-slate-700 hover:text-slate-900 font-medium py-2 border border-slate-700 rounded hover:bg-slate-50 transition">
              View All Inventory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
