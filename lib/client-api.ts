"use client";

// ---------------------------------------------------------------------------
// Tiny typed fetch wrapper for client hooks. Surfaces the structured error
// envelope ({ success:false, code, message }) as a thrown ApiClientError.
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  code: string;
  status: number;
  payload: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status: number,
    payload: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.payload = payload;
  }
}

export async function apiFetch<T = Record<string, unknown>>(
  input: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok || data.success === false) {
    throw new ApiClientError(
      (data.message as string) || (data.error as string) || "Request failed.",
      (data.code as string) || "SERVER_ERROR",
      res.status,
      data
    );
  }

  return data as T;
}
