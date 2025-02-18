// src/app/functions/uploadCSV.js

import { Client } from "basic-ftp";
import { Readable } from "stream";

export async function uploadCSV(csvString, filename) {
  const client = new Client();
  client.ftp.verbose = true; // Optional: enables detailed logging

  try {
    await client.access({
      host: process.env.ZINRELO_FTP_LOCATION,  // e.g., "ftp.example.com"
      user: process.env.ZINRELO_FTP_USERNAME,    // Your FTP username
      password: process.env.ZINRELO_FTP_PASSWORD,  // Your FTP password
      secure: false, // Set to true if your server requires FTPS
    });

    // Navigate to the specified directory, if provided.
    if (process.env.ZINRELO_FTP_DIRECTORY) {
      await client.ensureDir(process.env.ZINRELO_FTP_DIRECTORY);
    }

    // Convert the CSV string to a readable stream.
    const csvStream = Readable.from([csvString]);

    // Upload the CSV file.
    await client.uploadFrom(csvStream, filename);
    console.log("CSV file uploaded successfully:", filename);
  } catch (error) {
    console.error("FTP upload failed:", error);
    throw error;
  } finally {
    client.close();
  }
}
