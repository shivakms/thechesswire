# Phase 5: Bambai AI Autonomous Publishing Pipeline

## 🎯 Overview

The Phase 5 autonomous AI publishing pipeline enables Bambai AI to generate, narrate, render, and publish chess content across YouTube, Instagram, X, and Reddit — with **zero human intervention**.

## 🚀 Features

### ✅ Core Functional Modules

- **Story Fetcher**: Sources chess stories from major platforms (FIDE, Chess.com, Lichess, Reddit, etc.)
- **Narrative Generator**: Converts stories into Bambai AI's elegant, insightful voice
- **Voice Synthesis**: Uses ElevenLabs for high-quality voice generation
- **Video Generation**: Uses HeyGen API to render Bambai AI as a realistic woman
- **Thumbnail Generator**: Auto-generates eye-catching thumbnails and metadata
- **Social Publishing**: Automatically uploads to YouTube, Instagram, Twitter/X, Reddit
- **Activity Logging**: Comprehensive tracking and monitoring

### ✅ Security & Performance

- **Zero hardcoded secrets** - All keys in environment variables
- **TypeScript architecture** with modular, self-documented components
- **Input/output validation** and graceful error handling
- **Retry logic** with exponential backoff
- **API rate limiting** and performance monitoring
- **Memory leak prevention** and resource cleanup

## 📁 Directory Structure

```
src/lib/phase5/
├── types/
│   └── index.ts                 # TypeScript type definitions
├── config/
│   └── index.ts                 # Configuration management
├── database/
│   ├── connection.ts            # Database connection manager
│   └── schema.sql              # PostgreSQL schema
├── fetchStories.ts             # Story fetching module
├── generateNarrative.ts        # Narrative generation module
├── synthesizeVoice.ts          # Voice synthesis module
├── renderVideo.ts              # Video rendering module
├── generateThumbnail.ts        # Thumbnail generation module
├── publishToSocial.ts          # Social media publishing module
├── logActivity.ts              # Activity logging module
├── pipeline.ts                 # Main pipeline orchestrator
├── utils/
│   └── index.ts                # Utility functions
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### 1. Environment Configuration

Copy the environment template and configure your API keys:

```bash
cp src/lib/phase5/env.example .env
```

Fill in all required environment variables:

```env
# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# HeyGen API
HEYGEN_API_KEY=your_heygen_api_key
HEYGEN_AVATAR_ID=bambai-ai-avatar

# YouTube API
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REFRESH_TOKEN=your_youtube_refresh_token

# Instagram API
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_USER_ID=your_instagram_user_id

# Twitter/X API
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REFRESH_TOKEN=your_reddit_refresh_token

# Database
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. Database Setup

Initialize the database schema:

```typescript
import { initializeDatabase } from '@/lib/phase5/database/connection';

const db = await initializeDatabase();
```

### 3. Pipeline Initialization

```typescript
import { initializePipeline, runPipeline } from '@/lib/phase5/pipeline';

// Initialize the pipeline
await initializePipeline();

// Run the pipeline
await runPipeline();
```

## 🔧 API Reference

### Pipeline Orchestrator

```typescript
import { bambaiAIPipeline } from '@/lib/phase5/pipeline';

// Initialize pipeline
await bambaiAIPipeline.initialize();

// Run complete pipeline
await bambaiAIPipeline.runPipeline();

// Get pipeline status
const status = await bambaiAIPipeline.getStatus();

// Stop pipeline
await bambaiAIPipeline.stop();

// Cleanup resources
await bambaiAIPipeline.cleanup();
```

### Story Fetching

```typescript
import { fetchStories } from '@/lib/phase5/fetchStories';

const result = await fetchStories();
// Returns: { stories: ChessStory[], totalFetched: number, uniqueStories: number, processingTime: number }
```

### Narrative Generation

```typescript
import { generateNarrative } from '@/lib/phase5/generateNarrative';

const result = await generateNarrative(story);
// Returns: { narrative: NarrativeScript, processingTime: number }
```

### Voice Synthesis

```typescript
import { synthesizeVoice } from '@/lib/phase5/synthesizeVoice';

const result = await synthesizeVoice(narrative);
// Returns: { voice: VoiceSynthesis, processingTime: number }
```

### Video Rendering

```typescript
import { renderVideo } from '@/lib/phase5/renderVideo';

const result = await renderVideo(voice);
// Returns: { video: VideoRender, processingTime: number }
```

### Social Publishing

```typescript
import { publishToSocial } from '@/lib/phase5/publishToSocial';

const result = await publishToSocial(video, metadata);
// Returns: { posts: SocialPost[], totalPublished: number, failedPlatforms: SocialPlatform[], processingTime: number }
```

## 📊 Database Schema

The pipeline uses PostgreSQL with the following main tables:

- **content_logs**: Main tracking table for pipeline execution
- **chess_stories**: Fetched chess stories with deduplication
- **narrative_scripts**: Generated narrative content
- **voice_synthesis**: Voice synthesis results
- **video_renders**: Video rendering results
- **thumbnail_metadata**: Thumbnail and metadata
- **social_posts**: Social media publishing results
- **processing_queue**: Queue management for failed operations
- **performance_metrics**: Performance monitoring data

