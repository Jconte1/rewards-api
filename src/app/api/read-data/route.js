// src/app/api/read-data/route.js

import { processData } from '../../functions/processData';

import { sendToDB } from '../../functions/sendToDB';

export async function POST(request) {
  try {
    // Read in the JSON data from the request body.
    const data = await request.json();

    // Process the data using your custom function.
    const result = processData(data);

    // SEND PROCESSED DATA TO DATABASE:
    if (result.receivedData.Inserted && result.receivedData.Inserted.length > 0) {
      await sendToDB(result.receivedData.Inserted);
    } else {
      console.log("No qualifying entries to save to the database.");
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Data stored in database, waiting for batch export...",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing data:", error);
    return new Response(
      JSON.stringify({ status: "error", message: "Failed to process data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
