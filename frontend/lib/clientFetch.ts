export async function clientFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include", // The magic word that makes cross-origin cookies work
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // The ONLY time Express will return a 401 now is if the Refresh Token is ALSO dead.
  // If that happens, the session is truly over. Kick them to login.
  if (response.status === 401) {
    // Only redirect if we aren't already on the login page to prevent infinite loops
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }
  }

  return response;
}
