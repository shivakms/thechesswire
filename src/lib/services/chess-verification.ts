// src/lib/services/chess-verification.ts

import axios from 'axios';
import { load } from 'cheerio';

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

    // FIDE profile URL
    const response = await axios.get(
      `https://ratings.fide.com/profile/${fideId}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TheChessWire.news/1.0)'
        }
      }
    );

    const $ = load(response.data);
    
    // Extract player name
    const playerName = $('.profile-top-title').text().trim();
    if (!playerName) {
      return { verified: false };
    }

    // Extract title - usually in the profile header
    const profileText = $('.profile-top-info').text();
    let title = '';
    
    // Look for title in the text
    for (const validTitle of VALID_TITLES) {
      if (profileText.includes(validTitle)) {
        title = validTitle;
        break;
      }
    }

    // Also check in the player name itself (sometimes formatted as "GM Name Surname")
    if (!title) {
      for (const validTitle of VALID_TITLES) {
        if (playerName.startsWith(validTitle + ' ')) {
          title = validTitle;
          break;
        }
      }
    }

    if (!title) {
      return { verified: false };
    }

    // Extract rating
    const ratingElement = $('.profile-top-rating-data').first().text();
    const ratingMatch = ratingElement.match(/\d{4}/);
    const rating = ratingMatch ? parseInt(ratingMatch[0]) : 0;

    // Clean player name (remove title if it's in the name)
    const cleanName = playerName.replace(new RegExp(`^${title}\\s+`), '');

    return {
      verified: true,
      title,
      name: cleanName,
      rating
    };
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
  dbConnection?: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> }
): Promise<boolean> {
  if (!dbConnection) return false;

  try {
    // Check if FIDE ID already exists
    if (fideId) {
      const fideCheck = await dbConnection.query(
        'SELECT id FROM users WHERE fide_id = $1 AND titled_player_verified = true',
        [fideId]
      );
      if (fideCheck.rows.length > 0) return true;
    }

    // Check if Chess.com username already exists
    if (chessComUsername) {
      const usernameCheck = await dbConnection.query(
        'SELECT id FROM users WHERE chess_com_username = $1 AND titled_player_verified = true',
        [chessComUsername.toLowerCase()]
      );
      if (usernameCheck.rows.length > 0) return true;
    }

    return false;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return false;
  }
}
