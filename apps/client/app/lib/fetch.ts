import type { ZodType, ZodTypeDef } from 'zod';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export type ApiEndpoint =
  | '/user/register'
  | '/user/login'
  | `/user/${string}`
  | '/post'
  | `/post/${string}`
  | `/post?page=${number}`
  | `/post/user/${string}`
  | '/post/create'
  | `/post/${string}/like`
  | '/comment/create'
  | '/follow/toggle';

type PostEndpoints =
  | '/user/register'
  | '/user/login'
  | '/post/create'
  | `/${string}/like`
  | '/comment/create'
  | '/follow/toggle';

// Conditional request type based on endpoint method
export type ApiRequest<T extends ApiEndpoint> = T extends PostEndpoints
  ? { endpoint: T; body: unknown }
  : { endpoint: T };

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export async function safeFetch<TSuccess, TEndpoint extends ApiEndpoint>(
  request: ApiRequest<TEndpoint>,
  successSchema: ZodType<TSuccess> | ZodType<TSuccess, ZodTypeDef, unknown>,
  token?: string,
): Promise<Result<TSuccess>> {
  try {
    const url = `${API_BASE_URL}${request.endpoint}`;

    // Determine if this is a POST endpoint
    const isPostEndpoint =
      [
        '/user/register',
        '/user/login',
        '/post/create',
        '/comment/create',
        '/follow/toggle',
      ].includes(request.endpoint as string) ||
      request.endpoint.includes('/like');

    // Prepare request options
    const requestOptions: RequestInit = {
      method: isPostEndpoint ? 'POST' : 'GET',
      headers: {},
    };

    // If it's a POST endpoint, set content type and body
    if (isPostEndpoint && 'body' in request) {
      (requestOptions.headers as Record<string, string>)['Content-Type'] =
        'application/json';
      requestOptions.body = JSON.stringify(request.body);
    }

    // If token is provided, set it in Authorization header
    if (token !== undefined) {
      (requestOptions.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }

    const res = await fetch(url, requestOptions);
    const contentType = res.headers.get('content-type');

    let data: unknown;
    if (contentType?.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    // Parse based on response status
    if (res.ok) {
      const result = await successSchema.safeParseAsync(data);
      if (result.success) {
        return { ok: true, value: result.data };
      }
      return {
        ok: false,
        error: `Success schema validation failed: ${result.error.message}`,
      };
    }
    if (typeof data === 'string') {
      return {
        ok: false,
        error: data,
      };
    }
    return {
      ok: false,
      error: 'Unknown error',
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
