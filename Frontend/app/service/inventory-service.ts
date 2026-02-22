import * as inventoryController from "../controllers/inventoryController";

function normalizeInventoryResponse(result: any) {

  if (!result)
    return { content: [], first: true, last: true };

  // paginated response
  if (Array.isArray(result.content)) {
    return {
      content: result.content,
      first: !!result.first,
      last: !!result.last,
    };
  }

  // single or array search result
  if (Array.isArray(result)) {
    return {
      content: result,
      first: true,
      last: true,
    };
  }

  // single object
  return {
    content: [result],
    first: true,
    last: true,
  };
}


export async function fetchInventory(page: number, size: number) {

  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(size) || size <= 0) size = 10;

  const res = await inventoryController.getInventory(page, size);
  const data = res.data;

  if (!data)
    throw new Error("Failed to fetch inventory");

  return {
    content: Array.isArray(data.content) ? data.content : [],
    first: Boolean(data.first),
    last: Boolean(data.last),
  };
}

export async function searchInventory(barcode: string) {

  if (!barcode.trim())
    throw new Error("Barcode required");

  const res = await inventoryController.filterInventory(barcode.trim());

  return normalizeInventoryResponse(res.data);
}


export async function addInventory(barcode: string, quantity: string) {

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR")
    throw new Error("Not authorized to add inventory items");

  if (!barcode.trim())
    throw new Error("Barcode required");

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0)
    throw new Error("Invalid quantity");

  const payload = {
    barcode: barcode.trim(),
    quantity: qty
  };

  const res = await inventoryController.saveInventory(payload);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Product creation failed");

  return true;
}


export async function editInventory(barcode: string, newQuantity: string) {

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR") throw new Error("Not authorized to edit inventory");

  const qty = Number(newQuantity);
  if (isNaN(qty) || qty < 0) throw new Error("Invalid quantity");

  const payload = {
    barcode: barcode.trim(),
    quantity: qty
  };

  const res = await inventoryController.saveInventory(payload);
  console.log("Edit inventory response:", res);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Product update failed");

  return true;
}

export async function uploadInventoryFile(base64file: string, fileName: string) {

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR")throw new Error("Not authorized to upload TSV");

  if (!base64file)
    throw new Error("No file selected");

  const res = await inventoryController.uploadInventoryTSV({ base64file, fileName });
  return res.data;
}
