import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReplayBoard from '@/components/ReplayBoard'

// Mock chess.js
jest.mock('chess.js', () => {
  return jest.fn().mockImplementation(() => ({
    load: jest.fn(),
    get: jest.fn(() => null),
    history: jest.fn(() => []),
    isCheckmate: jest.fn(() => false),
    isDraw: jest.fn(() => false),
    isStalemate: jest.fn(() => false),
    fen: jest.fn(() => 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
  }))
})

const mockGameData = {
  title: "Test Game",
  summary: "A test chess game",
  players: {
    white: "Player 1",
    black: "Player 2"
  },
  result: "1-0",
  date: "2024-01-01",
  event: "Test Event",
  opening: "Ruy Lopez",
  moves: [
    {
      moveNumber: 1,
      whiteMove: {
        san: "e4",
        annotation: "!"
      },
      blackMove: {
        san: "e5",
        annotation: "!"
      },
      comments: ["Great opening moves!"]
    },
    {
      moveNumber: 2,
      whiteMove: {
        san: "Nf3",
        annotation: "!"
      },
      blackMove: {
        san: "Nc6",
        annotation: "!"
      },
      comments: ["Developing knights"]
    }
  ],
  tacticalHighlights: [
    {
      move: 1,
      type: "brilliant",
      description: "Excellent opening move"
    }
  ],
  evaluation: {
    final: "+1.5",
    trend: "improving"
  }
}

describe('ReplayBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the chessboard', () => {
    render(<ReplayBoard gameData={mockGameData} />)
    
    expect(screen.getByText('Test Game')).toBeInTheDocument()
    expect(screen.getByText('A test chess game')).toBeInTheDocument()
    expect(screen.getByText('Player 1 vs Player 2')).toBeInTheDocument()
  })

  it('displays move list', () => {
    render(<ReplayBoard gameData={mockGameData} />)
    
    expect(screen.getByText('1.')).toBeInTheDocument()
    expect(screen.getByText('e4')).toBeInTheDocument()
    expect(screen.getByText('e5')).toBeInTheDocument()
    expect(screen.getByText('Nf3')).toBeInTheDocument()
    expect(screen.getByText('Nc6')).toBeInTheDocument()
  })

  it('shows tactical highlights', () => {
    render(<ReplayBoard gameData={mockGameData} showAnnotations={true} />)
    
    expect(screen.getByText('!')).toBeInTheDocument()
    expect(screen.getByText('Great opening moves!')).toBeInTheDocument()
  })

  it('handles play/pause controls', () => {
    render(<ReplayBoard gameData={mockGameData} />)
    
    const playButton = screen.getByRole('button', { name: /play/i })
    fireEvent.click(playButton)
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('handles move navigation', () => {
    render(<ReplayBoard gameData={mockGameData} />)
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    const prevButton = screen.getByRole('button', { name: /previous/i })
    
    fireEvent.click(nextButton)
    fireEvent.click(prevButton)
    
    // Should handle navigation without errors
    expect(nextButton).toBeInTheDocument()
    expect(prevButton).toBeInTheDocument()
  })

  it('displays error state for invalid game data', () => {
    const invalidGameData = {
      ...mockGameData,
      moves: []
    }
    
    render(<ReplayBoard gameData={invalidGameData} />)
    
    expect(screen.getByText(/no moves available/i)).toBeInTheDocument()
  })

  it('allows user annotations when enabled', () => {
    render(<ReplayBoard gameData={mockGameData} allowUserAnnotations={true} />)
    
    const annotationButtons = screen.getAllByText('+ Note')
    expect(annotationButtons.length).toBeGreaterThan(0)
  })

  it('handles timeline slider', () => {
    render(<ReplayBoard gameData={mockGameData} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    
    fireEvent.change(slider, { target: { value: '1' } })
    
    // Should handle slider changes without errors
    expect(slider).toBeInTheDocument()
  })
}) 