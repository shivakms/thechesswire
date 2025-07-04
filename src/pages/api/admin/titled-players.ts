// src/pages/api/admin/titled-players.ts

import type { NextApiRequest, NextApiResponse } from 'next';
// import { verifyAdminAuth } from '@/lib/auth/admin';
// import { getDb } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Implement admin authentication
  // const admin = await verifyAdminAuth(req);
  // if (!admin) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  // TODO: Implement database connection
  const db = null; // Placeholder until database is implemented

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, db);
    case 'POST':
      return handlePost(req, res, db);
    case 'PUT':
      return handlePut(req, res, db);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, db: any) {
  // TODO: Implement database queries when db is available
  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  const { status = 'all', page = 1, limit = 50 } = req.query;

  try {
    let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.titled_player_title as title,
        u.chess_rating as rating,
        u.titled_player_verification_method as method,
        u.titled_player_verified_at as verified_at,
        u.created_at,
        u.last_login,
        u.fide_id,
        u.chess_com_username,
        COUNT(DISTINCT a.id) as articles_count,
        COUNT(DISTINCT v.id) as videos_count
      FROM users u
      LEFT JOIN articles a ON a.user_id = u.id
      LEFT JOIN videos v ON v.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status === 'verified') {
      query += ` AND u.titled_player_verified = true`;
    } else if (status === 'pending') {
      query += ` AND u.titled_player = true AND u.titled_player_verified = false`;
    } else if (status === 'rejected') {
      query += ` AND EXISTS (
        SELECT 1 FROM titled_player_review_queue q 
        WHERE q.user_id = u.id AND q.review_decision = 'rejected'
      )`;
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    
    params.push(limit, (Number(page) - 1) * Number(limit));

    const result = await db.query(query, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users u 
      WHERE u.titled_player = true
    `;
    const countResult = await db.query(countQuery);

    // Get verification statistics
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE titled_player_verified = true) as verified,
        COUNT(*) FILTER (WHERE titled_player = true AND titled_player_verified = false) as pending,
        COUNT(*) FILTER (WHERE titled_player_verification_method = 'fide') as fide_verified,
        COUNT(*) FILTER (WHERE titled_player_verification_method = 'chess_com') as chess_com_verified,
        COUNT(*) FILTER (WHERE titled_player_verification_method = 'lichess') as lichess_verified,
        COUNT(DISTINCT titled_player_title) as unique_titles
      FROM users
      WHERE titled_player = true
    `;
    const statsResult = await db.query(statsQuery);

    // Get abuse attempts
    const abuseQuery = `
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE blocked = true) as blocked_attempts,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM verification_abuse_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
    `;
    const abuseResult = await db.query(abuseQuery);

    return res.status(200).json({
      players: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total)
      },
      statistics: {
        ...statsResult.rows[0],
        abuse: abuseResult.rows[0]
      }
    });

  } catch (error) {
    console.error('Admin titled players error:', error);
    return res.status(500).json({ error: 'Failed to fetch titled players data' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, db: any) {
  // TODO: Implement database queries when db is available
  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  const { action, userId, reason } = req.body;

  try {
    switch (action) {
      case 'approve':
        // Manually approve a titled player
        await db.query(`
          UPDATE users 
          SET 
            titled_player_verified = true,
            titled_player_verified_at = NOW()
          WHERE id = $1
        `, [userId]);

        await db.query(`
          UPDATE titled_player_review_queue
          SET 
            reviewed = true,
            reviewed_by = $1,
            review_decision = 'approved',
            reviewed_at = NOW()
          WHERE user_id = $2
        `, ['admin-user-id', userId]);

        break;

      case 'reject':
        // Reject titled player verification
        await db.query(`
          UPDATE users 
          SET 
            titled_player = false,
            titled_player_verified = false
          WHERE id = $1
        `, [userId]);

        await db.query(`
          UPDATE titled_player_review_queue
          SET 
            reviewed = true,
            reviewed_by = $1,
            review_decision = 'rejected',
            review_notes = $2,
            reviewed_at = NOW()
          WHERE user_id = $3
        `, ['admin-user-id', reason, userId]);

        break;

      case 'revoke':
        // Revoke existing titled player status
        await db.query(`
          UPDATE users 
          SET 
            titled_player_verified = false,
            account_type = 'free',
            premium_features = false
          WHERE id = $1
        `, [userId]);

        // Log the revocation
        await db.query(`
          INSERT INTO security_logs (
            type, user_id, admin_id, action, reason, created_at
          ) VALUES (
            'titled_player_revoked', $1, $2, 'revoke', $3, NOW()
          )
        `, [userId, 'admin-user-id', reason]);

        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Admin action error:', error);
    return res.status(500).json({ error: 'Failed to process action' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, db: any) {
  // TODO: Implement database queries when db is available
  if (!db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  const { userId, updates } = req.body;

  try {
    // Manual update of titled player details
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.title) {
      updateFields.push(`titled_player_title = $${paramIndex++}`);
      values.push(updates.title);
    }

    if (updates.rating) {
      updateFields.push(`chess_rating = $${paramIndex++}`);
      values.push(updates.rating);
    }

    if (updates.verificationMethod) {
      updateFields.push(`titled_player_verification_method = $${paramIndex++}`);
      values.push(updates.verificationMethod);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    values.push(userId);
    
    await db.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `, values);

    // Log the update
    await db.query(`
      INSERT INTO security_logs (
        type, user_id, admin_id, action, metadata, created_at
      ) VALUES (
        'titled_player_updated', $1, $2, 'manual_update', $3, NOW()
      )
    `, [userId, 'admin-user-id', JSON.stringify(updates)]);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Admin update error:', error);
    return res.status(500).json({ error: 'Failed to update player' });
  }
}
