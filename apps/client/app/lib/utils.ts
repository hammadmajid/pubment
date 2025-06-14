import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZodSchema, ZodType, type ZodTypeDef } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// All possible endpoint paths for the client
export type ApiEndpoint =
  | '/user/register'
  | '/user/login'
  | '/post'
  | `/post/${string}`
  | '/post/create'
  | `/post/${string}/like`
  | `/post/${string}/likes`
  | `/comment/post/${string}`
  | `/comment/${string}`
  | '/comment/create'
  | '/follow/toggle'
  | '/followers'
  | `/followers/${string}`
  | '/following'
  | `/following/${string}`;

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

/**
 * safeFetch: fetch wrapper that validates the response using a Zod schema.
 * @param url - endpoint URL (must be a valid ApiEndpoint)
 * @param options - fetch options (body should be already validated)
 * @param schema - Zod schema for expected response
 * @returns Result<T> with either value or error
 */
export async function safeFetch<T>(
  url: ApiEndpoint,
  options: RequestInit,
  schema: ZodSchema<T> | ZodType<T, ZodTypeDef, unknown>,
): Promise<Result<T>> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    let data: unknown;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    const value = schema.parse(data);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
