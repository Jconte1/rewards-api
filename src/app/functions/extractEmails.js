export function extractEmails(inputText) {
    // Regular expression to match email addresses
    const emailRegex = /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
    // Use the match method to find all email addresses in the input text
    const emails = inputText.match(emailRegex);
    // Return the emails or an empty array if none found
    return emails || [];
}
