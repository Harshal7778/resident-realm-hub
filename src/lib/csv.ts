/** Minimal CSV helpers used by the reports module. */
function csvField(value: string | number): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [
    headers.map(csvField).join(","),
    ...rows.map((row) => row.map(csvField).join(",")),
  ].join("\n");
}

/** Triggers a same-origin CSV download from a click handler. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  // BOM keeps ₹ and Indian names readable when opened in Excel.
  const blob = new Blob([`\uFEFF${toCsv(headers, rows)}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
