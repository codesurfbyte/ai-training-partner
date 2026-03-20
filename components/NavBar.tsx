'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function NavBar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const navLinks = [{ href: '/', label: 'Count' }]

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-canvas/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-[11px] font-bold uppercase tracking-[0.28em] text-black shadow-[0_10px_30px_rgba(20,241,149,0.35)]">
            AI
          </span>
          <div className="leading-none">
            <span className="block font-display text-[1rem] font-bold uppercase tracking-[0.18em] text-ink">
              Training Partner
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.32em] text-slate">
              Performance Booking System
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/80 p-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150',
                pathname === link.href
                  ? 'bg-black text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)]'
                  : 'text-slate hover:bg-black/5 hover:text-ink'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-ink md:hidden"
          aria-label="메뉴 열기"
        >
          <div className="w-5 space-y-1.5">
            <span
              className={cn(
                'block h-0.5 bg-current transition-all duration-200',
                menuOpen ? 'translate-y-2 rotate-45' : ''
              )}
            />
            <span
              className={cn(
                'block h-0.5 bg-current transition-all duration-200',
                menuOpen ? 'opacity-0' : ''
              )}
            />
            <span
              className={cn(
                'block h-0.5 bg-current transition-all duration-200',
                menuOpen ? '-translate-y-2 -rotate-45' : ''
              )}
            />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-black/10 bg-canvas px-4 py-4 md:hidden">
          <div className="space-y-2 rounded-[28px] border border-black/10 bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-black text-white'
                    : 'text-slate hover:bg-black/5 hover:text-ink'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
