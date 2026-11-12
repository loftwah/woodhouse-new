// A 3,000-character message plus the other fields can exceed 8 KiB when encoded
// as UTF-8 multipart data. The route still enforces the individual field limits.
export const enquirySubmitRequest = /** @type {const} */ ({
  body: "form-data",
  maxBytes: 12 * 1024
});
