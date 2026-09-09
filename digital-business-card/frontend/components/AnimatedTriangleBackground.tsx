'use client'

/**
 * Uses the real uploaded background image (public/backgrounds/triangles.jpg)
 * instead of a generated SVG pattern — it matches the reference exactly.
 * The slow pan+zoom keyframe keeps it from feeling static.
 *
 * Setup:
 * 1. Put the image file at: public/backgrounds/triangles.jpg
 * 2. Add this to tailwind.config.js (or globals.css if not using Tailwind keyframes):
 *
 *    theme: {
 *      extend: {
 *        keyframes: {
 *          bgPan: {
 *            '0%, 100%': { transform: 'scale(1.1) translate(0, 0)' },
 *            '50%': { transform: 'scale(1.18) translate(-2%, -1.5%)' },
 *          },
 *        },
 *        animation: {
 *          'bg-pan': 'bgPan 25s ease-in-out infinite',
 *        },
 *      },
 *    },
 *
 * 3. Drop <AnimatedTriangleBackground /> right after the opening wrapper div
 *    in app/c/[id]/page.tsx, same as before.
 */
export default function AnimatedTriangleBackground() {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center animate-bg-pan"
      style={{ backgroundImage: "url('/backgrounds/triangles.jpg')" }}
    />
  )
}