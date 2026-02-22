import api from "../interceptor/axios";

/* pagination */
export const getOrders = (page: number, size: number) =>
  api.post("/orders/pages", { page, size });

/* filter orders */
export function filterOrders(payload: any) {
  return api.post(`/orders/${payload.mode}`, payload);
}

/* invoice order */
export const invoiceOrder = (id: number) =>
  api.put("/orders/update", { orderId: id });

/* order itemss */
export const getOrderItems = (id: number) =>
  api.post("/orders/id", { id });

export function createOrder(items: any[]) {
  return api.post("/orders/createOrder", {
     items
  });
}