import { NextResponse, type NextRequest } from 'next/server';
import { SEEDED_USERS, signJWT, setAuthCookie, clearAuthCookie, UserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, role, action } = body;

    if (action === 'logout') {
      const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });
      clearAuthCookie(response);
      return response;
    }

    let user: UserSession | undefined = undefined;

    if (email && SEEDED_USERS[email.toLowerCase()]) {
      user = SEEDED_USERS[email.toLowerCase()];
    } else if (role === 'department') {
      user = SEEDED_USERS['officer@jalshakti.gov.in'];
    } else if (role === 'startup') {
      user = SEEDED_USERS['rohan@aquasense.io'];
    } else if (role === 'startup_unverified') {
      user = SEEDED_USERS['karan@terrahydro.in'];
    }

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Invalid credentials. Please select one of the seeded demo accounts or provide a recognized email.',
        },
        { status: 401 }
      );
    }

    const token = await signJWT(user);
    const response = NextResponse.json({ ok: true, user });
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });
  clearAuthCookie(response);
  return response;
}
