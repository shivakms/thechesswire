const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logSecurityEvent } = require('../services/security');

const router = express.Router();

// Revenue sharing tiers
const REVENUE_TIERS = {
  'GM': { retired: 0.15, active: 0.10 },
  'WGM': { retired: 0.15, active: 0.10 },
  'IM': { retired: 0.15, active: 0.10 },
  'WIM': { retired: 0.15, active: 0.10 },
  'FM': { retired: 0.06, active: 0.06 },
  'WFM': { retired: 0.06, active: 0.06 },
  'CM': { retired: 0.06, active: 0.06 },
  'WCM': { retired: 0.06, active: 0.06 },
  'NM': { retired: 0.06, active: 0.06 },
  'WNM': { retired: 0.06, active: 0.06 }
};

// Verify FIDE ID and title
router.post('/verify-fide', [
  body('fideId').isString().isLength({ min: 1 }).withMessage('FIDE ID is required'),
  body('title').isIn(Object.keys(REVENUE_TIERS)).withMessage('Valid chess title is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { fideId, title } = req.body;

    // In production, this would call FIDE API or database
    // For now, simulate verification
    const verified = await verifyFIDEWithDatabase(fideId, title);

    if (verified) {
      await logSecurityEvent({
        eventType: 'fide_verification_success',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { fideId, title }
      });

      res.json({
        verified: true,
        title,
        fideId,
        revenueShare: REVENUE_TIERS[title]
      });
    } else {
      await logSecurityEvent({
        eventType: 'fide_verification_failed',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: { fideId, title }
      });

      res.status(404).json({
        verified: false,
        message: 'FIDE ID not found or title mismatch'
      });
    }
  } catch (error) {
    console.error('FIDE verification failed:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: 'Failed to verify FIDE credentials'
    });
  }
});

// Submit titled player verification
router.post('/submit-verification', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { fideId, title, fullName, dateOfBirth, country } = req.body;

    // Validate required fields
    if (!fideId || !title || !fullName || !dateOfBirth || !country) {
      return res.status(400).json({
        error: 'Missing Required Fields',
        message: 'All verification fields are required'
      });
    }

    // Save verification request
    const verificationId = await saveVerificationRequest({
      userId,
      fideId,
      title,
      fullName,
      dateOfBirth,
      country,
      status: 'pending',
      submittedAt: new Date()
    });

    // Log verification submission
    await logSecurityEvent({
      userId,
      eventType: 'titled_player_verification_submitted',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { fideId, title, verificationId }
    });

    res.json({
      message: 'Verification submitted successfully',
      verificationId,
      estimatedReviewTime: '24-48 hours'
    });

  } catch (error) {
    console.error('Verification submission failed:', error);
    res.status(500).json({
      error: 'Submission Failed',
      message: 'Failed to submit verification request'
    });
  }
});

// Get titled player earnings
router.get('/earnings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    // Get user's titled player status
    const user = await getUserById(userId);
    if (!user || !user.title) {
      return res.status(403).json({
        error: 'Not a Titled Player',
        message: 'This endpoint is only available for verified titled players'
      });
    }

    // Get earnings data
    const earnings = await getTitledPlayerEarnings(userId);

    res.json({
      title: user.title,
      revenueShare: REVENUE_TIERS[user.title],
      earnings: {
        total: earnings.total,
        thisMonth: earnings.thisMonth,
        lastMonth: earnings.lastMonth,
        pending: earnings.pending,
        paid: earnings.paid
      },
      nextPayout: earnings.nextPayout
    });

  } catch (error) {
    console.error('Failed to get earnings:', error);
    res.status(500).json({
      error: 'Failed to Load Earnings',
      message: 'Unable to retrieve earnings data'
    });
  }
});

// Get earnings analytics
router.get('/earnings/analytics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { period = '30d' } = req.query;

    const analytics = await getEarningsAnalytics(userId, period);

    res.json({
      period,
      analytics: {
        totalEarnings: analytics.totalEarnings,
        averagePerDay: analytics.averagePerDay,
        topContent: analytics.topContent,
        growthRate: analytics.growthRate,
        projectedEarnings: analytics.projectedEarnings
      }
    });

  } catch (error) {
    console.error('Failed to get earnings analytics:', error);
    res.status(500).json({
      error: 'Analytics Failed',
      message: 'Unable to retrieve earnings analytics'
    });
  }
});

