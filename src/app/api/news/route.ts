import { NextRequest, NextResponse } from 'next/server';
import { newsDiscoverySystem } from '@/lib/news-discovery';
import { pool } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const verified = searchParams.get('verified');
    const aiGenerated = searchParams.get('aiGenerated');
    
    let query = 'SELECT * FROM news_articles WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (verified === 'true') {
      query += ` AND verified = TRUE`;
    } else if (verified === 'false') {
      query += ` AND verified = FALSE`;
    }

    if (aiGenerated === 'true') {
      query += ` AND ai_generated = TRUE`;
    } else if (aiGenerated === 'false') {
      query += ` AND ai_generated = FALSE`;
    }

    // Add pagination
    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM news_articles WHERE 1=1';
    const countParams: any[] = [];
    paramIndex = 1;

    if (category) {
      countQuery += ` AND category = $${paramIndex}`;
      countParams.push(category);
      paramIndex++;
    }

    if (verified === 'true') {
      countQuery += ` AND verified = TRUE`;
    } else if (verified === 'false') {
      countQuery += ` AND verified = FALSE`;
    }

    if (aiGenerated === 'true') {
      countQuery += ` AND ai_generated = TRUE`;
    } else if (aiGenerated === 'false') {
      countQuery += ` AND ai_generated = FALSE`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      articles: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve news articles' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'discover':
        await newsDiscoverySystem.startDiscovery();
        return NextResponse.json({ 
          message: 'News discovery started',
          timestamp: new Date().toISOString()
        });
        
      case 'stop':
        newsDiscoverySystem.stopDiscovery();
        return NextResponse.json({ 
          message: 'News discovery stopped',
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('News API action error:', error);
    return NextResponse.json({ 
      error: 'Action failed' 
    }, { status: 500 });
  }
} 