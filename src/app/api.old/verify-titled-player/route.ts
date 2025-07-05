// File: /src/app/api/verify-titled-player/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RECOGNIZED_TITLES = {
  traditional: ['GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM'],
  arena: ['AGM', 'AIM', 'AFM', 'ACM'],
  national: ['NM', 'WNM', 'LM'],
  instructor: ['FST', 'FT', 'FI', 'FA', 'NI', 'DI']
};

const ALL_TITLES = Object.values(RECOGNIZED_TITLES).flat();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, platform } = body;

  try {
    let title = null;
    let verified = false;

    switch (platform) {
      case 'fide':
        // Check FIDE database (includes Arena titles)
        const fideResult = await checkFIDEDatabase();
        if (fideResult && ALL_TITLES.includes(fideResult.title)) {
          title = fideResult.title;
          verified = true;
        }
        break;

      case 'chesscom':
        // Check Chess.com API
        const chesscomResult = await checkChessComAPI();
        if (chesscomResult && chesscomResult.title) {
          // Chess.com might not show Arena titles, so also check FIDE
          if (ALL_TITLES.includes(chesscomResult.title)) {
            title = chesscomResult.title;
            verified = true;
          } else {
            // Fallback to FIDE check for Arena titles
            const fideCheck = await checkFIDEByUsername();
            if (fideCheck && ALL_TITLES.includes(fideCheck.title)) {
              title = fideCheck.title;
              verified = true;
            }
          }
        }
        break;

      case 'lichess':
        // Check Lichess API
        const lichessResult = await checkLichessAPI();
        if (lichessResult && lichessResult.title && ALL_TITLES.includes(lichessResult.title)) {
          title = lichessResult.title;
          verified = true;
        }
        break;
    }

    return NextResponse.json({ 
      verified, 
      title,
      titleCategory: getTitleCategory(title)
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      verified: false, 
      error: 'Verification service error' 
    }, { status: 500 });
  }
}

function getTitleCategory(title: string | null): string | null {
  if (!title) return null;
  
  for (const [category, titles] of Object.entries(RECOGNIZED_TITLES)) {
    if (titles.includes(title)) return category;
  }
  return null;
}

// Helper functions (implement these based on your APIs)
async function checkFIDEDatabase(): Promise<{ title: string; name: string } | null> {
  // Implement FIDE database check
  // Returns: { title: 'GM', name: 'Player Name' } or null
  return null;
}

async function checkFIDEByUsername(): Promise<{ title: string; name: string } | null> {
  // Implement FIDE search by name
  // Returns: { title: 'AGM', name: 'Player Name' } or null
  return null;
}

async function checkChessComAPI(): Promise<{ title: string; verified: boolean } | null> {
  // Implement Chess.com API check
  // Returns: { title: 'IM', verified: true } or null
  return null;
}

async function checkLichessAPI(): Promise<{ title: string; verified: boolean } | null> {
  // Implement Lichess API check
  // Returns: { title: 'FM', verified: true } or null
  return null;
}