// Get payout history
router.get('/payouts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;

    const payouts = await getPayoutHistory(userId, parseInt(page), parseInt(limit));

    res.json({
      payouts: payouts.data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: payouts.total,
        pages: Math.ceil(payouts.total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Failed to get payout history:', error);
    res.status(500).json({
      error: 'History Failed',
      message: 'Unable to retrieve payout history'
    });
  }
});

// Request payout
router.post('/request-payout', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { amount, paymentMethod } = req.body;

    // Validate amount
    if (!amount || amount < 50) {
      return res.status(400).json({
        error: 'Invalid Amount',
        message: 'Minimum payout amount is $50'
      });
    }

    // Check available balance
    const earnings = await getTitledPlayerEarnings(userId);
    if (earnings.pending < amount) {
      return res.status(400).json({
        error: 'Insufficient Balance',
        message: 'Available balance is less than requested amount'
      });
    }

    // Create payout request
    const payoutId = await createPayoutRequest({
      userId,
      amount,
      paymentMethod,
      status: 'pending',
      requestedAt: new Date()
    });

    // Log payout request
    await logSecurityEvent({
      userId,
      eventType: 'payout_requested',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      details: { amount, paymentMethod, payoutId }
    });

    res.json({
      message: 'Payout request submitted successfully',
      payoutId,
      estimatedProcessingTime: '3-5 business days'
    });

  } catch (error) {
    console.error('Payout request failed:', error);
    res.status(500).json({
      error: 'Payout Failed',
      message: 'Failed to submit payout request'
    });
  }
});

// Get verification status
router.get('/verification-status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const verification = await getVerificationStatus(userId);

    res.json({
      verified: verification.verified,
      title: verification.title,
      verifiedAt: verification.verifiedAt,
      status: verification.status,
      revenueShare: verification.title ? REVENUE_TIERS[verification.title] : null
    });

  } catch (error) {
    console.error('Failed to get verification status:', error);
    res.status(500).json({
      error: 'Status Failed',
      message: 'Unable to retrieve verification status'
    });
  }
});

// Admin: Approve titled player verification
router.post('/admin/approve/:verificationId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { adminId } = req.user;

    const verification = await approveTitledPlayerVerification(verificationId, adminId);

    // Send approval email
    await sendTitledPlayerApprovalEmail(verification.email, verification.title);

    res.json({
      message: 'Verification approved successfully',
      verificationId,
      title: verification.title
    });

  } catch (error) {
    console.error('Verification approval failed:', error);
    res.status(500).json({
      error: 'Approval Failed',
      message: 'Failed to approve verification'
    });
  }
});

// Admin: Reject titled player verification
router.post('/admin/reject/:verificationId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { reason } = req.body;
    const { adminId } = req.user;

    const verification = await rejectTitledPlayerVerification(verificationId, reason, adminId);

    // Send rejection email
    await sendTitledPlayerRejectionEmail(verification.email, reason);

    res.json({
      message: 'Verification rejected',
      verificationId,
      reason
    });

  } catch (error) {
    console.error('Verification rejection failed:', error);
    res.status(500).json({
      error: 'Rejection Failed',
      message: 'Failed to reject verification'
    });
  }
});

// Helper functions
async function verifyFIDEWithDatabase(fideId, title) {
  // In production, this would query FIDE database or API
  // For now, simulate verification with mock data
  const mockFIDEPlayers = [
    { fideId: '12345678', title: 'GM', name: 'Magnus Carlsen' },
    { fideId: '87654321', title: 'IM', name: 'Hikaru Nakamura' },
    { fideId: '11223344', title: 'FM', name: 'John Doe' }
  ];

  return mockFIDEPlayers.some(player => 
    player.fideId === fideId && player.title === title
  );
}

async function saveVerificationRequest(data) {
  const client = await require('../services/database').pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO titled_player_verifications 
      (user_id, fide_id, title, full_name, date_of_birth, country, status, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [data.userId, data.fideId, data.title, data.fullName, data.dateOfBirth, data.country, data.status, data.submittedAt]);

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

async function getTitledPlayerEarnings(userId) {
  const client = await require('../services/database').pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as this_month,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
                          AND created_at < DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) as last_month,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid
      FROM titled_player_earnings 
      WHERE user_id = $1
    `, [userId]);

    const earnings = result.rows[0];
    
    // Calculate next payout date (first of next month)
    const nextPayout = new Date();
    nextPayout.setMonth(nextPayout.getMonth() + 1);
    nextPayout.setDate(1);

    return {
      total: parseFloat(earnings.total),
      thisMonth: parseFloat(earnings.this_month),
      lastMonth: parseFloat(earnings.last_month),
      pending: parseFloat(earnings.pending),
      paid: parseFloat(earnings.paid),
      nextPayout
    };
  } finally {
    client.release();
  }
}

async function getEarningsAnalytics(userId, period) {
  // Mock analytics data
  return {
    totalEarnings: 1250.50,
    averagePerDay: 41.68,
    topContent: [
      { title: 'Queen Sacrifice Analysis', earnings: 150.00 },
      { title: 'Endgame Masterclass', earnings: 120.00 },
      { title: 'Opening Theory Deep Dive', earnings: 95.00 }
    ],
    growthRate: 0.15,
    projectedEarnings: 1800.00
  };
}

async function getPayoutHistory(userId, page, limit) {
  const client = await require('../services/database').pool.connect();
  try {
    const offset = (page - 1) * limit;
    
    const result = await client.query(`
      SELECT id, amount, status, payment_method, created_at, processed_at
      FROM titled_player_payouts 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM titled_player_payouts 
      WHERE user_id = $1
    `, [userId]);

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } finally {
    client.release();
  }
}

async function createPayoutRequest(data) {
  const client = await require('../services/database').pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO titled_player_payouts 
      (user_id, amount, payment_method, status, requested_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [data.userId, data.amount, data.paymentMethod, data.status, data.requestedAt]);

    return result.rows[0].id;
  } finally {
    client.release();
  }
}

async function getVerificationStatus(userId) {
  const client = await require('../services/database').pool.connect();
  try {
    const result = await client.query(`
      SELECT verified, title, verified_at, status
      FROM users u
      LEFT JOIN titled_player_verifications tpv ON u.id = tpv.user_id
      WHERE u.id = $1
      ORDER BY tpv.submitted_at DESC
      LIMIT 1
    `, [userId]);

    return result.rows[0] || { verified: false, title: null, verifiedAt: null, status: 'not_submitted' };
  } finally {
    client.release();
  }
}

async function approveTitledPlayerVerification(verificationId, adminId) {
  const client = await require('../services/database').pool.connect();
  try {
    await client.query('BEGIN');

    // Update verification status
    const verificationResult = await client.query(`
      UPDATE titled_player_verifications 
      SET status = 'approved', approved_at = NOW(), approved_by = $1
      WHERE id = $2
      RETURNING user_id, title
    `, [adminId, verificationId]);

    if (verificationResult.rows.length === 0) {
      throw new Error('Verification not found');
    }

    const { user_id, title } = verificationResult.rows[0];

    // Update user profile
    await client.query(`
      UPDATE user_profiles 
      SET title = $1, verified_at = NOW()
      WHERE user_id = $2
    `, [title, user_id]);

    // Get user email
    const userResult = await client.query(`
      SELECT email FROM users WHERE id = $1
    `, [user_id]);

    await client.query('COMMIT');

    return {
      email: userResult.rows[0].email,
      title
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function rejectTitledPlayerVerification(verificationId, reason, adminId) {
  const client = await require('../services/database').pool.connect();
  try {
    const result = await client.query(`
      UPDATE titled_player_verifications 
      SET status = 'rejected', rejected_at = NOW(), rejected_by = $1, rejection_reason = $2
      WHERE id = $3
      RETURNING user_id
    `, [adminId, reason, verificationId]);

    if (result.rows.length === 0) {
      throw new Error('Verification not found');
    }

    const userResult = await client.query(`
      SELECT email FROM users WHERE id = $1
    `, [result.rows[0].user_id]);

    return {
      email: userResult.rows[0].email
    };
  } finally {
    client.release();
  }
}

async function sendTitledPlayerApprovalEmail(email, title) {
  const { sendWelcomeEmail } = require('../services/email');
  await sendWelcomeEmail(email, 'Titled Player');
}

async function sendTitledPlayerRejectionEmail(email, reason) {
  // Implementation for rejection email
  console.log(`Sending rejection email to ${email} with reason: ${reason}`);
}

async function getUserById(userId) {
  const { getUserById } = require('../services/database');
  return await getUserById(userId);
}

module.exports = router; 