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

    // Binary content
    if (!contentType.includes("text") && !contentType.includes("javascript") && !contentType.includes("css")) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        statusCode: 200,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*"
        },
        body: buffer.toString("base64"),
        isBase64Encoded: true
      };
    }

    // Text content (HTML/JS/CSS)
    let body = await res.text();
    body = body.replace(
      /(src|href|action)=["']([^"']+)["']/gi,
      (match, attr, path) => {
        if (path.startsWith("http://") || path.startsWith("https://")) return `${attr}="${path}"`;
        if (path.startsWith("//")) return `${attr}="https:${path}"`;
        let newUrl = path.startsWith("/") ? new URL(path, targetUrl).href : new URL(path, targetUrl).href;
        return `${attr}="/.netlify/functions/proxy?url=${encodeURIComponent(newUrl)}"`;
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*"
      },
      body
    };
  } catch (err) {
    return { statusCode: 500, body: "Proxy fetch failed: " + err.message };
  }
}
