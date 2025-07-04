// Filename: src/lib/voice/EmotionalNarrations.ts

export const ProfessionalNarrations = {
  // CREATE ANTICIPATION
  beforeCriticalMove: {
    text: "The position is ~whispering~ something... <break time='700ms'/> " +
          "Can you hear it? *This* is where legends are born.",
    mode: 'poeticStoryteller',
    tone: 'dramatic'
  },

  // BUILD CONNECTION THROUGH CHESS
  sharedUnderstanding: {
    text: "Ah... you see it too. <break time='400ms'/> " +
          "The *hidden geometry* of the position. " +
          "~This~ is what separates players from artists.",
    mode: 'thoughtfulPhilosopher',
    tone: 'thoughtful'
  },

  // CELEBRATE PROGRESS
  improvementNoticed: {
    text: "*There it is!* The growth, the understanding... " +
          "<break time='500ms'/> Last week, you might have missed this. " +
          "Today? ~You're seeing the board with new eyes~.",
    mode: 'enthusiasticCommentator',
    tone: 'energetic'
  },

  // CREATE MEMORABLE MOMENTS
  epicFinish: {
    text: "And with that final move... <break time='800ms'/> " +
          "*history is written*. Not just on the board, " +
          "but in the ~eternal story~ of chess itself.",
    mode: 'poeticStoryteller',
    tone: 'inspiring'
  },

  // PHILOSOPHICAL DEPTH
  deepReflection: {
    text: "Chess mirrors life in this moment... <break time='600ms'/> " +
          "The choice between *safety and courage*. " +
          "~Which path speaks to your soul?~",
    mode: 'thoughtfulPhilosopher',
    tone: 'thoughtful'
  },

  // NEW: WHISPER MODE NARRATIONS
  nighttimeReflection: {
    text: "_The board is quiet now..._ <break time='800ms'/> " +
          "_Just you, the pieces, and possibility._ " +
          "_What story will you tell?_",
    mode: 'whisperMode',
    tone: 'whisper'
  },

  // NEW: TENSION BUILDER
  beforeSacrifice: {
    text: "Something ~electric~ hangs in the air... <break time='600ms'/> " +
          "This knight... *it wants to jump*. " +
          "Can you feel the board holding its breath?",
    mode: 'dramaticNarrator',
    tone: 'dramatic'
  },

  // NEW: EMOTIONAL RECOVERY
  afterBlunder: {
    text: "We all fall... <break time='500ms'/> " +
          "But look — _the position still breathes_. " +
          "~There's beauty in recovery~, if you're brave enough to find it.",
    mode: 'warmEncourager',
    tone: 'calm'
  },

  // NEW: TIME PRESSURE DRAMA
  timeScramble: {
    text: "*Seconds ticking!* The clock becomes your enemy... " +
          "But wait — ~instinct takes over~. " +
          "This is where preparation meets *destiny*.",
    mode: 'enthusiasticCommentator',
    tone: 'energetic'
  },

  // NEW: ENDGAME POETRY
  endgameArrival: {
    text: "The battlefield clears... <break time='700ms'/> " +
          "Only ~echoes of the war~ remain. " +
          "*Now*, the true test begins.",
    mode: 'poeticStoryteller',
    tone: 'mysterious'
  }
};

// NEW: Dynamic narration selector based on game state
export class NarrationSelector {
  static selectNarration(gameState: {
    moveNumber: number;
    evaluation: number;
    timeLeft: number;
    pieceCount: number;
    lastMoveQuality: string;
  }): typeof ProfessionalNarrations[keyof typeof ProfessionalNarrations] {
    // Critical moment detection
    if (Math.abs(gameState.evaluation) > 3 && gameState.moveNumber > 15) {
      return ProfessionalNarrations.beforeCriticalMove;
    }
    
    // Time pressure
    if (gameState.timeLeft < 60) {
      return ProfessionalNarrations.timeScramble;
    }
    
    // Endgame
    if (gameState.pieceCount < 10) {
      return ProfessionalNarrations.endgameArrival;
    }
    
    // After mistake
    if (gameState.lastMoveQuality === 'blunder' || gameState.lastMoveQuality === 'mistake') {
      return ProfessionalNarrations.afterBlunder;
    }
    
    // Default philosophical
    return ProfessionalNarrations.deepReflection;
  }
}