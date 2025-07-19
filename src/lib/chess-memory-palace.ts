/**
 * Module 323: Chess Memory Palace (3D/VR-ready)
 * Implements 3D visualization system for spatial memory training
 */

export interface MemoryPalace {
  id: string;
  name: string;
  description: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  rooms: MemoryRoom[];
  totalPositions: number;
  averageRating: number;
}

export interface MemoryRoom {
  id: string;
  name: string;
  description: string;
  position: Vector3;
  size: Vector3;
  theme: RoomTheme;
  positions: AnchoredPosition[];
  connections: RoomConnection[];
}

export interface AnchoredPosition {
  id: string;
  fen: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  description: string;
  difficulty: number;
  tags: string[];
  createdAt: Date;
  lastPracticed: Date;
  practiceCount: number;
  successRate: number;
}

export interface RoomConnection {
  fromRoomId: string;
  toRoomId: string;
  type: 'door' | 'corridor' | 'portal';
  position: Vector3;
  direction: Vector3;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface RoomTheme {
  name: string;
  color: string;
  texture: string;
  lighting: LightingSettings;
  ambient: string;
}

export interface LightingSettings {
  intensity: number;
  color: string;
  shadows: boolean;
  fog: boolean;
}

export interface PalaceTour {
  id: string;
  name: string;
  description: string;
  route: TourStop[];
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TourStop {
  roomId: string;
  positionId: string;
  duration: number; // seconds
  instructions: string;
}

export class ChessMemoryPalace {
  private palaces: Map<string, MemoryPalace> = new Map();
  private tours: Map<string, PalaceTour> = new Map();

  /**
   * Create a new memory palace
   */
  async createPalace(userId: string, name: string, description: string, isPublic: boolean = false): Promise<MemoryPalace> {
    const palace: MemoryPalace = {
      id: this.generateId(),
      name,
      description,
      userId,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
      rooms: [],
      totalPositions: 0,
      averageRating: 0
    };

    this.palaces.set(palace.id, palace);
    return palace;
  }

  /**
   * Add a room to the memory palace
   */
  async addRoom(
    palaceId: string,
    name: string,
    description: string,
    position: Vector3,
    size: Vector3,
    theme: RoomTheme
  ): Promise<MemoryRoom> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    const room: MemoryRoom = {
      id: this.generateId(),
      name,
      description,
      position,
      size,
      theme,
      positions: [],
      connections: []
    };

    palace.rooms.push(room);
    palace.updatedAt = new Date();
    
    return room;
  }

  /**
   * Anchor a chess position in a room
   */
  async anchorPosition(
    palaceId: string,
    roomId: string,
    fen: string,
    position: Vector3,
    description: string,
    difficulty: number,
    tags: string[] = []
  ): Promise<AnchoredPosition> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    const room = palace.rooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const anchoredPosition: AnchoredPosition = {
      id: this.generateId(),
      fen,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      description,
      difficulty,
      tags,
      createdAt: new Date(),
      lastPracticed: new Date(),
      practiceCount: 0,
      successRate: 0
    };

    room.positions.push(anchoredPosition);
    palace.totalPositions++;
    palace.updatedAt = new Date();

    return anchoredPosition;
  }

  /**
   * Connect two rooms
   */
  async connectRooms(
    palaceId: string,
    fromRoomId: string,
    toRoomId: string,
    type: 'door' | 'corridor' | 'portal',
    position: Vector3,
    direction: Vector3
  ): Promise<RoomConnection> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    const connection: RoomConnection = {
      fromRoomId,
      toRoomId,
      type,
      position,
      direction
    };

    // Add connection to both rooms
    const fromRoom = palace.rooms.find(r => r.id === fromRoomId);
    const toRoom = palace.rooms.find(r => r.id === toRoomId);

    if (fromRoom && toRoom) {
      fromRoom.connections.push(connection);
      toRoom.connections.push({
        ...connection,
        fromRoomId: toRoomId,
        toRoomId: fromRoomId
      });
    }

