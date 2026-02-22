import { version } from "os";
import * as productController from "../controllers/productController";

/* =========================================================
   RESPONSE NORMALIZER  (CRITICAL)
   Converts all backend responses into ONE consistent shape
   ========================================================= */

function normalizeProductResponse(result: any) {
  if (!result) return { content: [], first: true, last: true };

  // paginated response
  if (Array.isArray(result.content)) {
    return {
      content: result.content,
      first: !!result.first,
      last: !!result.last,
    };
  }

  // barcode search → single object
  if (result?.barcode) {
    return {
      content: [result],
      first: true,
      last: true,
    };
  }

  // fallback → array
  if (Array.isArray(result)) {
    return {
      content: result,
      first: true,
      last: true,
    };
  }

  return { content: [], first: true, last: true };
}

/* =========================================================
   PAGINATED PRODUCTS (NORMAL PAGE LOAD / NEXT / PREV)
   ========================================================= */

export async function fetchProductsService(page: number, size: number) {
  const safePage = Math.max(0, page);

  const res = await productController.getProducts(safePage, size);

  console.log("Raw backend response:", res);
  return normalizeProductResponse(res.data);
}

/* =========================================================
   FILTER PRODUCTS (barcode OR clientName)
   ========================================================= */

export async function filterProductsService(
  filter: string,
  search: string,
  page: number,
  size: number
) {
  if (!search || !search.trim())
    throw new Error("Search value required");

  let res;

  // barcode search → NO pagination
  if (filter === "barcode") {
    console.log("Performing barcode search for:", search.trim());
    res = await productController.filterProducts({
      filter: "barcode",
      search: search.trim(),
    });
  }
  // client search → pagination required
  else {
    console.log("Performing client name search for:", search.trim(), "with page:", page, "and size:", size);
    res = await productController.filterProducts({
      filter: "clientName",
      search: search.trim().toLowerCase(),
      page,
      size,
    });
  }

  return normalizeProductResponse(res.data);
}

/* =========================================================
   ADD PRODUCT
   ========================================================= */

export async function addProductService(form: {
  barcode: string;
  productName: string;
  clientName: string;
  mrp: string;
  imageUrl?: string;
}) {

  console.log("Adding product with form data:", form);

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR") throw new Error("Not authorized to add products");

  if (!form.barcode.trim()) throw new Error("Barcode is required");

  if (!form.productName.trim()) throw new Error("Product name is required");

  if (!form.clientName.trim()) throw new Error("Client name is required");

  const mrp = Number(form.mrp);
  if (isNaN(mrp) || mrp <= 0) throw new Error("Invalid MRP");

  const payload = {
    barcode: form.barcode.trim(),
    name: form.productName.trim(),
    clientName: form.clientName.trim().toLowerCase(),
    mrp: mrp,
    imageUrl: form.imageUrl || null,
  };

  const res = await productController.addProduct(payload);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Product creation failed");

  return true;
}

/* =========================================================
   EDIT PRODUCT
   ========================================================= */

export async function editProductService(form: {
  barcode: string;
  productName: string;
  mrp: string;
  imageUrl: string;
  clientName: string;
  version: number;
}) {

  console.log("Editing product with form data:", form);

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR") throw new Error("Not authorized to edit products");

  if (!form.barcode.trim()) throw new Error("Invalid barcode");

  if (!form.productName.trim()) throw new Error("Product name required");

  if (!form.clientName.trim()) throw new Error("Client name required");

  if (!form.mrp.trim()) throw new Error("MRP required");

  if (!form.imageUrl.trim()) throw new Error("Image URL required");

  const mrp = Number(form.mrp);
  if (isNaN(mrp) || mrp <= 0) throw new Error("Invalid MRP");

  const payload = {
    barcode: form.barcode.trim(),
    name: form.productName.trim(),
    mrp,
    imageUrl: form.imageUrl?.trim() || null,
    clientName: form.clientName.trim().toLowerCase(),
    version: form.version, // optimistic locking
  };

  const res = await productController.updateProduct(payload);

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Product creation failed");

  return true;
}

/* =========================================================
   TSV UPLOAD
   ========================================================= */

export async function uploadProductTSV(base64: string) {

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR")
    throw new Error("Not authorized to upload TSV");

  if (!base64)
    throw new Error("No file selected");

  const res = await productController.uploadProductTSV({ base64 });

  console.log("TSV upload response:", res.data);

  return res.data;
}
