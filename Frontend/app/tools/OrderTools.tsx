
export type Order = {
  id: number;
  orderTime: string;
  status: string;
}

export // extend OrderItemAdd
type OrderItemAdd = {
  barcode: string;
  orderedQty: number | null;
  sellingPrice: number | null;
  isChecking?: boolean;  // while API check is running
  isSaved?: boolean;     // true after successful verification
  // optional: name?: string  // if you want to display product name returned from API
}


export type OrderItem = {
  name: String;
  barcode: number;
  orderItemId: number;
  orderId: number;
  productId: number;
  orderedQty: number;
  sellingPrice: number;
}

export function formatUtcToIst(utc: string): string {
    const date = new Date(utc); // parses UTC because of 'Z'

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }