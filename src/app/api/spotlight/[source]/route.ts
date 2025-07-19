import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

const SPOTLIGHT_SOURCES = {
  icc: 'Internet Chess Club',
  chesscom: 'Chess.com',
  lichess: 'Lichess',
  reddit: 'Reddit r/chess',
  chessable: 'Chessable',
  fide: 'FIDE',
  chessbase: 'ChessBase',
  tcec: 'TCEC',
  chess24: 'Chess24',
  decodechess: 'DecodeChess',
  openingtree: 'OpeningTree',
  aimchess: 'Aimchess',
  forwardchess: 'ForwardChess'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { source: string } }
) {
  try {
    const source = params.source;
    
    if (!SPOTLIGHT_SOURCES[source as keyof typeof SPOTLIGHT_SOURCES]) {
      return NextResponse.json(
        { error: 'Invalid source' },
        { status: 400 }
      );
    }

    // Generate AI-powered spotlight articles for the source
    const articles = await generateSpotlightArticles(source);

    return NextResponse.json({
      source,
      sourceName: SPOTLIGHT_SOURCES[source as keyof typeof SPOTLIGHT_SOURCES],
      articles,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Spotlight API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate spotlight articles' },
      { status: 500 }
    );
  }
}

async function generateSpotlightArticles(source: string) {
  // This would integrate with AI to generate content
  // For now, returning mock data based on the source
  
  const mockArticles = {
    icc: [
      {
        id: 'icc-1',
        title: 'ICC Announces New Premium Tournament Series',
        content: 'The Internet Chess Club has launched an exciting new premium tournament series featuring top grandmasters and substantial prize pools. The series will run monthly and include both rapid and classical time controls.',
        source: 'ICC',
        sourceUrl: 'https://www.chessclub.com/news',
        publishedAt: new Date().toISOString(),
        isRising: true,
        trendScore: 8.5,
        premiumOnly: false
      },
      {
        id: 'icc-2',
        title: 'ICC Blitz Championship: Dramatic Final Round',
        content: 'The ICC Blitz Championship concluded with a dramatic final round that saw three players tied for first place. The playoff system determined the ultimate winner in a thrilling series of speed games.',
        source: 'ICC',
        sourceUrl: 'https://www.chessclub.com/tournaments',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        isRising: false,
        trendScore: 7.2,
        premiumOnly: true
      }
    ],
    chesscom: [
      {
        id: 'chesscom-1',
        title: 'Chess.com Introduces Revolutionary AI Analysis Tools',
        content: 'Chess.com has unveiled new AI-powered analysis tools that provide deeper insights into player games. The tools include advanced opening suggestions and endgame analysis powered by neural networks.',
        source: 'Chess.com',
        sourceUrl: 'https://www.chess.com/news',
        publishedAt: new Date().toISOString(),
        isRising: true,
        trendScore: 9.1,
        premiumOnly: false
      },
      {
        id: 'chesscom-2',
        title: 'PogChamps 5: Celebrity Chess Tournament Announced',
        content: 'Chess.com has announced PogChamps 5, featuring popular streamers and celebrities competing in chess. The tournament will raise money for charity and introduce chess to new audiences.',
        source: 'Chess.com',
        sourceUrl: 'https://www.chess.com/pogchamps',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        isRising: true,
        trendScore: 8.8,
        premiumOnly: false
      }
    ],
    lichess: [
      {
        id: 'lichess-1',
        title: 'Lichess Releases Open Source Chess Engine Integration',
        content: 'Lichess has released new open source chess engine integration, allowing users to analyze games with multiple engines simultaneously. The feature is completely free and open source.',
        source: 'Lichess',
        sourceUrl: 'https://lichess.org/blog',
        publishedAt: new Date().toISOString(),
        isRising: true,
        trendScore: 7.9,
        premiumOnly: false
      },
      {
        id: 'lichess-2',
        title: 'Lichess Titled Arena: Record Participation',
        content: 'The latest Lichess Titled Arena saw record participation with over 500 titled players competing. The tournament featured innovative time controls and attracted players from around the world.',
        source: 'Lichess',
        sourceUrl: 'https://lichess.org/tournament',
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        isRising: false,
        trendScore: 6.5,
        premiumOnly: false
      }
    ],
    reddit: [
      {
        id: 'reddit-1',
        title: 'r/chess Community Debate: Should Chess Be in the Olympics?',
        content: 'A heated debate has erupted on r/chess about whether chess should be included in the Olympic Games. The discussion has attracted thousands of comments and votes from the chess community.',
        source: 'Reddit r/chess',
        sourceUrl: 'https://reddit.com/r/chess',
        publishedAt: new Date().toISOString(),
        isRising: true,
        trendScore: 8.3,
        premiumOnly: false
      },
      {
        id: 'reddit-2',
        title: 'r/chess Analysis: Magnus Carlsen\'s Latest Opening Innovation',
        content: 'The r/chess community has been analyzing Magnus Carlsen\'s latest opening innovation in the Sicilian Defense. Top players and coaches have shared their insights and analysis.',
        source: 'Reddit r/chess',
        sourceUrl: 'https://reddit.com/r/chess',
        publishedAt: new Date(Date.now() - 432000000).toISOString(),
        isRising: false,
        trendScore: 7.7,
        premiumOnly: true
      }
    ],
    fide: [
      {
        id: 'fide-1',
        title: 'FIDE Announces New Anti-Cheating Measures',
        content: 'FIDE has announced comprehensive new anti-cheating measures for official tournaments. The measures include advanced AI detection systems and stricter penalties for violations.',
        source: 'FIDE',
        sourceUrl: 'https://fide.com/news',
        publishedAt: new Date().toISOString(),
        isRising: true,
        trendScore: 9.2,
        premiumOnly: false
      },
      {
        id: 'fide-2',
        title: 'FIDE World Championship Cycle: Schedule Announced',
        content: 'FIDE has announced the complete schedule for the 2024 World Championship cycle. The cycle includes multiple qualifying tournaments and culminates in the World Championship match.',
        source: 'FIDE',
        sourceUrl: 'https://fide.com/championship',
        publishedAt: new Date(Date.now() - 604800000).toISOString(),
        isRising: true,
        trendScore: 8.9,
        premiumOnly: false
      }
    ]
  };

  // Return mock articles for the source, or empty array if not found
  return mockArticles[source as keyof typeof mockArticles] || [];
} 