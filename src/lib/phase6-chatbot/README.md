# Phase 6: Bambai AI Assistant Chatbot

## Overview
A fully self-hosted, production-grade AI Assistant Chatbot for TheChessWire.news that helps users with chess-related questions, platform guidance, and abuse support. The bot requires zero human intervention and maintains ultra-high performance, cybersecurity, and privacy compliance.

## Features
- 🤖 **AI-Powered Chess Assistant**: Answers chess questions using GPT-4 Turbo
- 🎯 **Platform Support**: Guides users through TheChessWire features
- 🛡️ **Abuse/Bug Reporting**: Handles reports with proper escalation
- ⚖️ **Legal & Policy Support**: Provides guidance on terms and privacy
- 🧠 **Memory & Context**: Maintains conversation history
- 🎤 **Voice Mode**: Optional ElevenLabs integration
- 🔄 **Fallback Flow**: Graceful error handling
- 🔒 **Security**: Rate limiting, input moderation, CORS protection

## Architecture
```
/phase6-chatbot/
├── vector_index/     # Vector DB for PGNs, articles, terms
├── chatbot_core/     # Langchain agent, tools, memory
├── public_ui/        # Chat widget interface
├── api/              # API endpoints
├── utils/            # Utility functions
└── types/            # TypeScript definitions
```

## Tech Stack
- **LangChain**: AI orchestration framework
- **OpenAI GPT-4 Turbo**: Primary language model
- **PostgreSQL**: Vector store and conversation history
- **Pinecone**: Alternative vector database
- **ElevenLabs**: Voice synthesis (optional)
- **AWS EC2**: Deployment platform

## Security Features
- 🔐 Secure API key management
- 🚦 Rate limiting on `/api/ask`
- 🛡️ Toxic input moderation
- 🔄 Daily vector DB refresh
- 🌐 CORS restricted to *.thechesswire.news

## Data Sources
- PGN files in `/public/pgns/`
- Article text from database
- Terms, Privacy, FAQ documents
- Admin documentation (optional)

## Personality: Bambai AI
- Elegant, witty, and knowledgeable
- Refers to herself as "Bambai AI"
- Non-argumentative, warm tone
- Chess expert with platform knowledge

## Quick Start
1. Set up environment variables (see `.env.example`)
2. Initialize vector database
3. Start the chatbot service
4. Access via `/api/ask` endpoint

## Deployment
- Node.js runtime on EC2
- Docker containerization
- PostgreSQL integration
- Route UI to `/api/ask`
- Optional `/chat` route

## Status: 🚧 In Development 