"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  gameUrl: string
  gameTitle: string
}

export function GameModal({ isOpen, onClose, gameUrl, gameTitle }: GameModalProps) {
  const [showIframe, setShowIframe] = useState(false)
  const [tvOn, setTvOn] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | undefined>(undefined)

  // Generate CRT noise
  const snow = (ctx: CanvasRenderingContext2D): void => {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const d = ctx.createImageData(w, h)
    const b = new Uint32Array(d.data.buffer)
    const len = b.length

    for (let i = 0; i < len; i++) {
      b[i] = ((255 * Math.random()) | 0) << 24
    }

    ctx.putImageData(d, 0, 0)
  }

  const animate = (): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    snow(ctx)
    frameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (isOpen) {
      // Immediately turn on TV and start effects
      setTvOn(true)
      
      // Start noise animation immediately
      const canvas = canvasRef.current
      if (canvas) {
        const ww = window.innerWidth
        canvas.width = ww / 3
        canvas.height = (ww * 0.5625) / 3
        animate()
      }
      
      // Start transition after menu display
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(true)
      }, 4500)

      // Show game after transition starts
      const gameTimer = setTimeout(() => {
        setShowIframe(true)
      }, 5000)

      return () => {
        clearTimeout(transitionTimer)
        clearTimeout(gameTimer)
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current)
        }
      }
    } else {
      setTvOn(false)
      setShowIframe(false)
      setIsTransitioning(false)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 game-modal bg-[#1b2838] overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 game-modal-close p-2 rounded-full bg-white hover:bg-gray-100 text-black transition-colors z-50"
        aria-label="Close game"
      >
        <X className="h-6 w-6" />
      </button>

      {/* CRT TV */}
      <main className="scanlines h-screen w-screen">
        <div className={`screen ${tvOn ? 'on' : 'off'} ${isTransitioning ? 'transitioning' : ''}`}>
          <canvas ref={canvasRef} id="canvas" className="picture"></canvas>
          <div className={`overlay transition-all duration-2000 ${isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
            <div className="text">
              <span>AV-1</span>
              <span>AV-1</span>
              <span>AV-1</span>
              <span>AV-1</span>
              <span>AV-1</span>
            </div>
            <div className="menu">
              <header>
                {gameTitle}
              </header>
              <ul>
                <li className="active"><a href="#" title="">Cartridge Ready</a></li>
                <li><a href="#" title="">Initializing...</a></li>
              </ul>
              <footer>
                <div className="system-name">Bario Entertainment System</div>
              </footer>
            </div>
          </div>
          
          {/* Game iframe - Direct loading only */}
          {showIframe && gameUrl && (
            <iframe
              src={gameUrl}
              className="absolute inset-0 w-full h-full border-0 z-30"
              title={gameTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
              loading="eager"
            />
          )}
        </div>
      </main>

      <style jsx>{`
        .screen.transitioning {
          transform: scale(1.05);
          transition: transform 2s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeInZoom 2s ease-out forwards;
        }
        
        @keyframes fadeInZoom {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
} 