## 🔄 Pipeline Flow

1. **Story Fetching**: Sources stories from multiple platforms
2. **Deduplication**: Removes duplicate stories using hash-based detection
3. **Relevance Scoring**: Calculates relevance scores (0-100)
4. **Narrative Generation**: Creates Bambai AI's narrative scripts
5. **Voice Synthesis**: Generates high-quality audio using ElevenLabs
6. **Video Rendering**: Creates videos with HeyGen API
7. **Thumbnail Generation**: Creates thumbnails and metadata
8. **Social Publishing**: Publishes to configured platforms
9. **Activity Logging**: Tracks all operations and performance

## 🎛️ Configuration

### Pipeline Configuration

```typescript
const pipelineConfig = {
  maxStoriesPerRun: 5,           // Maximum stories per pipeline run
  minRelevanceScore: 70,         // Minimum relevance score (0-100)
  maxProcessingTime: 300000,     // Max processing time per story (ms)
  retryAttempts: 3,              // Number of retry attempts
  retryDelay: 5000,              // Delay between retries (ms)
  rateLimitDelay: 1000,          // Rate limiting delay (ms)
  enableAutoPublish: true,       // Enable automatic publishing
  platforms: ['youtube', 'instagram', 'twitter'] // Target platforms
};
```

### Voice Settings

```typescript
const voiceSettings = {
  calm: { stability: 0.5, similarity_boost: 0.75, style: 0.0 },
  expressive: { stability: 0.3, similarity_boost: 0.75, style: 0.5 },
  dramatic: { stability: 0.2, similarity_boost: 0.75, style: 0.8 },
  poetic: { stability: 0.4, similarity_boost: 0.75, style: 0.6 }
};
```

## 🚨 Error Handling

The pipeline includes comprehensive error handling:

- **Retry Logic**: Exponential backoff for transient failures
- **Graceful Degradation**: Continues processing other stories if one fails
- **Error Logging**: Detailed error tracking and reporting
- **Recovery Mechanisms**: Automatic recovery from common failures
- **Monitoring**: Real-time performance and error monitoring

## 📈 Performance Monitoring

### Metrics Tracked

- **Processing Time**: Time for each pipeline stage
- **Success Rates**: Success/failure rates for each operation
- **API Response Times**: External API performance
- **Memory Usage**: Resource utilization monitoring
- **Error Rates**: Error frequency and types

### Health Checks

```typescript
import { healthCheck } from '@/lib/phase5/utils';

const health = await healthCheck();
// Returns: { status: 'healthy'|'unhealthy', checks: Record<string, boolean> }
```

## 🔒 Security Features

- **Environment Variables**: All secrets stored in environment variables
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **Error Sanitization**: Sensitive data removed from error messages
- **Database Security**: SQL injection prevention and connection pooling

## 🧪 Testing

### Unit Tests

```bash
npm test src/lib/phase5/
```

### Integration Tests

```bash
npm run test:integration src/lib/phase5/
```

### Performance Tests

```bash
npm run test:performance src/lib/phase5/
```

## 🚀 Deployment

### AWS EC2 Deployment

1. **Environment Setup**: Configure all environment variables
2. **Database Migration**: Run database schema initialization
3. **Service Configuration**: Set up as systemd service
4. **Monitoring**: Configure CloudWatch monitoring
5. **Auto-scaling**: Set up auto-scaling based on load

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Logging

The pipeline uses structured logging with multiple levels:

- **INFO**: General pipeline operations
- **WARN**: Non-critical issues and retries
- **ERROR**: Critical failures and errors
- **DEBUG**: Detailed debugging information

## 🔄 Automation

### Scheduled Execution

The pipeline can be configured to run automatically:

```typescript
// Run every 6 hours
setInterval(async () => {
  await runPipeline();
}, 6 * 60 * 60 * 1000);
```

### Event-Driven Execution

```typescript
// Run on new story detection
eventEmitter.on('newStory', async (story) => {
  await processStory(story);
});
```

## 🎯 Success Metrics

- **Content Quality**: High relevance scores (>70)
- **Processing Speed**: <5 minutes per story
- **Success Rate**: >95% successful completions
- **Error Rate**: <1% critical failures
- **Engagement**: Measurable social media engagement

## 🚨 Troubleshooting

### Common Issues

1. **API Rate Limits**: Implemented automatic rate limiting and retry logic
2. **Database Connection**: Connection pooling and automatic reconnection
3. **Memory Leaks**: Automatic cleanup and resource management
4. **Network Issues**: Retry logic with exponential backoff

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

For issues and questions:

1. Check the logs for detailed error information
2. Review the health check status
3. Verify environment variable configuration
4. Check API key validity and quotas

## 🎉 Conclusion

The Phase 5 autonomous AI publishing pipeline provides a complete, production-ready solution for automated chess content creation and distribution. With zero human intervention, Bambai AI can now generate, narrate, render, and publish high-quality chess content across all major social platforms.

---

**TheChessWire.news** - Where chess meets artificial intelligence in a symphony of strategy and soul. 