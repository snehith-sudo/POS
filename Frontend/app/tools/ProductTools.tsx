export   const SAMPLE_TSV = `barcode\tname\tmrp\tclientId\timageUrl
P1001\tColgate Toothpaste\t45\tC001\thttps://example.com/images/p1001.png
P1002\tLifebuoy Soap\t30\tC001\thttps://example.com/images/p1002.png
P1003\tDove Shampoo\t120\tC002\thttps://example.com/images/p1003.png`;



export type Product = {
  barcode: string;
  id: number;
  imageUrl: string;
  mrp: number;
  name: string;
  clientName: string;
  version: number;
}
export const PAGE_SIZE = 10;
export const MAX_NAME_LENGTH = 50;