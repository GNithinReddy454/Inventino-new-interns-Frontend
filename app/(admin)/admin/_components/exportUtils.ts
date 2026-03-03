export const exportToCSV = (data: any[], filename: string, excludeFields: string[] = []) => {
    if (!data || data.length === 0) return;

    // Get headers filtering excluded fields
    const headers = Object.keys(data[0]).filter(key => !excludeFields.includes(key));

    // Create CSV content
    const csvContent =
        headers.join(",") +
        "\n" +
        data.map((row) => {
            return headers
                .map((header) => {
                    let value = row[header];
                    if (value === null || value === undefined) {
                        value = "";
                    } else if (typeof value === "object") {
                        value = JSON.stringify(value);
                    } else {
                        value = String(value);
                    }
                    // Escape quotes by doubling them, then wrap in quotes to handle commas
                    value = value.replace(/"/g, '""');
                    return `"${value}"`;
                })
                .join(",");
        }).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
