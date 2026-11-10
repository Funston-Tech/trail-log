import { apiRequest } from './api';

type AuthResponse = {
  token: string;
};

export function logIn(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signUp(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logOut(token: string): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    token,
  });
}
