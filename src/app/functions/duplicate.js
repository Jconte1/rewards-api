import { formatDateToCSV } from "./formatDateToCSV";

/**
 * Duplicates an item for both designer and builder when both qualify.
 *
 * @param {Object} item - The original item from data.Inserted
 * @param {Array} qualifiedItems - The array to push the processed rows into
 * @param {string} designerEmail - The qualified designer email
 * @param {string} builderEmail - The qualified builder email
 */
export function duplicate(item, qualifiedItems, designerEmail, builderEmail) {
  console.log("Running duplicate() for both users...");

  const users = [designerEmail, builderEmail];

  users.forEach((email) => {
    const entry = JSON.parse(JSON.stringify(item)); // deep clone

    // Assign the appropriate user
    entry.user_email = email;
    entry.client_user_id = email;
    entry.member_id = email;

    // Keep original emails for traceability
    entry.DesignerRewards = designerEmail;
    entry.Email = builderEmail;

    // Qualify SO Number
    const soNumber = entry.SONumber;
    if (soNumber.startsWith("PU")) {
      console.log("Personal Order does not qualify. Skipping entry for:", email);
      return;
    } else if (soNumber.startsWith("HW") || soNumber.startsWith("PG") || soNumber.startsWith("DS")) {
      entry.ExtAmount = entry.ExtAmount * 2;
    }

    // Assign financial fields
    entry.order_total = entry.ExtAmount;
    entry.order_subtotal = entry.ExtAmount;
    console.log(`Processed ExtAmount for ${email}:`, entry.ExtAmount);

    // Determine order type
    const type = entry.Type;
    if (type === "Invoice") {
      entry.order_type = "purchase";
    } else if (type === "Credit Memo") {
      entry.order_type = "return";
    }

    // Assign remaining CSV fields
    entry.order_timestamp = formatDateToCSV(entry.InvoiceDate);
    entry.order_id = entry.SONumber;
    entry.user_name = entry.CustomerName;
    entry.product_id = entry.InvoiceNumber;
    entry.product_price = entry.order_total;
    entry.quantity = "1";
    entry.product_title = "invoice";

    console.log("Final processed entry for:", email, entry);

    qualifiedItems.push(entry);
  });
}
