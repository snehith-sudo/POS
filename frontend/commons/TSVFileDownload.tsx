export function downloadSampleTsv(SAMPLE_TSV: string, filename: string) 
{
    const blob = new Blob([SAMPLE_TSV], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result_${filename}.tsv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}