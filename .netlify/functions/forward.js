export async function handler(event, context) {
  const clientIP = event.headers["x-forwarded-for"] || event.headers["client-ip"];
  
  const response = await fetch("https://google.com", {
    method: "GET",
    headers: {
      "X-Forwarded-For": clientIP,
    },
  });

  const body = await response.text();

  return {
    statusCode: response.status,
    body,
  };
}
