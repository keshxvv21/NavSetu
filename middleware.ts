import { NextResponse, type NextRequest } from 'next/server';

// TODO: read JWT cookie and check role per route group.
// Must NOT block: /login, /verify/*, /api/auth/login, /api/verify/*
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/department/:path*', '/startup/:path*', '/contracts/:path*', '/adoptions/:path*', '/api/:path*'],
};
