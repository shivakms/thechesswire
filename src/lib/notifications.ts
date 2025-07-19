import { Pool } from 'pg';
import { sendEmail } from './email';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'game' | 'news' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isEmailSent: boolean;
  isPushSent: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    achievements: boolean;
    games: boolean;
    news: boolean;
    system: boolean;
    marketing: boolean;
  };
  push: {
    achievements: boolean;
    games: boolean;
    news: boolean;
    system: boolean;
    marketing: boolean;
  };
  inApp: {
    achievements: boolean;
    games: boolean;
    news: boolean;
    system: boolean;
    marketing: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

class NotificationSystem {
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private async loadTemplates() {
    // Load notification templates from database
    try {
      const result = await pool.query('SELECT * FROM notification_templates WHERE is_active = TRUE');
      
      for (const row of result.rows) {
        this.templates.set(row.id, {
          id: row.id,
          name: row.name,
          subject: row.subject,
          htmlTemplate: row.html_template,
          textTemplate: row.text_template,
          variables: row.variables || []
        });
      }
    } catch (error) {
      console.error('Failed to load notification templates:', error);
    }
  }

  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    options?: {
      sendEmail?: boolean;
      sendPush?: boolean;
      expiresAt?: Date;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<string> {
    try {
      const notificationId = crypto.randomUUID();
      const now = new Date();
      
      // Insert notification into database
      await pool.query(
        `INSERT INTO notifications 
         (id, user_id, type, title, message, data, is_read, is_email_sent, is_push_sent, created_at, expires_at, priority)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          notificationId,
          userId,
          type,
          title,
          message,
          JSON.stringify(data || {}),
          false,
          false,
          false,
          now,
          options?.expiresAt,
          options?.priority || 'normal'
        ]
      );

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Map notification type to preference key
      const typeToPrefKey: Record<string, keyof typeof preferences.email> = {
        error: 'system',
        system: 'system',
        info: 'system',
        warning: 'system',
        success: 'system',
        achievement: 'achievements',
        achievements: 'achievements',
        game: 'games',
        games: 'games',
        news: 'news',
        marketing: 'marketing'
      };
      const prefKey = typeToPrefKey[type] || 'system';
      // Send notifications based on preferences
      if (options?.sendEmail !== false && preferences.email[prefKey]) {
        await this.sendEmailNotification(userId, type, title, message, data);
      }

      if (options?.sendPush !== false && preferences.push[prefKey]) {
        await this.sendPushNotification(userId, type, title, message, data);
      }

      return notificationId;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: Notification['type'];
    }
  ): Promise<Notification[]> {
    try {
      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1
      `;
      
      const params: any[] = [userId];
      let paramIndex = 2;

      if (options?.unreadOnly) {
        query += ` AND is_read = FALSE`;
      }

      if (options?.type) {
        query += ` AND type = $${paramIndex}`;
        params.push(options.type);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC`;

      if (options?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(options.limit);
        paramIndex++;
      }

      if (options?.offset) {
        query += ` OFFSET $${paramIndex}`;
        params.push(options.offset);
      }

      const result = await pool.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        data: row.data,
        isRead: row.is_read,
        isEmailSent: row.is_email_sent,
        isPushSent: row.is_push_sent,
        createdAt: row.created_at,
        readAt: row.read_at,
        expiresAt: row.expires_at
      }));
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      await pool.query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId]
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const result = await pool.query(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          userId: row.user_id,
          email: row.email_preferences,
          push: row.push_preferences,
          inApp: row.in_app_preferences,
          frequency: row.frequency,
          quietHours: row.quiet_hours
        };
      }

      // Return default preferences if none exist
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const existing = await this.getUserPreferences(userId);
      const updated = { ...existing, ...preferences };

      await pool.query(
        `INSERT INTO notification_preferences 
         (user_id, email_preferences, push_preferences, in_app_preferences, frequency, quiet_hours, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           email_preferences = EXCLUDED.email_preferences,
           push_preferences = EXCLUDED.push_preferences,
           in_app_preferences = EXCLUDED.in_app_preferences,
           frequency = EXCLUDED.frequency,
           quiet_hours = EXCLUDED.quiet_hours,
           updated_at = NOW()`,
        [
          userId,
          JSON.stringify(updated.email),
          JSON.stringify(updated.push),
          JSON.stringify(updated.inApp),
          updated.frequency,
          JSON.stringify(updated.quietHours)
        ]
      );
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: {
        achievements: true,
        games: true,
        news: true,
        system: true,
        marketing: false
      },
      push: {
        achievements: true,
        games: true,
        news: false,
        system: true,
        marketing: false
      },
      inApp: {
        achievements: true,
        games: true,
        news: true,
        system: true,
        marketing: false
      },
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      }
    };
  }

  private async sendEmailNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Get user email
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userEmail = userResult.rows[0].email;

      // Check if we're in quiet hours
      const preferences = await this.getUserPreferences(userId);
      if (this.isInQuietHours(preferences.quietHours)) {
        return; // Don't send during quiet hours
      }

      // Get template for this notification type
      const template = this.templates.get(`${type}_notification`);
      
      if (template) {
        // Render template with data
        const renderedSubject = this.renderTemplate(template.subject, data);
        const renderedHtml = this.renderTemplate(template.htmlTemplate, data);
        const renderedText = this.renderTemplate(template.textTemplate, data);

        await sendEmail(userEmail, renderedSubject, renderedHtml, renderedText);
      } else {
        // Fallback to simple email
        await sendEmail(userEmail, title, message);
      }

      // Mark email as sent
      await pool.query(
        'UPDATE notifications SET is_email_sent = TRUE WHERE user_id = $1 AND title = $2 AND created_at > NOW() - INTERVAL \'1 minute\'',
        [userId, title]
      );

    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendPushNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Get user's push tokens
      const tokensResult = await pool.query(
        'SELECT push_token FROM user_push_tokens WHERE user_id = $1 AND is_active = TRUE',
        [userId]
      );

      if (tokensResult.rows.length === 0) {
        return; // No push tokens registered
      }

      // Check quiet hours
      const preferences = await this.getUserPreferences(userId);
      if (this.isInQuietHours(preferences.quietHours)) {
        return;
      }

      // Send push notification to all user's devices
      for (const row of tokensResult.rows) {
        await this.sendToDevice(row.push_token, {
          title,
          body: message,
          data: {
            type,
            ...data
          }
        });
      }

      // Mark push as sent
      await pool.query(
        'UPDATE notifications SET is_push_sent = TRUE WHERE user_id = $1 AND title = $2 AND created_at > NOW() - INTERVAL \'1 minute\'',
        [userId, title]
      );

    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private async sendToDevice(token: string, payload: any): Promise<void> {
    // Implementation depends on your push notification service
    // This is a placeholder for FCM (Firebase Cloud Messaging)
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: payload.title,
            body: payload.body
          },
          data: payload.data
        })
      });

      if (!response.ok) {
        throw new Error(`FCM request failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send to device:', error);
      throw error;
    }
  }

  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    if (!quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: quietHours.timezone 
    });

    const start = quietHours.start;
    const end = quietHours.end;

    if (start <= end) {
      // Same day (e.g., 08:00 to 22:00)
      return currentTime >= start && currentTime <= end;
    } else {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end;
    }
  }

  private renderTemplate(template: string, data: any): string {
    let rendered = template;
    
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
      }
    }

    return rendered;
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
        [userId]
      );
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async cleanupExpiredNotifications(): Promise<void> {
    try {
      await pool.query(
        'DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW()'
      );
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
    }
  }

  // Batch notification methods
  async createBatchNotifications(
    notifications: Array<{
      userId: string;
      type: Notification['type'];
      title: string;
      message: string;
      data?: any;
    }>
  ): Promise<string[]> {
    const notificationIds: string[] = [];

    for (const notification of notifications) {
      try {
        const id = await this.createNotification(
          notification.userId,
          notification.type,
          notification.title,
          notification.message,
          notification.data
        );
        notificationIds.push(id);
      } catch (error) {
        console.error('Failed to create batch notification:', error);
      }
    }

    return notificationIds;
  }

  // System notification methods
  async sendSystemNotification(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    try {
      // Get all active users
      const usersResult = await pool.query(
        'SELECT id FROM users WHERE verified_at IS NOT NULL AND is_active = TRUE'
      );

      const notifications = usersResult.rows.map(user => ({
        userId: user.id,
        type: 'system' as const,
        title,
        message,
        data
      }));

      await this.createBatchNotifications(notifications);
    } catch (error) {
      console.error('Failed to send system notification:', error);
    }
  }
}

// Singleton instance
const notificationSystem = new NotificationSystem();

export { notificationSystem, NotificationSystem }; 