export async function handler(event, context) {
  const targetUrl = event.queryStringParameters?.url;
  if (!targetUrl) return { statusCode: 400, body: "Missing URL" };

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": event.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "*/*"
      }
    });

    const contentType = res.headers.get("content-type") || "text/html";

    // Handle text-based content
    if (contentType.includes("text/html") || contentType.includes("javascript") || contentType.includes("css")) {
      let body = await res.text();
      const urlObj = new URL(targetUrl);
      const base = urlObj.origin;

      // Rewrite all URLs: root-relative /path, protocol-relative //domain.com, or relative paths
      body = body.replace(
        /(src|href|action)=["']([^"']+)["']/gi,
        (match, attr, path) => {
          // Absolute URL already, leave as is
          if (path.startsWith("http://") || path.startsWith("https://")) return `${attr}="${path}"`;
          // Protocol-relative URL
          if (path.startsWith("//")) return `${attr}="https:${path}"`;
          // Root-relative or relative path
          let newUrl = path.startsWith("/") ? base + path : new URL(path, targetUrl).href;
          return `${attr}="/.netlify/functions/proxy?url=${encodeURIComponent(newUrl)}"`;
        }
      );

      return {
        statusCode: 200,
        headers: { "Content-Type": contentType },
        body
      };
    }

    // Handle binary content
    const buffer = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: { "Content-Type": contentType },
      body: buffer.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    return { statusCode: 500, body: "Proxy fetch failed: " + err.message };
  }
}
