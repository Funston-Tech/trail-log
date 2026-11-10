const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  token?: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const { token, ...init } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
