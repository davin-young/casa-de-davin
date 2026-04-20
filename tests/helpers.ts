import { NextRequest } from 'next/server';
import { mockSessionData } from './setup';

export function mockSession(isAdmin: boolean) {
  mockSessionData.isAdmin = isAdmin;
  return mockSessionData;
}

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown> | string;
  headers?: Record<string, string>;
}

export function buildRequest(url: string, options: RequestOptions = {}): NextRequest {
  const { method = 'GET', body, headers = {} } = options;

  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new NextRequest(`http://localhost${url}`, init);
}

export function validBookingBody(): Record<string, string> {
  return {
    name: 'Test User',
    room: 'couch',
    arrive: '2026-07-01',
    depart: '2026-07-04',
    why: 'Testing the system with a valid reason.',
    travel: 'Driving',
  };
}
