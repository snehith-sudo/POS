import api from "../interceptor/axios";

/* ---------------- GET PAGINATED PRODUCTS ---------------- */
export function getProducts(page: number, size: number) {
  return api.post("/products/pages", { page, size });
}

/* ---------------- FILTER PRODUCTS ---------------- */
export function filterProducts(payload: {
  filter: "barcode" | "clientName";
  search: string;
  page?: number;
  size?: number;
}) {

  console.log("Filtering products with payload:", payload);

  // 🔴 BARCODE SEARCH
  if (payload.filter === "barcode") {
    return api.post("/products/barcode", {
      barcode: payload.search,
    });
  }

  // 🔴 CLIENT SEARCH (PAGINATED)
  return api.post("/products/clientName", {
    clientName: payload.search,
    page: payload.page ?? 0,
    size: payload.size ?? 10,
  });
}


/* ---------------- ADD PRODUCT ---------------- */
export function addProduct(payload: any) {
  return api.post("/products", payload);
}

/* ---------------- UPDATE PRODUCT ---------------- */
export function updateProduct(payload: any) {
  return api.put("/products", payload);
}

/* ---------------- TSV UPLOAD ---------------- */
export function uploadProductTSV(payload: { base64: string }) {
  console.log("Uploading TSV with payload:", payload);
  return api.post("/products/uploadForm",  {
    base64file: payload.base64
  });
}

