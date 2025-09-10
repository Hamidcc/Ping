export async function handler(event, context) {
  const clientIP = event.headers["x-forwarded-for"] || event.headers["client-ip"];
  
  const response = await fetch("https://66.23.193.126", {
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
