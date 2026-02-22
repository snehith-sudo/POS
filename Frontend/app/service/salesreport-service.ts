import * as salesController from "../controllers/salesReportController";

export type ReportFilter =
    | { mode: "client"; clientName: string }
    | { mode: "date"; startDate: string; endDate: string }
    | { mode: "client_date"; clientName: string; startDate: string; endDate: string };

function normalizeReportResponse(data: any) {
    return {
        content: Array.isArray(data?.content) ? data.content : [],
        first: Boolean(data?.first),
        last: Boolean(data?.last),
    };
}

export async function fetchSalesReport(page: number, size: number) {

    if (isNaN(page) || page < 0) page = 0;
    if (isNaN(size) || size <= 0) size = 10;

    const res = await salesController.getSalesReport(page, size);

    if (!res.data)
        throw new Error("Failed to fetch sales report");

    return normalizeReportResponse(res.data);
}

export async function fetchFilteredSalesReport(
    filter: ReportFilter,
    page: number,
    size: number
) {

    if (!filter)
        return fetchSalesReport(page, size);

    let res;

    if (filter.mode === "client") {
        res = await salesController.getSalesByClient({
            clientName: filter.clientName,
            page,
            size,
        });
    }

    else if (filter.mode === "date") {
        res = await salesController.getSalesByDates({
            startDate: filter.startDate,
            endDate: filter.endDate,
            page,
            size,
        });
    }

    else {
        res = await salesController.getSalesByClientDates({
            clientName: filter.clientName,
            startDate: filter.startDate,
            endDate: filter.endDate,
            page,
            size,
        });
    }

    if (!res?.data)
        throw new Error("Failed to fetch filtered report");

    return normalizeReportResponse(res.data);
}


export async function fetchTodaySalesReport(startDate: string, endDate: string) {

  if (!startDate || !endDate)
    throw new Error("Invalid date range");

  const res = await salesController.getDailySales({
    startDate,
    endDate
  });

  const data = res.data;

  if (!data)
    throw new Error("Failed to fetch daily report");

  return {
    invoicedItemsCount: data.invoicedItemsCount ?? 0,
    invoicedOrdersCount: data.invoicedOrdersCount ?? 0,
    totalRevenue: data.totalRevenue ?? 0,
  };
}
