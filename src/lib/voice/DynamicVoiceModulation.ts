// Filename: src/lib/voice/DynamicVoiceModulation.ts

export class DynamicVoiceModulation {
  // Add subtle variations to keep voice feeling alive
  static addHumanVariation(baseSettings: any): any {
    return {
      ...baseSettings,
      stability: this.varyValue(baseSettings.stability, 0.05),
      similarity_boost: this.varyValue(baseSettings.similarity_boost, 0.03),
      style: this.varyValue(baseSettings.style, 0.05)
    };
  }

  private static varyValue(base: number, variance: number): number {
    const variation = (Math.random() - 0.5) * variance * 2;
    return Math.max(0, Math.min(1, base + variation));
  }

  // Add contextual emphasis
  static enhanceChessTerms(text: string): string {
    const chessTerms = [
      'checkmate', 'sacrifice', 'brilliancy', 'endgame', 
      'zugzwang', 'fork', 'pin', 'discovery'
    ];
    
    let enhanced = text;
    chessTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `<emphasis level="moderate">${term}</emphasis>`);
    });
    
    return enhanced;
  }

  // Add breathing for naturalness
  static addNaturalBreathing(text: string): string {
    // Add micro-pauses after punctuation
    return text
      .replace(/([.!?])\s+/g, '$1 <break time="250ms"/> ')
      .replace(/([,;:])\s+/g, '$1 <break time="100ms"/> ')
      .replace(/—/g, '<break time="300ms"/> — <break time="300ms"/>');
  }
}