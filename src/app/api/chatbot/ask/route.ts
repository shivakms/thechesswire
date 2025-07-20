// Phase 6: Bambai AI Assistant API Route

import { NextRequest, NextResponse } from 'next/server';
import { POST as askChatbot, OPTIONS as chatbotOptions } from '@/lib/phase6-chatbot/api/ask';

export { OPTIONS } from '@/lib/phase6-chatbot/api/ask';

export async function POST(request: NextRequest) {
  return askChatbot(request);
} 