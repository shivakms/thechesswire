/**
 * Chess Diagram Image Processor
 * 
 * This module provides image processing functionality for chess diagrams.
 * It addresses the missing image processing dependency identified in the gaps analysis.
 */

export interface ChessDiagram {
  id: string;
  fen: string;
  imageUrl: string;
  thumbnailUrl?: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    createdAt: Date;
  };
  annotations?: {
    arrows: Arrow[];
    circles: Circle[];
    squares: Square[];
    text: TextAnnotation[];
  };
}

export interface Arrow {
  from: string; // square notation (e.g., 'e2')
  to: string;   // square notation (e.g., 'e4')
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface Circle {
  square: string; // square notation (e.g., 'e4')
  color: string;
  radius: number;
  style: 'filled' | 'outline';
}

export interface Square {
  square: string; // square notation (e.g., 'e4')
  color: string;
  opacity: number;
}

export interface TextAnnotation {
  text: string;
  position: { x: number; y: number };
  color: string;
  fontSize: number;
  fontFamily: string;
}

export interface DiagramGenerationOptions {
  size: number; // board size in pixels
  theme: 'classic' | 'modern' | 'wood' | 'blue' | 'green';
  orientation: 'white' | 'black';
  showCoordinates: boolean;
  showMoveNumbers: boolean;
  annotations?: {
    arrows?: Arrow[];
    circles?: Circle[];
    squares?: Square[];
    text?: TextAnnotation[];
  };
}

export class ChessDiagramProcessor {
  private static instance: ChessDiagramProcessor;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  private constructor() {}

  public static getInstance(): ChessDiagramProcessor {
    if (!ChessDiagramProcessor.instance) {
      ChessDiagramProcessor.instance = new ChessDiagramProcessor();
    }
    return ChessDiagramProcessor.instance;
  }

  /**
   * Generate chess diagram from FEN
   */
  async generateDiagram(fen: string, options: DiagramGenerationOptions): Promise<ChessDiagram> {
    try {
      const canvas = this.createCanvas(options.size);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      this.canvas = canvas;
      this.ctx = ctx;

      // Draw the board
      this.drawBoard(ctx, options);
      
      // Draw the pieces
      this.drawPieces(ctx, fen, options);
      
      // Draw annotations
      if (options.annotations) {
        this.drawAnnotations(ctx, options.annotations);
      }

      // Convert to image
      const imageUrl = canvas.toDataURL('image/png');
      const thumbnailUrl = await this.generateThumbnail(canvas, 200);

      const diagram: ChessDiagram = {
        id: this.generateId(),
        fen,
        imageUrl,
        thumbnailUrl,
        metadata: {
          width: options.size,
          height: options.size,
          format: 'PNG',
          size: this.getImageSize(imageUrl),
          createdAt: new Date()
        },
        annotations: options.annotations
      };

      return diagram;

    } catch (error) {
      console.error('Failed to generate chess diagram:', error);
      throw new Error('Diagram generation failed');
    }
  }

  /**
   * Create canvas element
   */
  private createCanvas(size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  /**
   * Draw chess board
   */
  private drawBoard(ctx: CanvasRenderingContext2D, options: DiagramGenerationOptions): void {
    const { size, theme } = options;
    const squareSize = size / 8;

    // Get theme colors
    const colors = this.getThemeColors(theme);

    // Draw squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? colors.light : colors.dark;
        
        ctx.fillStyle = color;
        ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
      }
    }

    // Draw coordinates if enabled
    if (options.showCoordinates) {
      this.drawCoordinates(ctx, size, theme);
    }
  }

  /**
   * Draw chess pieces
   */
  private drawPieces(ctx: CanvasRenderingContext2D, fen: string, options: DiagramGenerationOptions): void {
    const { size, orientation } = options;
    const squareSize = size / 8;
    const pieceSize = squareSize * 0.8;

    // Parse FEN
    const [position] = fen.split(' ');
    const ranks = position.split('/');

    // Adjust for orientation
    const ranksToUse = orientation === 'black' ? ranks.reverse() : ranks;

    ranksToUse.forEach((rank, rowIndex) => {
      let colIndex = 0;
      
      for (const char of rank) {
        if (/\d/.test(char)) {
          colIndex += parseInt(char);
        } else {
          const piece = this.getPieceInfo(char);
          if (piece) {
            const x = colIndex * squareSize + (squareSize - pieceSize) / 2;
            const y = rowIndex * squareSize + (squareSize - pieceSize) / 2;
            
            this.drawPiece(ctx, piece, x, y, pieceSize);
          }
          colIndex++;
        }
      }
    });
  }

