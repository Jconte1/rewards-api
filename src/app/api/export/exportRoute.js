// src/api/export/exportRoute.js

import { exportAndClearDB } from '../../functions/exportAndClearDB';

export async function POST(request) {
  try {
    // Call the function that exports all entries to CSV and clears the database.
    await exportAndClearDB();

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Export and clear operation completed successfully."
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Export and clear error:", error.stack);
    return new Response(
      JSON.stringify({
        status: "error",
        message: "Export and clear operation failed."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
