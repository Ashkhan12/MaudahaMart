/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import { ScratchCard, Language } from '../types';

interface ScratchCardComponentProps {
  card: ScratchCard;
  language: Language;
  onScratchComplete: (cardId: string) => void;
}

export default function ScratchCardComponent({
  card,
  language,
  onScratchComplete,
}: ScratchCardComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(card.isScratched);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);

  useEffect(() => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on container
    const resizeCanvas = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = rect?.width || 280;
      canvas.height = rect?.height || 140;

      // Draw metallic silver gradient scratch overlay
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#c0c0c0');
      grad.addColorStop(0.3, '#e0e0e0');
      grad.addColorStop(0.5, '#a0a0a0');
      grad.addColorStop(0.7, '#f0f0f0');
      grad.addColorStop(1, '#909090');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a cool texture/pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < canvas.width; i += 12) {
        ctx.fillRect(i, 0, 1, canvas.height);
      }
      for (let j = 0; j < canvas.height; j += 12) {
        ctx.fillRect(0, j, canvas.width, 1);
      }

      // Add text label overlay
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textEn = 'SCRATCH HERE! 🎁';
      const textHi = 'यहाँ स्क्रैच करें! 🎁';
      ctx.fillText(language === 'en' ? textEn : textHi, canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '9px sans-serif';
      ctx.fillText(
        language === 'en' ? 'Maudaha Mart Exclusive' : 'मौदहा मार्ट विशेष ऑफर',
        canvas.width / 2,
        canvas.height / 2 + 24
      );
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isScratched, language]);

  const handleStart = (clientX: number, clientY: number) => {
    if (isScratched) return;
    setIsScratching(true);
    scratch(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isScratching || isScratched) return;
    scratch(clientX, clientY);
  };

  const handleEnd = () => {
    setIsScratching(false);
    checkScratchPercentage();
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let clearedCount = 0;

    // Sample every 4th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        clearedCount++;
      }
    }

    const totalSamples = pixels.length / 16;
    const percentage = (clearedCount / totalSamples) * 100;
    setScratchedPercent(percentage);

    if (percentage > 40) {
      revealCard();
    }
  };

  const revealCard = () => {
    setIsScratched(true);
    onScratchComplete(card.id);
  };

  // Touch and mouse events mapping
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleEnd();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches[0]) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  return (
    <div
      ref={containerRef}
      id={`scratch-card-${card.id}`}
      className="relative w-full max-w-sm h-36 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-amber-700/15 border border-amber-500/20 rounded-2xl overflow-hidden shadow-md group flex flex-col justify-between p-4"
    >
      {/* Background Reward Content (Behind Canvas) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-br from-amber-50 via-white to-amber-50/60 z-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              {language === 'en' ? 'SCRATCH CARD WINNER' : 'स्क्रैच कार्ड विजेता'}
            </span>
            <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1 mt-1">
              {language === 'hi' ? card.productNameHi : card.productName}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold">
              {language === 'en' ? 'Special 4-Day Restocked Item' : 'विशेष 4-दिवसीय अप्रयुक्त सामान'}
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-dashed border-slate-200 pt-2 mt-1">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">EXCLUSIVE OFFER</span>
            <span className="text-2xl font-black text-emerald-600 tracking-tight block font-mono">
              {card.discountPercentage}% {language === 'en' ? 'EXTRA OFF' : 'अतिरिक्त छूट'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 uppercase tracking-widest animate-pulse">
              <Gift className="h-2.5 w-2.5" />
              {language === 'en' ? 'ACTIVE' : 'सक्रिय'}
            </span>
          </div>
        </div>
      </div>

      {/* Silver Canvas Overlay */}
      <AnimatePresence>
        {!isScratched && (
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-10 cursor-crosshair touch-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        )}
      </AnimatePresence>

      {/* Complete Reveal Fireworks Button (If user gets stuck/lazy) */}
      {!isScratched && (
        <button type="button"
          onClick={revealCard}
          className="absolute bottom-2 right-2 z-20 text-[9px] bg-slate-900/80 backdrop-blur-xs text-white hover:bg-slate-900 font-black px-2 py-1 rounded-lg transition active:scale-95 cursor-pointer shadow-sm border border-slate-700"
        >
          {language === 'en' ? 'Quick Reveal ⚡' : 'जल्दी दिखाएं ⚡'}
        </button>
      )}
    </div>
  );
}
