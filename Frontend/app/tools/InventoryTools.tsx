export type InventoryItem = {
  id: number;
  name: string;
  barcode: string;
  quantity: number;
  mrp: number;
  version: number;
}

export const PAGE_SIZE = 10;
export const SAMPLE_TSV = `barcode\tquantity\nP1001\t10\nP1002\t5`;
