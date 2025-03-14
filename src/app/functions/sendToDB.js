// src/app/functions/sendToDB.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Saves an array of processed entries to the database.
 *
 * @param {Array<Object>} entries - An array of processed entry objects.
 */
export async function sendToDB(entries) {
 // src/app/functions/sendToDB.js
const builders = (await import('../util/builders.json')).default;
const designers = (await import('../util/designers.json')).default;


  const allowedEmails = new Set([
    ...builders.map(email => email.toLowerCase()),
    ...designers.map(email => email.toLowerCase()),
  ]);

  try {
    console.log("Received entries for DB saving:", entries);

    // Filter out null/undefined entries and check against allowed emails
    const validEntries = entries.filter(entry => {
      if (!entry || !entry.user_email) return false;
      const normalizedEmail = entry.user_email.toLowerCase();
      const isAllowed = allowedEmails.has(normalizedEmail);
      if (!isAllowed) {
        console.log(`Skipping entry with unrecognized email: ${normalizedEmail}`);
      }
      return isAllowed;
    });

    console.log("Valid entries to save (length):", validEntries.length);

    for (const entry of validEntries) {
      console.log("Saving entry:", entry);

      const invoiceDate = entry.InvoiceDate ? new Date(entry.InvoiceDate) : new Date();

      const payload = {
        order_timestamp: invoiceDate,
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
      await prisma.processedEntry.create({ data: payload });
      console.log("Entry saved successfully:", entry.SONumber);
    }

    console.log("All processed entries saved successfully.");
  } catch (error) {
    console.error("Error saving processed entries:", error.stack);
    throw error;
  }
}
