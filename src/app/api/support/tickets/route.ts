import { NextRequest, NextResponse } from 'next/server';
import { aiSupportSystem } from '@/lib/ai-support';
import { verifyJWT } from '@/lib/auth/jwt';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        t.id, t.subject, t.description, t.category, t.priority, t.status,
        t.created_at, t.updated_at, t.resolved_at, t.satisfaction_rating,
        COUNT(m.id) as message_count
      FROM support_tickets t
      LEFT JOIN support_messages m ON t.id = m.ticket_id
      WHERE t.user_id = $1
    `;
    
    const params: any[] = [decoded.userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND t.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` GROUP BY t.id ORDER BY t.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return NextResponse.json({
      tickets: result.rows,
      pagination: {
        limit,
        offset,
        hasMore: result.rows.length === limit
      }
    });

  } catch (error) {
    console.error('Get tickets error:', error);
    
    return NextResponse.json(
      { error: 'fetch_failed', message: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyJWT(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'invalid_token', message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { subject, description, category, priority } = await request.json();

    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Subject, description, and category are required' },
        { status: 400 }
      );
    }

    const ticketId = await aiSupportSystem.createSupportTicket(
      decoded.userId,
      subject,
      description,
      category,
      priority || 'medium'
    );

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    console.error('Create ticket error:', error);
    
    return NextResponse.json(
      { error: 'creation_failed', message: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
} 