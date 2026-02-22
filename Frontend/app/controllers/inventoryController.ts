import api from "../interceptor/axios";

/* pagination */
export const getInventory = (page: number, size: number) =>
  api.post("/inventory/pages", { page, size });

/* barcode filter */
export const filterInventory = (search: string) =>
  api.post("/inventory/barcode", { barcode: search });

/* add or update inventory */
export const saveInventory = (payload: any) =>
  api.post("/inventory", payload);

/* TSV upload */
export const uploadInventoryTSV = (payload: any) =>
  api.post("/inventory/upload", payload);
