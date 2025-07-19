import { KimiChessBrain } from '@/lib/KimiChessBrain'

describe('KimiChessBrain', () => {
  let kimi: KimiChessBrain

  beforeEach(() => {
    kimi = new KimiChessBrain()
  })

  describe('parsePGN', () => {
    it('should parse valid PGN correctly', () => {
      const pgn = `[Event "Test Game"]
[Site "Test Site"]
[Date "2024.01.01"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. cxb5 axb5 13. Nc3 Bb7 14. Bg5 b4 15. Nb1 h6 16. Bh4 c5 17. dxe5 Nxe4 18. Bxe7 Qxe7 19. exd6 Qf6 20. Nbd2 Nxd6 21. Nc4 Nxc4 22. Bxc4 Nb6 23. Ne5 Rae8 24. Bxf7+ Rxf7 25. Nxf7 Rxe1+ 26. Qxe1 Kxf7 27. Qe3 Qg5 28. Qxg5 hxg5 29. b3 Ke6 30. a3 Kd6 31. axb4 cxb4 32. Ra5 Nd5 33. f3 Bc8 34. Kf2 Bf5 35. Ra7 g6 36. Ra6+ Kc5 37. Ke1 Nf4 38. g3 Nxh3 39. Kd2 Kb5 40. Rd6 Kc5 41. Ra6 Nf2 42. g4 Bd3 43. Re6 1-0`

      const result = kimi.parsePGN(pgn)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.title).toContain('Player 1 vs Player 2')
      expect(result.data?.moves).toHaveLength(42)
      expect(result.data?.opening).toBeDefined()
      expect(result.data?.tacticalHighlights).toBeDefined()
    })

    it('should handle empty PGN', () => {
      const result = kimi.parsePGN('')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Empty PGN string')
    })

    it('should handle invalid PGN format', () => {
      const invalidPgn = 'This is not a valid PGN'
      
      const result = kimi.parsePGN(invalidPgn)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid PGN format')
    })

    it('should handle PGN with no moves', () => {
      const pgnWithNoMoves = `[Event "Test"]
[White "Player 1"]
[Black "Player 2"]
[Result "*"]

*`

      const result = kimi.parsePGN(pgnWithNoMoves)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('No moves found')
    })
  })

  describe('extractMetadata', () => {
    it('should extract all metadata fields', () => {
      const pgn = `[Event "Test Event"]
[Site "Test Site"]
[Date "2024.01.01"]
[Round "1"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]
[WhiteElo "2000"]
[BlackElo "1900"]
[ECO "C60"]
[Opening "Ruy Lopez"]

1. e4 e5 2. Nf3 Nc6 1-0`

      const metadata = kimi.extractMetadata(pgn)

      expect(metadata.event).toBe('Test Event')
      expect(metadata.site).toBe('Test Site')
      expect(metadata.date).toBe('2024.01.01')
      expect(metadata.round).toBe('1')
      expect(metadata.white).toBe('Player 1')
      expect(metadata.black).toBe('Player 2')
      expect(metadata.result).toBe('1-0')
      expect(metadata.whiteElo).toBe('2000')
      expect(metadata.blackElo).toBe('1900')
      expect(metadata.eco).toBe('C60')
      expect(metadata.opening).toBe('Ruy Lopez')
    })

    it('should handle missing metadata fields', () => {
      const pgn = `[White "Player 1"]
[Black "Player 2"]

1. e4 e5 1-0`

      const metadata = kimi.extractMetadata(pgn)

      expect(metadata.white).toBe('Player 1')
      expect(metadata.black).toBe('Player 2')
      expect(metadata.event).toBe('Unknown Event')
      expect(metadata.site).toBe('Unknown Site')
    })
  })

  describe('detectOpening', () => {
    it('should detect common openings', () => {
      const ruyLopez = '1. e4 e5 2. Nf3 Nc6 3. Bb5'
      const sicilian = '1. e4 c5'
      const french = '1. e4 e6'
      const caroKann = '1. e4 c6'

      expect(kimi.detectOpening(ruyLopez)).toContain('Ruy Lopez')
      expect(kimi.detectOpening(sicilian)).toContain('Sicilian')
      expect(kimi.detectOpening(french)).toContain('French')
      expect(kimi.detectOpening(caroKann)).toContain('Caro-Kann')
    })

    it('should handle unknown openings', () => {
      const unknownOpening = '1. a3 a6 2. h3 h6'
      
      const result = kimi.detectOpening(unknownOpening)
      
      expect(result).toContain('Unknown')
    })
  })

  describe('analyzeTactics', () => {
    it('should identify tactical opportunities', () => {
      const tacticalPosition = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Nxe4'
      
      const tactics = kimi.analyzeTactics(tacticalPosition)
      
      expect(tactics).toBeDefined()
      expect(Array.isArray(tactics)).toBe(true)
    })

    it('should handle positions with no tactics', () => {
      const quietPosition = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7'
      
      const tactics = kimi.analyzeTactics(quietPosition)
      
      expect(tactics).toBeDefined()
      expect(Array.isArray(tactics)).toBe(true)
    })
  })

  describe('generateSummary', () => {
    it('should generate meaningful game summary', () => {
      const gameData = {
        title: 'Test Game',
        players: { white: 'Player 1', black: 'Player 2' },
        result: '1-0',
        moves: Array(20).fill({}),
        opening: 'Ruy Lopez',
        tacticalHighlights: [{ type: 'brilliant', move: 10 }]
      }

      const summary = kimi.generateSummary(gameData)
      
      expect(summary).toBeDefined()
      expect(typeof summary).toBe('string')
      expect(summary.length).toBeGreaterThan(0)
    })
  })

  describe('validatePGN', () => {
    it('should validate correct PGN', () => {
      const validPgn = `[Event "Test"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 1-0`

      const result = kimi.validatePGN(validPgn)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should catch validation errors', () => {
      const invalidPgn = 'Invalid PGN format'
      
      const result = kimi.validatePGN(invalidPgn)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
}) 