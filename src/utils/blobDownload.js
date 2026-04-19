/**
 * Save an axios blob response as a file download; validate PDF magic bytes.
 */
export async function saveBlobResponseAsDownload(response, fallbackFilename) {
  const blob = response.data;
  const ct = (response.headers["content-type"] || "").toLowerCase();
  const blobType = (blob?.type && String(blob.type).toLowerCase()) || "";

  const sniffHead = async (n) => {
    if (typeof Blob === "undefined" || !blob?.slice) return "";
    const buf = await blob.slice(0, n).arrayBuffer();
    return new TextDecoder("utf-8", { fatal: false }).decode(buf);
  };

  const head = await sniffHead(8);
  const headTrim = head.trimStart();
  const looksJson =
    headTrim.startsWith("{") ||
    headTrim.startsWith("[") ||
    ct.includes("application/json") ||
    blobType.includes("json");

  if (looksJson) {
    const text = await blob.text();
    let msg = "Download failed";
    try {
      const j = JSON.parse(text);
      msg = j.message || j.error || j.errors?.message || msg;
    } catch {
      msg = text?.slice(0, 240) || msg;
    }
    throw new Error(msg);
  }

  if (headTrim.startsWith("<!") || headTrim.startsWith("<html")) {
    throw new Error("Server returned a web page instead of a PDF. Check the download URL or permissions.");
  }

  if (!head.startsWith("%PDF")) {
    throw new Error(
      "Downloaded data is not a valid PDF. The API may be misconfigured or the route may not exist."
    );
  }

  const cd = response.headers["content-disposition"] || "";
  let filename = fallbackFilename;
  const m = /filename\*=UTF-8''([^;\s]+)|filename="([^"]+)"|filename=([^;\s]+)/i.exec(cd);
  if (m) {
    filename = decodeURIComponent((m[1] || m[2] || m[3] || "").replace(/['"]/g, ""));
  }
  if (!filename.toLowerCase().endsWith(".pdf")) {
    filename = `${String(fallbackFilename).replace(/\.pdf$/i, "")}.pdf`;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Axios errors when responseType is blob (4xx/5xx body is a Blob). */
export async function messageFromDownloadError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const t = text.trimStart();
      if (t.startsWith("{") || t.startsWith("[")) {
        const j = JSON.parse(text);
        return (
          j.message ||
          j.error ||
          (typeof j.errors === "object" && j.errors && String(Object.values(j.errors).flat?.()[0])) ||
          text.slice(0, 220)
        );
      }
      if (t.startsWith("<")) {
        return status === 500
          ? "Server error (500): the PDF route crashed. Check Laravel storage/logs/laravel.log."
          : `Download failed (HTTP ${status || "?"}). Server returned HTML instead of a PDF.`;
      }
      return text.slice(0, 220) || error?.message;
    } catch {
      return error?.message;
    }
  }

  if (data && typeof data === "object" && data.message) {
    return String(data.message);
  }

  if (status === 500) {
    return "Server error (500): fix the PDF download handler in Laravel (see laravel.log).";
  }

  return error?.message || "Download failed.";
}
