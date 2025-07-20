import axios from 'axios';
import logger from '@/lib/logger';
import { getDatabase } from './database/connection';
import { NarrativeScript, VoiceSynthesis, VoiceSynthesisResult } from './types';
import { apiConfig, voiceSettings } from './config';

class VoiceSynthesizer {
  private db: any;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Synthesize voice for a narrative
   */
  async synthesizeVoice(narrative: NarrativeScript): Promise<VoiceSynthesisResult> {
    const startTime = Date.now();

    try {
      logger.info(`🎙️ Synthesizing voice for narrative: ${narrative.id}`);

      // Determine voice settings based on tone
      const settings = this.getVoiceSettings(narrative.tone);

      // Generate voice using ElevenLabs
      const audioBuffer = await this.generateVoiceWithElevenLabs(narrative.fullScript, settings);

      // Calculate duration and file size
      const duration = this.calculateAudioDuration(audioBuffer);
      const fileSize = audioBuffer.byteLength;

      // Create voice synthesis record
      const voice: VoiceSynthesis = {
        id: this.generateId(),
        narrativeId: narrative.id,
        audioUrl: '', // Will be set after upload
        duration,
        fileSize,
        quality: 'high',
        status: 'completed',
        timestamp: new Date()
      };

      // Save to database
      await this.saveVoiceSynthesis(voice);

      const processingTime = Date.now() - startTime;

      logger.info(`✅ Voice synthesis completed`, {
        voiceId: voice.id,
        duration: `${duration}s`,
        fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        processingTime: `${processingTime}ms`
      });

      return {
        voice,
        processingTime
      };

    } catch (error) {
      logger.error(`❌ Voice synthesis failed for narrative ${narrative.id}`, error);
      
      // Create failed voice record
      const voice: VoiceSynthesis = {
        id: this.generateId(),
        narrativeId: narrative.id,
        audioUrl: '',
        duration: 0,
        fileSize: 0,
        quality: 'high',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      await this.saveVoiceSynthesis(voice);
      throw error;
    }
  }

  /**
   * Generate voice using ElevenLabs API
   */
  private async generateVoiceWithElevenLabs(text: string, settings: any): Promise<ArrayBuffer> {
    try {
      logger.info('Calling ElevenLabs API for voice synthesis');

      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${apiConfig.elevenlabs.voiceId}`,
        {
          text: text.trim(),
          model_id: apiConfig.elevenlabs.modelId,
          voice_settings: settings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiConfig.elevenlabs.apiKey,
          },
          responseType: 'arraybuffer',
          timeout: 60000, // 60 seconds timeout
          maxContentLength: 50 * 1024 * 1024, // 50MB max
        }
      );

      if (response.status !== 200) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      logger.info('ElevenLabs API call successful', {
        status: response.status,
        dataSize: response.data.byteLength
      });

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('ElevenLabs API key is invalid');
        } else if (error.response?.status === 429) {
          throw new Error('ElevenLabs API rate limit exceeded');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request to ElevenLabs API');
        } else {
          throw new Error(`ElevenLabs API error: ${error.response?.status} ${error.response?.statusText}`);
        }
      }
      throw error;
    }
  }

  /**
   * Get voice settings based on tone
   */
  private getVoiceSettings(tone: string): any {
    const baseSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    };

    switch (tone) {
      case 'calm':
        return {
          ...baseSettings,
          stability: 0.6,
          style: 0.1
        };
      case 'expressive':
        return {
          ...baseSettings,
          stability: 0.4,
          style: 0.5
        };
      case 'dramatic':
        return {
          ...baseSettings,
          stability: 0.3,
          style: 0.8
        };
      case 'poetic':
        return {
          ...baseSettings,
          stability: 0.5,
          style: 0.6
        };
      default:
        return baseSettings;
    }
  }

  /**
   * Calculate audio duration (approximate)
   */
  private calculateAudioDuration(audioBuffer: ArrayBuffer): number {
    // MP3 files: approximate calculation based on file size
    // Assuming 128kbps bitrate
    const bytesPerSecond = 128 * 1024 / 8; // 128kbps = 16KB/s
    return Math.ceil(audioBuffer.byteLength / bytesPerSecond);
  }

  /**
   * Save voice synthesis to database
   */
  private async saveVoiceSynthesis(voice: VoiceSynthesis): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO voice_synthesis (
          id, narrative_id, audio_url, duration, file_size, quality, status, error, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        voice.id, voice.narrativeId, voice.audioUrl, voice.duration,
        voice.fileSize, voice.quality, voice.status, voice.error,
        voice.timestamp, voice.timestamp
      ]);

      logger.info(`✅ Voice synthesis saved to database: ${voice.id}`);

    } catch (error) {
      logger.error(`❌ Failed to save voice synthesis to database`, error);
      throw error;
    }
  }

  /**
   * Update voice synthesis status
   */
  async updateVoiceStatus(voiceId: string, status: VoiceSynthesis['status'], audioUrl?: string, error?: string): Promise<void> {
    try {
      const updateFields = ['status = $2', 'updated_at = $3'];
      const params = [voiceId, status, new Date()];

      if (audioUrl) {
        updateFields.push('audio_url = $4');
        params.push(audioUrl);
      }

      if (error) {
        updateFields.push('error = $5');
        params.push(error);
      }

      await this.db.query(`
        UPDATE voice_synthesis 
        SET ${updateFields.join(', ')}
        WHERE id = $1
      `, params);

      logger.info(`✅ Voice synthesis status updated: ${voiceId} -> ${status}`);

    } catch (error) {
      logger.error(`❌ Failed to update voice synthesis status`, error);
      throw error;
    }
  }

  /**
   * Get voice synthesis by ID
   */
  async getVoiceSynthesis(voiceId: string): Promise<VoiceSynthesis | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM voice_synthesis WHERE id = $1
      `, [voiceId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get voice synthesis`, error);
      throw error;
    }
  }

  /**
   * Get voice synthesis by narrative ID
   */
  async getVoiceSynthesisByNarrative(narrativeId: string): Promise<VoiceSynthesis | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM voice_synthesis WHERE narrative_id = $1 ORDER BY created_at DESC LIMIT 1
      `, [narrativeId]);

      return result.rows[0] || null;

    } catch (error) {
      logger.error(`❌ Failed to get voice synthesis by narrative`, error);
      throw error;
    }
  }

  /**
   * Retry failed voice synthesis
   */
  async retryVoiceSynthesis(voiceId: string): Promise<VoiceSynthesisResult> {
    try {
      const voice = await this.getVoiceSynthesis(voiceId);
      if (!voice) {
        throw new Error('Voice synthesis not found');
      }

      if (voice.status !== 'failed') {
        throw new Error('Voice synthesis is not in failed status');
      }

      // Get narrative
      const narrativeResult = await this.db.query(`
        SELECT * FROM narrative_scripts WHERE id = $1
      `, [voice.narrativeId]);

      const narrative = narrativeResult.rows[0];
      if (!narrative) {
        throw new Error('Narrative not found');
      }

      // Update status to processing
      await this.updateVoiceStatus(voiceId, 'processing');

      // Retry synthesis
      return await this.synthesizeVoice(narrative);

    } catch (error) {
      logger.error(`❌ Failed to retry voice synthesis`, error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const voiceSynthesizer = new VoiceSynthesizer();

// Export main function
export const synthesizeVoice = (narrative: NarrativeScript) => voiceSynthesizer.synthesizeVoice(narrative); 