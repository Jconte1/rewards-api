// src/functions/processData.js

import { extractEmails } from "./extractEmails";

/**
 * Processes the incoming data.
 *
 * @param {Object} data - The JSON object received.
 * @returns {Object} - The processed data or a response message.
 */
export function processData(data) {
  console.log("Received data:", data);

  const insertedItems = data.Inserted;
  if (insertedItems && insertedItems.length > 0) {
    insertedItems.forEach((item) => {
      // Use the correct keys from the incoming JSON:
      // 'DesignerRewards' holds the designer's email(s).
      // 'Email' holds the builder's email.
      let designerEmailRaw = (item.DesignerRewards || "").trim();
      let builderEmail = (item.Email || "").trim();

      // Extract email(s) from the designer string.
      const extractedEmails = extractEmails(designerEmailRaw);
      // Use the first extracted email (if any) as the designer's email.
      let designerEmail = extractedEmails.length > 0 ? extractedEmails[0] : "";

      // New logic for checking qualification:
      if (designerEmail === "#NODESIGNER" || designerEmail === "") {
        designerEmail = null;
        console.log("Designer does not qualify");
      }

      // Here, if builderEmail is blank or null, treat it as non-qualifying.
      if (builderEmail === "null" || builderEmail === "") {
        builderEmail = null;
        console.log("Builder does not qualify");
      }

      if (designerEmail && builderEmail) {
        // TODO: Create two separate entries for designer and builder.
        console.log("Both designer and builder qualify.");
        // For now, we exit processing for this item.
        return;
      } else if (designerEmail) {
        // Designer qualifies.
        item.user_email = designerEmail;
        item.client_user_id = designerEmail;
        console.log("Only designer qualifies.", {
          user_email: item.user_email,
          client_user_id: item.client_user_id,
        });
      } else if (builderEmail) {
        // Builder qualifies.
        item.user_email = builderEmail;
        item.client_user_id = builderEmail;
        console.log("Only builder qualifies.", {
          user_email: item.user_email,
          client_user_id: item.client_user_id,
        });
      } else {
        // Neither qualifies or no matching data.
        console.log("No qualifying designer or builder found.");
        // Stop further processing for this item.
        return;
      }

      // Optionally, update the item with the processed emails so further logic uses these values.
      item.DesignerRewards = designerEmail;
      item.Email = builderEmail;

      // Process the multiplier for ExtAmount.
      console.log("Original ExtAmount:", item.ExtAmount);
      const soNumber = item.SONumber;
      if (soNumber.startsWith("HW")) {
        // extAmount is doubled.
        item.ExtAmount = item.ExtAmount * 2;
      } else if (soNumber.startsWith("PG")) {
        // extAmount is doubled.
        item.ExtAmount = item.ExtAmount * 2;
      } else {
        // extAmount stays as is.
      }
      console.log("Updated ExtAmount:", item.ExtAmount);

      // Assign the extAmount to the CSV fields: order_total and order_subtotal.
      item.order_total = item.ExtAmount;
      item.order_subtotal = item.ExtAmount;
      console.log(
        "Assigned order_total:",
        item.order_total,
        "order_subtotal:",
        item.order_subtotal
      );

      // Determine order type based on the Type field.
      const type = item.Type;
      if (type === "Invoice") {
        item.order_type = "purchase";
      } else if (type === "Credit Memo") {
        item.order_type = "return";
      }
      console.log("Order Type:", item.order_type);

      // Now assign the remaining CSV fields that don't need conditional logic.
      item.order_timestamp = item.InvoiceDate;
      item.order_id = item.SONumber;
      item.user_name = item.CustomerName;
      console.log(
        "Assigned order_timestamp:",
        item.order_timestamp,
        "order_id:",
        item.order_id,
        "user_name:",
        item.user_name
      );
    });
  }

  return {
    status: "success",
    message: "Data processed successfully",
    receivedData: data,
  };
}
