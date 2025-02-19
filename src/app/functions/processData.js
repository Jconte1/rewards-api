// src/functions/processData.js

import { extractEmails } from "./extractEmails";
import { formatDateToCSV } from "./formatDateToCSV";

/**
 * Processes the incoming data.
 *
 * @param {Object} data - The JSON object received.
 * @returns {Object} - The processed data or a response message.
 */
export function processData(data) {
  console.log("Received data:", data);

  const insertedItems = data.Inserted;
  const qualifiedItems = []; // This will store only qualified items

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
      if (builderEmail === "null" || builderEmail === "") {
        builderEmail = null;
        console.log("Builder does not qualify");
      }

      // For this example, if both qualify, we skip the item (or you could handle them separately)
      if (designerEmail && builderEmail) {
        console.log("Both designer and builder qualify.");
        return; // Skip this item
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
        console.log("No qualifying designer or builder found.");
        return; // Skip this item
      }

      // Update the item with the processed emails.
      item.DesignerRewards = designerEmail;
      item.Email = builderEmail;

      // Process the multiplier for ExtAmount.
      console.log("Original ExtAmount:", item.ExtAmount);
      const soNumber = item.SONumber;
      if (soNumber.startsWith("HW") || soNumber.startsWith("PG") || soNumber.startsWith("DS")) {
        item.ExtAmount = item.ExtAmount * 2;
      } else if (soNumber.startsWith("PU")) {
        console.log("Personal Order does not qualify.");
        return; // Skip this item
      }
      console.log("Updated ExtAmount:", item.ExtAmount);

      // Assign the extAmount to the CSV fields: order_total and order_subtotal.
      item.order_total = item.ExtAmount;
      item.order_subtotal = item.ExtAmount;
      console.log("Assigned order_total:", item.order_total, "order_subtotal:", item.order_subtotal);

      // Determine order type based on the Type field.
      const type = item.Type;
      if (type === "Invoice") {
        item.order_type = "purchase";
      } else if (type === "Credit Memo") {
        item.order_type = "return";
      }
      console.log("Order Type:", item.order_type);

      // Now assign the remaining CSV fields that don't need conditional logic.
      // For CSV export we want a formatted date:
      item.order_timestamp = formatDateToCSV(item.InvoiceDate);
      item.order_id = item.SONumber;
      item.user_name = item.CustomerName;
      console.log("Assigned order_timestamp:", item.order_timestamp, "order_id:", item.order_id, "user_name:", item.user_name);

      // Since this item qualifies, add it to our new array.
      qualifiedItems.push(item);
    });
  }

  // Replace the original Inserted array with the qualified ones.
  data.Inserted = qualifiedItems;
  
  return {
    status: "success",
    message: "Data processed successfully",
    receivedData: data,
  };
}
