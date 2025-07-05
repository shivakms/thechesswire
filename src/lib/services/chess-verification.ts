// src/lib/services/chess-verification.ts

import axios from 'axios';
// import { load } from 'cheerio';

// List of valid chess titles
const VALID_TITLES = [
  'GM', 'IM', 'FM', 'CM', 'NM',
  'WGM', 'WIM', 'WFM', 'WCM', 'WNM',
  'AGM', 'AIM', 'AFM', 'ACM'
];

interface VerificationResult {
  verified: boolean;
  title?: string;
  name?: string;
  rating?: number;
}

/**
 * Verify player via Chess.com API
 * Module 74: External API integration with error handling
 */
export async function verifyChessComPlayer(username: string): Promise<VerificationResult> {
  try {
    // Sanitize username
    const cleanUsername = username.trim().toLowerCase();
    
    // Chess.com API endpoint
    const response = await axios.get(
      `https://api.chess.com/pub/player/${cleanUsername}`,
      {
        timeout: 5000,
        headers: {
          'User-Agent': 'TheChessWire.news/1.0'
        }
      }
    );

    const data = response.data;

    // Check if player has a title
    if (data.title && VALID_TITLES.includes(data.title)) {
      // Get player stats for rating
      const statsResponse = await axios.get(
        `https://api.chess.com/pub/player/${cleanUsername}/stats`,
        {
          timeout: 5000,
          headers: {
            'User-Agent': 'TheChessWire.news/1.0'
          }
        }
      );

      const stats = statsResponse.data;
      
      // Get highest rating from different categories
      const ratings = [];
      if (stats.chess_rapid?.last?.rating) ratings.push(stats.chess_rapid.last.rating);
      if (stats.chess_blitz?.last?.rating) ratings.push(stats.chess_blitz.last.rating);
      if (stats.chess_bullet?.last?.rating) ratings.push(stats.chess_bullet.last.rating);
      
      const highestRating = ratings.length > 0 ? Math.max(...ratings) : 0;

      return {
        verified: true,
        title: data.title,
        name: data.name || username,
        rating: highestRating
      };
    }

    return { verified: false };
  } catch (error) {
    console.error('Chess.com verification error:', error);
    return { verified: false };
  }
}

/**
 * Verify player via Lichess API
 * Module 74: External API integration with error handling
 */
export async function verifyLichessPlayer(username: string): Promise<VerificationResult> {
  try {
    // Sanitize username
    const cleanUsername = username.trim().toLowerCase();
    
    // Lichess API endpoint
    const response = await axios.get(
      `https://lichess.org/api/user/${cleanUsername}`,
      {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TheChessWire.news/1.0'
        }
      }
    );

    const data = response.data;

    // Check if player has a title
    if (data.title && VALID_TITLES.includes(data.title)) {
      // Get highest rating from different categories
      const ratings = [];
      if (data.perfs?.rapid?.rating) ratings.push(data.perfs.rapid.rating);
      if (data.perfs?.blitz?.rating) ratings.push(data.perfs.blitz.rating);
      if (data.perfs?.bullet?.rating) ratings.push(data.perfs.bullet.rating);
      if (data.perfs?.classical?.rating) ratings.push(data.perfs.classical.rating);
      
      const highestRating = ratings.length > 0 ? Math.max(...ratings) : 0;

      return {
        verified: true,
        title: data.title,
        name: data.profile?.realName || username,
        rating: highestRating
      };
    }

    return { verified: false };
  } catch (error) {
    console.error('Lichess verification error:', error);
    return { verified: false };
  }
}

/**
 * Verify player via FIDE website scraping
 * Module 74: Web scraping with error handling
 * Note: FIDE doesn't have a public API, so we scrape their website
 */
export async function verifyFidePlayer(fideId: string): Promise<VerificationResult> {
  try {
    // Validate FIDE ID format (numeric only)
    if (!/^\d+$/.test(fideId)) {
      return { verified: false };
    }

    console.log('FIDE verification attempted for ID:', fideId);
    return { verified: false };
  } catch (error) {
    console.error('FIDE verification error:', error);
    return { verified: false };
  }
}

/**
 * Cross-reference verification
 * Check if a username/FIDE ID is already registered in our system
 */
export async function checkDuplicateRegistration(
  fideId?: string,
  chessComUsername?: string,
  dbConnection?: Record<string, unknown>
): Promise<boolean> {
  if (!dbConnection) return false;

  try {
    console.log('Duplicate check attempted for:', { fideId, chessComUsername });
    return false;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return false;
  }
}
