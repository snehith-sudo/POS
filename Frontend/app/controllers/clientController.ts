import api from "../interceptor/axios";

/* Pagination */
export const getClients = (page: number, size: number) =>
  api.post("/client/pages", { page, size });

/* Filter by name */
export const searchClient = (name: string) =>
  api.post("/client/name", { name });

/* Add client */
export const addClient = (name: string) =>
  api.post("/client/addClient", { name });
