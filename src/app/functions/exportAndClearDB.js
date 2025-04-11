// src/app/functions/exportAndClearDB.js

import { PrismaClient } from '@prisma/client';
import { convertToCSV } from './convertToCSV';
import { uploadCSV } from './uploadCSV';

const prisma = new PrismaClient();

/**
 * Exports all processed entries as a CSV file via FTP and then deletes them from the database.
 */
export async function exportAndClearDB() {
  try {
    // Query all entries from the ProcessedEntry table.
    const entries = await prisma.processedEntry.findMany();
    console.log("Entries to export:", entries);

    if (entries.length === 0) {
      console.log("No entries to export.");
      return;
    }

    // Convert the queried entries to a CSV string.
    const csvString = convertToCSV(entries);
    console.log("Generated CSV String:", csvString);

    // Generate a filename using the current date.
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const filename = `ZN_DAILY_TRANSACTIONS_${year}${month}16.csv`;
    console.log("Generated filename:", filename);

    // Upload the CSV file via FTP.
    await uploadCSV(csvString, filename);
    console.log("CSV file uploaded successfully:", filename);

    // Delete all entries from the ProcessedEntry table.
    const deleteResult = await prisma.processedEntry.deleteMany();
    console.log("Deleted entries:", deleteResult.count);

    console.log("Export and clear process completed successfully.");
  } catch (error) {
    console.error("Error during export and clear process:", error.stack);
    throw error;
  }
}
