import * as orderController from "../controllers/orderController";
import * as inventoryController from "../controllers/inventoryController";

export async function fetchPagedOrders(page: number, size: number) {

  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(size) || size <= 0) size = 10;

  const res = await orderController.getOrders(page, size);
  const data = res.data;

  if (!data)
    throw new Error("Failed to fetch orders");

  return {
    content: Array.isArray(data.content) ? data.content : [],
    first: Boolean(data.first),
    last: Boolean(data.last),
  };
}

export async function filterOrdersService(
  currentPage: number,
  filter: any,
  PAGE_SIZE: number
) {
  if (!filter || (filter.mode !== "orderStatus" && filter.mode !== "dates")) {
    throw new Error("Invalid filter");
  }

  const payload: any = {
    page: Math.max(0, currentPage - 1),
    size: PAGE_SIZE,
    mode: filter.mode,
  };

  console.log("Validating filter with payload:", filter);

  if (filter.mode === "orderStatus") {
    if (!filter.orderStatus)
      throw new Error("Order status required");

    payload.status = filter.orderStatus;
  } else {
    if (!filter.startDate || !filter.endDate)
      throw new Error("Start and End date required");

    payload.startDate = filter.startDate;
    payload.endDate = filter.endDate;
  }

  console.log("Filtering orders with payload:", payload);
  const res = await orderController.filterOrders(payload);

  return res.data;
}

export async function createNewOrder(orderItems: any[]) {

  const role = sessionStorage.getItem("role");

  if (!orderItems || orderItems.length === 0)
    throw new Error("Order must contain at least one item ");

  // validate items
  for (const item of orderItems) {

    if (!item.barcode?.trim())
      throw new Error("Invalid barcode");

    if (!item.orderedQty || item.orderedQty <= 0)
      throw new Error("Invalid quantity");

    if (!item.sellingPrice || item.sellingPrice <= 0)
      throw new Error("Invalid selling price");
  }

  const res = await orderController.createOrder(orderItems);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Order creation failed");

  return true;
}

export async function invoiceOrderService(orderId: number) {

  if (!orderId)
    throw new Error("Invalid order id");

  const res = await orderController.invoiceOrder(orderId);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Order invoice failed");

  return true;
}


export async function fetchOrderItemsById(orderId: number) {

  if (!orderId)
    throw new Error("Order id required");

  const res = await orderController.getOrderItems(orderId);
  const data = res.data;

  return Array.isArray(data) ? data : [];
}

export async function fetchOrderItemsService(orderId: number) {

  if (!orderId || isNaN(orderId))
    throw new Error("Invalid order id");

  const res = await orderController.getOrderItems(orderId);

  const data = res.data;

  if (!Array.isArray(data))
    throw new Error("Invalid order items response");

  return data;
}
export async function validateBarcodeService(barcode: string) {

  if (!barcode || !barcode.trim())
    throw new Error("Barcode is required");

  const res = await inventoryController.filterInventory(barcode.trim());

  const data = res.data;

  const product =
    Array.isArray(data)
      ? data[0]
      : data?.content?.[0] ?? data;

  if (!product)
    throw new Error("Invalid Barcode");

  return product;
}