  /**
   * Draw individual piece
   */
  private drawPiece(ctx: CanvasRenderingContext2D, piece: { type: string; color: string }, x: number, y: number, size: number): void {
    // This is a simplified piece drawing
    // In production, you would use actual piece images or SVG
    
    ctx.fillStyle = piece.color === 'w' ? '#ffffff' : '#000000';
    ctx.strokeStyle = piece.color === 'w' ? '#000000' : '#ffffff';
    ctx.lineWidth = 2;

    // Draw piece base
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw piece symbol
    ctx.fillStyle = piece.color === 'w' ? '#000000' : '#ffffff';
    ctx.font = `${size / 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const symbol = this.getPieceSymbol(piece.type);
    ctx.fillText(symbol, x + size / 2, y + size / 2);
  }

  /**
   * Get piece information from character
   */
  private getPieceInfo(char: string): { type: string; color: string } | null {
    const pieceMap: { [key: string]: { type: string; color: string } } = {
      'K': { type: 'king', color: 'w' },
      'Q': { type: 'queen', color: 'w' },
      'R': { type: 'rook', color: 'w' },
      'B': { type: 'bishop', color: 'w' },
      'N': { type: 'knight', color: 'w' },
      'P': { type: 'pawn', color: 'w' },
      'k': { type: 'king', color: 'b' },
      'q': { type: 'queen', color: 'b' },
      'r': { type: 'rook', color: 'b' },
      'b': { type: 'bishop', color: 'b' },
      'n': { type: 'knight', color: 'b' },
      'p': { type: 'pawn', color: 'b' }
    };

    return pieceMap[char] || null;
  }

  /**
   * Get piece symbol
   */
  private getPieceSymbol(type: string): string {
    const symbols: { [key: string]: string } = {
      'king': '♔',
      'queen': '♕',
      'rook': '♖',
      'bishop': '♗',
      'knight': '♘',
      'pawn': '♙'
    };

    return symbols[type] || '?';
  }

  /**
   * Get theme colors
   */
  private getThemeColors(theme: string): { light: string; dark: string } {
    const themes: { [key: string]: { light: string; dark: string } } = {
      'classic': { light: '#f0d9b5', dark: '#b58863' },
      'modern': { light: '#ffffff', dark: '#888888' },
      'wood': { light: '#d4a574', dark: '#8b4513' },
      'blue': { light: '#e6f3ff', dark: '#4a90e2' },
      'green': { light: '#e8f5e8', dark: '#4caf50' }
    };

    return themes[theme] || themes.classic;
  }

  /**
   * Draw coordinates
   */
  private drawCoordinates(ctx: CanvasRenderingContext2D, size: number, theme: string): void {
    const squareSize = size / 8;
    const colors = this.getThemeColors(theme);
    
    ctx.font = `${squareSize / 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw file coordinates (a-h)
    for (let i = 0; i < 8; i++) {
      const file = String.fromCharCode(97 + i); // a-h
      const x = i * squareSize + squareSize / 2;
      const y = size - squareSize / 4;
      
      ctx.fillStyle = colors.dark;
      ctx.fillText(file, x, y);
    }

    // Draw rank coordinates (1-8)
    for (let i = 0; i < 8; i++) {
      const rank = 8 - i;
      const x = squareSize / 4;
      const y = i * squareSize + squareSize / 2;
      
      ctx.fillStyle = colors.dark;
      ctx.fillText(rank.toString(), x, y);
    }
  }

  /**
   * Draw annotations
   */
  private drawAnnotations(ctx: CanvasRenderingContext2D, annotations: NonNullable<DiagramGenerationOptions['annotations']>): void {
    const squareSize = (this.canvas?.width || 400) / 8;

    // Draw squares
    if (annotations.squares) {
      annotations.squares.forEach(square => {
        this.drawSquareHighlight(ctx, square, squareSize);
      });
    }

    // Draw circles
    if (annotations.circles) {
      annotations.circles.forEach(circle => {
        this.drawCircle(ctx, circle, squareSize);
      });
    }

    // Draw arrows
    if (annotations.arrows) {
      annotations.arrows.forEach(arrow => {
        this.drawArrow(ctx, arrow, squareSize);
      });
    }

    // Draw text
    if (annotations.text) {
      annotations.text.forEach(text => {
        this.drawText(ctx, text);
      });
    }
  }

  /**
   * Draw square highlight
   */
  private drawSquareHighlight(ctx: CanvasRenderingContext2D, square: Square, squareSize: number): void {
    const { x, y } = this.squareToCoordinates(square.square);
    
    ctx.fillStyle = square.color;
    ctx.globalAlpha = square.opacity;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    ctx.globalAlpha = 1;
  }

  /**
   * Draw circle
   */
  private drawCircle(ctx: CanvasRenderingContext2D, circle: Circle, squareSize: number): void {
    const { x, y } = this.squareToCoordinates(circle.square);
    const centerX = x * squareSize + squareSize / 2;
    const centerY = y * squareSize + squareSize / 2;
    const radius = circle.radius || squareSize / 3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    if (circle.style === 'filled') {
      ctx.fillStyle = circle.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = circle.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Draw arrow
   */
  private drawArrow(ctx: CanvasRenderingContext2D, arrow: Arrow, squareSize: number): void {
    const from = this.squareToCoordinates(arrow.from);
    const to = this.squareToCoordinates(arrow.to);
    
    const fromX = from.x * squareSize + squareSize / 2;
    const fromY = from.y * squareSize + squareSize / 2;
    const toX = to.x * squareSize + squareSize / 2;
    const toY = to.y * squareSize + squareSize / 2;

    // Set line style
    ctx.strokeStyle = arrow.color;
    ctx.lineWidth = arrow.width || 3;
    
    if (arrow.style === 'dashed') {
      ctx.setLineDash([5, 5]);
    } else if (arrow.style === 'dotted') {
      ctx.setLineDash([2, 2]);
    } else {
      ctx.setLineDash([]);
    }

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    this.drawArrowhead(ctx, fromX, fromY, toX, toY, arrow.color);

    // Reset line style
    ctx.setLineDash([]);
  }

  /**
   * Draw arrowhead
   */
  private drawArrowhead(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string): void {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle - arrowAngle),
      toY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      toX - arrowLength * Math.cos(angle + arrowAngle),
      toY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw text annotation
   */
  private drawText(ctx: CanvasRenderingContext2D, text: TextAnnotation): void {
    ctx.fillStyle = text.color;
    ctx.font = `${text.fontSize}px ${text.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.text, text.position.x, text.position.y);
  }

  /**
   * Convert square notation to coordinates
   */
  private squareToCoordinates(square: string): { x: number; y: number } {
    const file = square.charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = 8 - parseInt(square[1]); // 1=7, 2=6, etc.
    return { x: file, y: rank };
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(canvas: HTMLCanvasElement, size: number): Promise<string> {
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = size;
    thumbnailCanvas.height = size;
    
    const ctx = thumbnailCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get thumbnail canvas context');

    // Scale and draw
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);
    
    return thumbnailCanvas.toDataURL('image/png');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `diagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get image size from data URL
   */
  private getImageSize(dataUrl: string): number {
    // Approximate size calculation
    return Math.round(dataUrl.length * 0.75);
  }

  /**
   * Process existing chess diagram image
   */
  async processDiagramImage(imageUrl: string): Promise<ChessDiagram> {
    try {
      // Load image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(img, 0, 0);

      // Extract FEN from image (simplified - in production, use OCR)
      const fen = this.extractFENFromImage(ctx, img.width, img.height);

      const diagram: ChessDiagram = {
        id: this.generateId(),
        fen,
        imageUrl,
        metadata: {
          width: img.width,
          height: img.height,
          format: 'PNG',
          size: this.getImageSize(imageUrl),
          createdAt: new Date()
        }
      };

      return diagram;

    } catch (error) {
      console.error('Failed to process diagram image:', error);
      throw new Error('Image processing failed');
    }
  }

  /**
   * Extract FEN from image (placeholder implementation)
   */
  private extractFENFromImage(ctx: CanvasRenderingContext2D, width: number, height: number): string {
    // This is a placeholder implementation
    // In production, you would use OCR or computer vision to detect pieces
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }

  /**
   * Add annotations to existing diagram
   */
  async addAnnotations(diagram: ChessDiagram, annotations: NonNullable<DiagramGenerationOptions['annotations']>): Promise<ChessDiagram> {
    try {
      // Load original image
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = diagram.imageUrl;
      });

      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      ctx.drawImage(img, 0, 0);

      // Add annotations
      this.drawAnnotations(ctx, annotations);

      // Generate new image URL
      const newImageUrl = canvas.toDataURL('image/png');

      // Update diagram
      return {
        ...diagram,
        imageUrl: newImageUrl,
        annotations: {
          ...diagram.annotations,
          ...annotations
        },
        metadata: {
          ...diagram.metadata,
          size: this.getImageSize(newImageUrl)
        }
      };

    } catch (error) {
      console.error('Failed to add annotations:', error);
      throw new Error('Annotation addition failed');
    }
  }
}

// Export singleton instance
export const chessDiagramProcessor = ChessDiagramProcessor.getInstance();

// Export utility functions
export const generateDiagram = (fen: string, options: DiagramGenerationOptions) => 
  chessDiagramProcessor.generateDiagram(fen, options);

export const processDiagramImage = (imageUrl: string) => 
  chessDiagramProcessor.processDiagramImage(imageUrl);

export const addAnnotations = (diagram: ChessDiagram, annotations: NonNullable<DiagramGenerationOptions['annotations']>) => 
  chessDiagramProcessor.addAnnotations(diagram, annotations); 