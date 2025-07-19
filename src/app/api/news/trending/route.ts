import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const hours = parseInt(searchParams.get('hours') || '24');
    
    // Get trending topics
    const trendingQuery = `
      SELECT 
        id,
        topic,
        mentions,
        sentiment,
        related_articles,
        trending_since,
        category,
        created_at
      FROM trending_topics 
      WHERE trending_since > NOW() - INTERVAL '${hours} hours'
      ORDER BY mentions DESC, trending_since DESC
      LIMIT $1
    `;
    
    const trendingResult = await pool.query(trendingQuery, [limit]);

    // Get popular articles for trending topics
    const popularArticlesQuery = `
      SELECT 
        na.id,
        na.title,
        na.summary,
        na.category,
        na.sentiment,
        na.importance,
        na.created_at,
        na.views
      FROM news_articles na
      WHERE na.created_at > NOW() - INTERVAL '${hours} hours'
      ORDER BY na.views DESC, na.importance DESC
      LIMIT 5
    `;
    
    const popularResult = await pool.query(popularArticlesQuery);

    // Get category distribution
    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        AVG(importance) as avg_importance
      FROM news_articles 
      WHERE created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const categoryResult = await pool.query(categoryQuery);

    // Get sentiment distribution
    const sentimentQuery = `
      SELECT 
        sentiment,
        COUNT(*) as count
      FROM news_articles 
      WHERE created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY sentiment
    `;
    
    const sentimentResult = await pool.query(sentimentQuery);

    return NextResponse.json({
      trending: trendingResult.rows,
      popular: popularResult.rows,
      categories: categoryResult.rows,
      sentiment: sentimentResult.rows,
      timeRange: `${hours} hours`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trending topics error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve trending topics' 
    }, { status: 500 });
  }
} 