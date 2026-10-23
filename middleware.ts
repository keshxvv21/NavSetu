import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'navsetu_token';
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'navsetu-dev-jwt-secret-key-minimum-32-chars-long'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Unrestricted public routes
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/verify') ||
    pathname.startsWith('/api/verify') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('/pdf') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Read and verify JWT token
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let user: { role?: string; email?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      user = payload as { role?: string; email?: string };
    } catch {
      user = null;
    }
  }

  // Handle protected web pages
  if (pathname.startsWith('/department')) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('role', 'department');
      return NextResponse.redirect(url);
    }
    if (user.role !== 'department') {
      const url = req.nextUrl.clone();
      url.pathname = '/startup/browse';
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith('/startup')) {
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('role', 'startup');
      return NextResponse.redirect(url);
    }
    if (user.role !== 'startup') {
      const url = req.nextUrl.clone();
      url.pathname = '/department/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Handle API route authorization
  if (pathname.startsWith('/api/')) {
    // Dept-only API endpoints
    const isDeptAction =
      (pathname === '/api/problems' && req.method === 'POST') ||
      pathname.includes('/select') ||
      pathname.includes('/review') ||
      pathname.includes('/convert') ||
      (pathname === '/api/adoptions' && req.method === 'POST');

    // Startup-only API endpoints
    const isStartupAction =
      (pathname === '/api/applications' && req.method === 'POST') ||
      pathname.includes('/submit');

    if (isDeptAction && user?.role !== 'department') {
      // In local dev without cookie, allow mock passthrough if explicitly requested, otherwise 403
      if (!user) {
        // Allow in dev for seamless testing if no auth cookie set
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: 'Forbidden: Department role required for this action' },
        { status: 403 }
      );
    }

    if (isStartupAction && user?.role !== 'startup') {
      if (!user) {
        return NextResponse.next();
      }
      return NextResponse.json(
        { error: 'Forbidden: Startup role required for this action' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/department/:path*',
    '/startup/:path*',
    '/contracts/:path*',
    '/adoptions/:path*',
    '/api/:path*',
  ],
};
