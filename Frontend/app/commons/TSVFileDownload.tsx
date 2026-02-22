export type TsvData = { barcode: string; status: string };

export function downloadSampleTsv(data: string | TsvData[] | Record<string, string>, filename: string) {
    // If caller passes a raw TSV string, download as-is.
    if (typeof data === "string") {
        const blob = new Blob([data], { type: "text/tab-separated-values" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `result_${filename}.tsv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
    }

    // Build TSV from array-of-objects or object map
    let tsv = "Barcode\tStatus\n";

    if (Array.isArray(data)) {
        tsv += data.map((r) => `${r.barcode}\t${r.status}`).join("\n");
    } else if (data && typeof data === "object") {
        tsv += Object.entries(data).map(([barcode, status]) => `${barcode}\t${status}`).join("\n");
    }

    const blob = new Blob([tsv], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result_${filename}.tsv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}