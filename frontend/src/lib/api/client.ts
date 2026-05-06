const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://k6yy37gbcf.execute-api.us-east-2.amazonaws.com";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    // Revalidate server-component fetches every 2s so the list stays fresh
    next: typeof window === "undefined" ? { revalidate: 2 } : undefined,
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}
