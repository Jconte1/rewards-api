// src/app/functions/sendToDB.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Saves an array of processed entries to the database.
 *
 * @param {Array<Object>} entries - An array of processed entry objects.
 */
export async function sendToDB(entries) {
  try {
    console.log("Received entries for DB saving:", entries);

    // Filter out any null or undefined entries.
    const validEntries = entries.filter(entry => entry != null);
    console.log("Valid entries to save (length):", validEntries.length);
    validEntries.forEach((entry, i) => {
      console.log(`Valid entry ${i}:`, entry);
    });

    for (const entry of validEntries) {
      console.log("Saving entry:", entry);

      // Use the raw InvoiceDate converted to a Date object.
      const invoiceDate = entry.InvoiceDate ? new Date(entry.InvoiceDate) : new Date();

      // Build the payload using the raw InvoiceDate for order_timestamp.
      const payload = {
        order_timestamp: invoiceDate,  // This is a Date object, which Prisma can handle.
        order_id: entry.SONumber || "",
        user_name: entry.CustomerName || "",
        user_email: entry.user_email || "",
        member_id: entry.member_id || "",
        client_user_id: entry.client_user_id || "",
        order_total: entry.order_total != null ? entry.order_total : 0,
        order_subtotal: entry.order_subtotal != null ? entry.order_subtotal : 0,
        order_type: entry.order_type || "",
        product_id: entry.product_id || "",
        product_price: entry.product_price || "",
        quantity: entry.quantity || 1,
        product_title: entry.product_title || "invoice",
      };

      console.log("Payload to save:", payload);
      console.log("About to save payload for entry with order_id:", payload.order_id);

      await prisma.processedEntry.create({ data: payload });
      console.log("Entry saved successfully:", entry.SONumber);
    }
    console.log("All processed entries saved successfully.");
  } catch (error) {
    console.error("Error saving processed entries:", error.stack);
    throw error;
  }
}
