export async function handler(event, context) {
  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) return { statusCode: 400, body: "Missing URL" };

  try {
    const res = await fetch(targetUrl);
    let contentType = res.headers.get("content-type") || "text/html";

    // For text-based content (HTML, CSS, JS), rewrite URLs
    let body = await res.text();

    // Only rewrite if content-type is HTML
    if (contentType.includes("text/html")) {
      const urlObj = new URL(targetUrl);
      const base = urlObj.origin;

      // Rewrite src, href, action starting with /
      body = body.replace(
        /(src|href|action)=["'](\/[^"']*)["']/gi,
        `$1="/.netlify/functions/proxy?url=${base}$2"`
      );
    }

    return {
      statusCode: res.status,
      headers: { "Content-Type": contentType },
      body,
    };
  } catch (err) {
    return { statusCode: 500, body: "Proxy fetch failed: " + err.message };
  }
}
