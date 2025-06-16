import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, expiresIn } = await request.json();
    
    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 });
    }
    
    const response = NextResponse.json({ success: true });
    
    // Set cookies on CLIENT domain
    response.cookies.set('sb_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(expiresIn) ? parseInt(expiresIn) * 1000 : 15 * 60 * 1000,
      path: '/'
    });
    
    response.cookies.set('sb_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/'
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set cookies' }, { status: 500 });
  }
}