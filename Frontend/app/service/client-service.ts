import * as clientController from "../controllers/clientController";
/* ================= PAGINATION ================= */

export async function fetchClients(page: number, size: number) {

  // validation
  if (isNaN(page) || page < 0) page = 0;
  if (isNaN(size) || size <= 0) size = 10;

  const res = await clientController.getClients(page, size);
  const data = res.data;

  if (!data)
    throw new Error("Failed to fetch clients");

  return {
    content: Array.isArray(data.content) ? data.content : [],
    first: Boolean(data.first),
    last: Boolean(data.last),
  };
}

/* ================= FILTER ================= */

export async function filterClients(searchValue: string) {

  if (!searchValue || !searchValue.trim())
    throw new Error("Client name required");

  const res = await clientController.searchClient(searchValue.trim());
  const data = res.data;

  if (!data) return [];

  // normalize
  return Array.isArray(data) ? data : [data];
}

/* ================= ADD CLIENT ================= */

export async function createClient(name: string) {

  const role = sessionStorage.getItem("role");
  if (role === "OPERATOR")throw new Error("Not authorized to add clients");

  // validation
  if (!name || !name.trim())throw new Error("Client name is required");

  if (name.length > 50)throw new Error("Client name too long");

  const res = await clientController.addClient(name.trim());

  if (res.status !== 201 && res.status !== 200)
    throw new Error("Product creation failed");

  return true;
}
