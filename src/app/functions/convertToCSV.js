// src/functions/convertToCSV.js

import { formatDateToCSV } from "./formatDateToCSV";

// Define the CSV headers in the order expected by Zinrello.
const headers = [
  "order_timestamp",
  "order_id",
  "user_name",
  "user_email",
  "client_user_id",
  "order_total",
  "order_subtotal",
  "order_type"
];

/**
 * Converts an array of processed items into a CSV string.
 *
 * @param {Array<Object>} rows - The array of processed items.
 * @returns {string} - A CSV formatted string.
 */
export function convertToCSV(rows) {
  // Start with the header row.
  const csvRows = [];
  csvRows.push(headers.join(","));

  // Loop through each row, mapping header values to CSV columns.
  rows.forEach((row) => {
    const values = headers.map((header) => {
      let value = row[header] !== undefined ? row[header] : "";
      
      // For the order_timestamp field, format the value using formatDateToCSV.
      if (header === "order_timestamp" && value) {
        // Convert value to a string in the desired format.
        // If value is already a Date object or ISO string, formatDateToCSV will work.
        value = formatDateToCSV(value);
      }
      
      if (typeof value === "string") {
        // Escape double quotes by doubling them.
        value = value.replace(/"/g, '""');
        // If the value contains a comma, newline, or double quote, enclose it in double quotes.
        if (value.search(/("|,|\n)/g) >= 0) {
          value = `"${value}"`;
        }
      }
      
      return value;
    });
    csvRows.push(values.join(","));
  });

  // Combine all rows with newline characters.
  return csvRows.join("\n");
}
