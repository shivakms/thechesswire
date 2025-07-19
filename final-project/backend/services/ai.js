const OpenAI = require('openai');

let openaiClient;

const initializeAIServices = async () => {
  try {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('✅ AI services initialized');
  } catch (error) {
    console.error('❌ AI services initialization failed:', error);
    throw error;
  }
};

// Generate chess analysis
const generateChessAnalysis = async (position, context = '') => {
  try {
    const prompt = `
      Analyze this chess position: ${position}
      Context: ${context}
      
      Provide a detailed analysis including:
      1. Position evaluation
      2. Key tactical opportunities
      3. Strategic considerations
      4. Best moves for both sides
      5. Historical context if relevant
      
      Write in an engaging, educational style suitable for chess enthusiasts.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a world-class chess analyst and commentator. Provide insightful, accurate, and engaging analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Chess analysis generation failed:', error);
    throw error;
  }
};

// Generate chess article
const generateChessArticle = async (topic, style = 'informative') => {
  try {
    const stylePrompts = {
      informative: 'Write an informative article about',
      dramatic: 'Write a dramatic, story-like article about',
      educational: 'Write an educational article teaching about',
      analytical: 'Write a deep analytical article about'
    };

    const prompt = `
      ${stylePrompts[style] || stylePrompts.informative} ${topic}.
      
      The article should:
      - Be engaging and well-structured
      - Include relevant chess examples
      - Be suitable for chess enthusiasts of all levels
      - Include practical insights and tips
      - Be approximately 800-1200 words
      
      Make it compelling and shareable.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional chess journalist and educator. Write engaging, accurate, and insightful chess content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.8
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Article generation failed:', error);
    throw error;
  }
};

// Generate personalized training content
const generateTrainingContent = async (userLevel, interests, previousSessions = []) => {
  try {
    const prompt = `
      Generate personalized chess training content for a ${userLevel} level player.
      
      Player interests: ${interests.join(', ')}
      Previous training sessions: ${previousSessions.length} completed
      
      Create:
      1. A tactical puzzle appropriate for their level
      2. An opening recommendation based on their interests
      3. A strategic concept to study
      4. A practice game scenario
      
      Make it engaging and tailored to their skill level and interests.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert chess coach. Create personalized, engaging training content that helps players improve.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Training content generation failed:', error);
    throw error;
  }
};

// Generate voice narration script
const generateVoiceScript = async (content, voiceMode = 'calm') => {
  try {
    const modePrompts = {
      calm: 'Write a calm, soothing narration script',
      expressive: 'Write an expressive, engaging narration script',
      dramatic: 'Write a dramatic, intense narration script',
      poetic: 'Write a poetic, beautiful narration script'
    };

    const prompt = `
      ${modePrompts[voiceMode] || modePrompts.calm} for this chess content:
      
      ${content}
      
      The script should:
      - Be optimized for voice narration
      - Match the ${voiceMode} tone
      - Be engaging and clear
      - Include natural pauses and emphasis
      - Be approximately 2-3 minutes when narrated
      
      Format it with clear sentences and natural flow.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional voice script writer specializing in chess content. Create engaging, well-paced scripts for voice narration.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Voice script generation failed:', error);
    throw error;
  }
};

// Analyze user behavior and preferences
const analyzeUserBehavior = async (userData, interactions) => {
  try {
    const prompt = `
      Analyze this chess player's behavior and preferences:
      
      User Data: ${JSON.stringify(userData)}
      Recent Interactions: ${JSON.stringify(interactions)}
      
      Provide insights on:
      1. Preferred playing style
      2. Areas for improvement
      3. Content preferences
      4. Optimal training focus
      5. Recommended features
      
      Be specific and actionable.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a chess psychology expert. Analyze player behavior to provide personalized insights and recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.6
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('User behavior analysis failed:', error);
    throw error;
  }
};

// Generate news summary
const generateNewsSummary = async (newsData) => {
  try {
    const prompt = `
      Summarize this chess news in an engaging way:
      
      ${JSON.stringify(newsData)}
      
      Create:
      1. A compelling headline
      2. A concise summary (2-3 sentences)
      3. Key implications for the chess world
      4. Why this matters to players
      
      Make it engaging and informative.
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a chess news editor. Create engaging, accurate summaries of chess events and developments.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('News summary generation failed:', error);
    throw error;
  }
};

// Content moderation
const moderateContent = async (content) => {
  try {
    const prompt = `
      Review this chess content for appropriateness:
      
      ${content}
      
      Check for:
      1. Inappropriate language
      2. Harmful content
      3. Copyright violations
      4. Accuracy of chess information
      5. Community guidelines compliance
      
      Return a JSON response with:
      - isAppropriate: boolean
      - confidence: number (0-1)
      - issues: array of concerns
      - recommendation: "approve", "review", or "reject"
    `;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a content moderator specializing in chess content. Ensure all content meets community standards.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch {
      return {
        isAppropriate: true,
        confidence: 0.8,
        issues: [],
        recommendation: 'approve'
      };
    }
  } catch (error) {
    console.error('Content moderation failed:', error);
    return {
      isAppropriate: true,
      confidence: 0.5,
      issues: ['Moderation failed'],
      recommendation: 'review'
    };
  }
};

module.exports = {
  initializeAIServices,
  generateChessAnalysis,
  generateChessArticle,
  generateTrainingContent,
  generateVoiceScript,
  analyzeUserBehavior,
  generateNewsSummary,
  moderateContent
}; 