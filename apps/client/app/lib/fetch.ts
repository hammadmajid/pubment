import type { ZodType as ZodSchema, ZodType, ZodTypeDef } from 'zod';

export type ApiEndpoint =
  | '/user/register'
  | '/user/login'
  | `/user/${string}`
  | '/post'
  | `/post/${string}`
  | `/post/user/${string}`
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

type PostEndpoints =
  | '/user/register'
  | '/user/login'
  | '/post/create'
  | `/post/${string}/like`
  | '/comment/create'
  | '/follow/toggle';

type GetEndpoints = Exclude<ApiEndpoint, PostEndpoints>;

// Conditional request type based on endpoint method
export type ApiRequest<T extends ApiEndpoint> = T extends PostEndpoints
  ? { endpoint: T; body: unknown }
  : { endpoint: T };

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export async function safeFetch<
  TSuccess,
  TError,
  TEndpoint extends ApiEndpoint,
>(
  request: ApiRequest<TEndpoint>,
  successSchema: ZodSchema<TSuccess> | ZodType<TSuccess, ZodTypeDef, unknown>,
  errorSchema: ZodSchema<TError> | ZodType<TError, ZodTypeDef, unknown>,
  token?: string,
): Promise<Result<TSuccess>> {
  try {
    const url = `http://localhost:3000${request.endpoint}`;

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
      (requestOptions.headers as Record<string, string>)['Authorization'] =
        `Bearer ${token}`;
    }

    const res = await fetch(url, requestOptions);
    const contentType = res.headers.get('content-type');

    let data: unknown;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    // Parse based on response status
    if (res.ok) {
      const result = await successSchema.safeParseAsync(data);
      if (result.success) {
        return { ok: true, value: result.data };
      } else {
        return {
          ok: false,
          error: new Error(
            `Success schema validation failed: ${result.error.message}`,
          ),
        };
      }
    } else {
      const result = await errorSchema.safeParseAsync(data);
      if (result.success) {
        return {
          ok: false,
          error: new Error(`API Error: ${JSON.stringify(result.data)}`),
        };
      } else {
        return {
          ok: false,
          error: new Error(
            `Error schema validation failed: ${result.error.message}`,
          ),
        };
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
