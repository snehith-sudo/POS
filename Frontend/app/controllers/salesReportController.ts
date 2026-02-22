import api from "../interceptor/axios";

// pagination (no filter)
export const getSalesReport = (page: number, size: number) =>
    api.post("/salesreport/pages", { page, size });

// filter by client
export const getSalesByClient = (payload: any) =>
    api.post("/salesreport", payload);

// filter by dates
export const getSalesByDates = (payload: any) =>
    api.post("/salesreport/byDates", payload);

// filter by client + dates
export const getSalesByClientDates = (payload: any) =>
    api.post("/salesreport/byDatesClient", payload);

export const getDailySales = (payload:any) =>
    api.post("/salesreport/getdaysales", payload);