    palace.updatedAt = new Date();
    return connection;
  }

  /**
   * Practice a position in the memory palace
   */
  async practicePosition(
    palaceId: string,
    roomId: string,
    positionId: string,
    success: boolean
  ): Promise<void> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    const room = palace.rooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const position = room.positions.find(p => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    // Update practice statistics
    position.practiceCount++;
    position.lastPracticed = new Date();
    
    if (success) {
      position.successRate = (position.successRate * (position.practiceCount - 1) + 1) / position.practiceCount;
    } else {
      position.successRate = (position.successRate * (position.practiceCount - 1)) / position.practiceCount;
    }

    palace.updatedAt = new Date();
  }

  /**
   * Create a guided tour
   */
  async createTour(
    palaceId: string,
    name: string,
    description: string,
    route: TourStop[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<PalaceTour> {
    const tour: PalaceTour = {
      id: this.generateId(),
      name,
      description,
      route,
      duration: route.reduce((total, stop) => total + stop.duration, 0) / 60, // Convert to minutes
      difficulty
    };

    this.tours.set(tour.id, tour);
    return tour;
  }

  /**
   * Get recommended positions for practice
   */
  async getRecommendedPositions(
    palaceId: string,
    userId: string,
    limit: number = 10
  ): Promise<AnchoredPosition[]> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      return [];
    }

    // Get all positions from all rooms
    const allPositions: (AnchoredPosition & { roomId: string })[] = [];
    palace.rooms.forEach(room => {
      room.positions.forEach(position => {
        allPositions.push({ ...position, roomId: room.id });
      });
    });

    // Sort by practice priority (less practiced, lower success rate first)
    allPositions.sort((a, b) => {
      const aPriority = (1 - a.successRate) * (1 / (a.practiceCount + 1));
      const bPriority = (1 - b.successRate) * (1 / (b.practiceCount + 1));
      return bPriority - aPriority;
    });

    return allPositions.slice(0, limit);
  }

  /**
   * Generate 3D visualization data
   */
  async generate3DData(palaceId: string): Promise<any> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    return {
      palace: {
        id: palace.id,
        name: palace.name,
        description: palace.description
      },
      rooms: palace.rooms.map(room => ({
        id: room.id,
        name: room.name,
        description: room.description,
        position: room.position,
        size: room.size,
        theme: room.theme,
        positions: room.positions.map(pos => ({
          id: pos.id,
          fen: pos.fen,
          position: pos.position,
          rotation: pos.rotation,
          scale: pos.scale,
          description: pos.description,
          difficulty: pos.difficulty,
          tags: pos.tags,
          practiceCount: pos.practiceCount,
          successRate: pos.successRate
        })),
        connections: room.connections
      })),
      metadata: {
        totalPositions: palace.totalPositions,
        averageRating: palace.averageRating,
        lastUpdated: palace.updatedAt
      }
    };
  }

  /**
   * Share palace with community
   */
  async sharePalace(palaceId: string): Promise<string> {
    const palace = this.palaces.get(palaceId);
    if (!palace) {
      throw new Error('Palace not found');
    }

    palace.isPublic = true;
    palace.updatedAt = new Date();

    // Generate shareable link
    return `/palace/${palaceId}`;
  }

  /**
   * Get community palaces
   */
  async getCommunityPalaces(limit: number = 20): Promise<MemoryPalace[]> {
    const publicPalaces = Array.from(this.palaces.values())
      .filter(palace => palace.isPublic)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);

    return publicPalaces;
  }

  /**
   * Create memory competition
   */
  async createMemoryCompetition(
    name: string,
    description: string,
    palaceIds: string[],
    duration: number, // minutes
    maxParticipants: number
  ): Promise<{
    id: string;
    name: string;
    description: string;
    palaceIds: string[];
    duration: number;
    maxParticipants: number;
    participants: string[];
    startTime: Date;
    endTime: Date;
  }> {
    const competition = {
      id: this.generateId(),
      name,
      description,
      palaceIds,
      duration,
      maxParticipants,
      participants: [],
      startTime: new Date(),
      endTime: new Date(Date.now() + duration * 60 * 1000)
    };

    return competition;
  }

  /**
   * Get technique tutorials
   */
  async getTechniqueTutorials(): Promise<{
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    techniques: string[];
  }[]> {
    return [
      {
        id: 'tutorial-1',
        title: 'Spatial Memory Fundamentals',
        description: 'Learn the basics of creating and navigating memory palaces',
        difficulty: 'beginner',
        duration: 15,
        techniques: ['Room creation', 'Position anchoring', 'Navigation basics']
      },
      {
        id: 'tutorial-2',
        title: 'Advanced Position Visualization',
        description: 'Master complex position visualization and recall',
        difficulty: 'intermediate',
        duration: 25,
        techniques: ['Multi-room navigation', 'Position linking', 'Pattern recognition']
      },
      {
        id: 'tutorial-3',
        title: 'VR Memory Palace Mastery',
        description: 'Advanced techniques for VR-enhanced memory training',
        difficulty: 'advanced',
        duration: 35,
        techniques: ['VR navigation', '3D position manipulation', 'Immersive recall']
      }
    ];
  }

  /**
   * Track progress
   */
  async getProgress(userId: string): Promise<{
    totalPalaces: number;
    totalPositions: number;
    totalPracticeTime: number;
    averageSuccessRate: number;
    streakDays: number;
    achievements: string[];
  }> {
    const userPalaces = Array.from(this.palaces.values())
      .filter(palace => palace.userId === userId);

    const totalPalaces = userPalaces.length;
    const totalPositions = userPalaces.reduce((sum, palace) => sum + palace.totalPositions, 0);
    
    // Calculate other metrics
    const totalPracticeTime = 0; // Would be calculated from practice sessions
    const averageSuccessRate = 0.75; // Would be calculated from practice data
    const streakDays = 7; // Would be calculated from daily practice
    const achievements = ['First Palace', '10 Positions', '7-Day Streak']; // Would be dynamic

    return {
      totalPalaces,
      totalPositions,
      totalPracticeTime,
      averageSuccessRate,
      streakDays,
      achievements
    };
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const chessMemoryPalace = new ChessMemoryPalace(); 