import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'navsetu-dev-jwt-secret-key-minimum-32-chars-long'
);

export const AUTH_COOKIE_NAME = 'navsetu_token';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'department' | 'startup';
  org_id: string;
  org_name: string;
  dpiit_id?: string;
  verified?: boolean;
}

export const SEEDED_USERS: Record<string, UserSession> = {
  'officer@jalshakti.gov.in': {
    id: 'user-dept-1',
    email: 'officer@jalshakti.gov.in',
    name: 'Dr. S. K. Verma',
    role: 'department',
    org_id: 'dept-1',
    org_name: 'Dept. of Drinking Water & Sanitation (Jal Jeevan Mission)',
  },
  'director@mohua.gov.in': {
    id: 'user-dept-2',
    email: 'director@mohua.gov.in',
    name: 'Anita Roy, IAS',
    role: 'department',
    org_id: 'dept-2',
    org_name: 'Ministry of Housing and Urban Affairs (Smart Cities)',
  },
  'rohan@aquasense.io': {
    id: 'user-startup-1',
    email: 'rohan@aquasense.io',
    name: 'Rohan Deshmukh',
    role: 'startup',
    org_id: 'startup-1',
    org_name: 'AquaSense Analytics Pvt Ltd',
    dpiit_id: 'DIPP-89211',
    verified: true,
  },
  'karan@terrahydro.in': {
    id: 'user-startup-3',
    email: 'karan@terrahydro.in',
    name: 'Karan Mehra',
    role: 'startup',
    org_id: 'startup-3',
    org_name: 'TerraHydro Labs',
    dpiit_id: 'DIPP-11029',
    verified: false,
  },
};

export async function signJWT(user: UserSession): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<UserSession | null> {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
