// File: /src/app/api/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false });
  }

  // Check database for username availability
  // This is a placeholder - implement your database check
  const isAvailable = !['admin', 'test', 'chesswire'].includes(username.toLowerCase());

  return NextResponse.json({ available: isAvailable });
}