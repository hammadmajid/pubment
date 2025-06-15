import type { ZodType as ZodSchema, ZodType, ZodTypeDef } from 'zod';

export type ApiEndpoint =
  | '/user/register'
  | '/user/login'
  | `/user/${string}`
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

export async function safeFetch<T>(
  endpoint: ApiEndpoint,
  options: RequestInit,
  schema: ZodSchema<T> | ZodType<T, ZodTypeDef, unknown>,
): Promise<Result<T>> {
  try {
    const url = `http://localhost:3000${endpoint}`;
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
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
