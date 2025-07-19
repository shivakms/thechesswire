import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }

    // Use full-text search
    const offset = (page - 1) * limit;
    const searchQuery = `
      SELECT 
        id,
        title,
        summary,
        author,
        category,
        tags,
        sentiment,
        importance,
        created_at,
        ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', $1)) as relevance
      FROM news_articles 
      WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
      ORDER BY relevance DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(searchQuery, [query, limit, offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM news_articles 
      WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
    `;
    
    const countResult = await pool.query(countQuery, [query]);
    const total = parseInt(countResult.rows[0].total);

    // Get search suggestions
    const suggestionsQuery = `
      SELECT DISTINCT unnest(tags) as tag
      FROM news_articles 
      WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $1)
      LIMIT 5
    `;
    
    const suggestionsResult = await pool.query(suggestionsQuery, [query]);
    const suggestions = suggestionsResult.rows.map(row => row.tag);

    return NextResponse.json({
      query,
      articles: result.rows,
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News search error:', error);
    return NextResponse.json({ 
      error: 'Search failed' 
    }, { status: 500 });
  }
} 