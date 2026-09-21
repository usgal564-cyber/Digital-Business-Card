'use client'

import { getRows, getSocials, initials, type CardTemplateProps, type RowItem } from './shared'

export default function GlassCard({ user, showQr = true, qrChildren, onAddContact, onVcfContact }: CardTemplateProps) {
  const socials = getSocials(user)
  const rows = getRows(user)

  return (
    <div className="w-full max-w-[400px] mx-auto rounded-[44px] overflow-hidden shadow-2xl relative bg-slate-900 text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c0b2b] via-[#091535] to-[#040914] opacity-95" />
        <div className="absolute -top-16 -left-12 w-72 h-72 rounded-full bg-gradient-to-br from-pink-500/60 to-rose-600/40 blur-[70px]" />
        <div className="absolute top-48 -right-16 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-400/50 to-blue-600/60 blur-[85px]" />
        <div className="absolute -bottom-10 left-1/4 w-80 h-80 rounded-full bg-gradient-to-t from-violet-600/50 via-fuchsia-500/40 to-indigo-500/30 blur-[80px]" />
      </div>

      <div className="relative z-10 px-5 pt-7 pb-5 space-y-6">
        <section className="flex items-center justify-between">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11.5px] font-medium text-white/95 active:scale-95 transition-all"
            style={glassPill}
          >
            <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} />
            </svg>
            <span>Add background picture</span>
          </button>
          <button
            type="button"
            aria-label="Edit Profile"
            className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[11.5px] font-medium text-white/95 active:scale-95 transition-all"
            style={glassPill}
          >
            <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <span>Edit</span>
          </button>
        </section>

        <section className="flex flex-col items-center text-center">
          <div className="relative mb-3.5">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-indigo-400 opacity-60 blur-md" />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold" style={glassAvatarRing}>
              {user.profile_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover rounded-full" />
              ) : (
                initials(user.name)
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{user.name || 'Нэргүй хэрэглэгч'}</h1>
          {user.title && <p className="text-sm font-normal text-white/80 tracking-wide mb-2">{user.title}</p>}
          {user.company && (
            <div className="inline-flex items-center px-3.5 py-0.5 rounded-full" style={glassPill}>
              <span className="text-xs font-medium text-white/90 tracking-wide">{user.company}</span>
            </div>
          )}
        </section>

        {showQr && qrChildren && (
          <section className="flex justify-center">
            <div className="p-4 rounded-2xl" style={glassPanel}>
              {qrChildren}
            </div>
          </section>
        )}

        <section>
          <div className="text-center mb-3">
            <span className="text-[11px] font-semibold tracking-wider text-white/75 uppercase">CONNECT WITH ME ON</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            {socials.map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                aria-label={label}
                href={href || undefined}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:scale-110 active:scale-95 transition-all"
                style={glassBubble}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {rows.map((row, i) => (
            <InfoRow key={i} {...row} />
          ))}
        </section>
      </div>

      <footer className="relative z-10 px-5 pt-3 pb-7 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddContact}
            className="flex-1 py-3 px-4 rounded-2xl border border-white/50 text-white font-semibold text-[13.5px] tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
            style={{
              background: 'linear-gradient(to right, rgba(219,39,119,0.9), rgba(244,63,94,0.9), rgba(147,51,234,0.9))',
              boxShadow: '0 0 25px -4px rgba(236,72,153,0.5), inset 0 1px 2px 0 rgba(255,255,255,0.6)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" x2="20" y1="8" y2="14" />
              <line x1="23" x2="17" y1="11" y2="11" />
            </svg>
            <span>Add Contact</span>
          </button>
          <button
            type="button"
            onClick={onVcfContact}
            className="flex-1 py-3 px-4 rounded-2xl text-white font-semibold text-[13.5px] tracking-wide flex items-center justify-center gap-2 hover:bg-white/25 active:scale-[0.98] transition-all"
            style={glassPanel}
          >
            <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>VCF Contact</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.35)',
}

const glassPill: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.45)',
}

const glassBubble: React.CSSProperties = {
  background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.08))',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.4)',
}

const glassAvatarRing: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))',
  backdropFilter: 'blur(24px)',
  border: '1.5px solid rgba(255,255,255,0.55)',
}

function InfoRow({ icon: Icon, label, value, href }: RowItem) {
  const content = (
    <>
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform" style={glassBubble}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px]">{value}</span>
          <span className="text-[11px] font-medium text-white/60 tracking-wider">{label}</span>
        </div>
      </div>
      <div className="text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all pr-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </>
  )

  const classes = 'p-3.5 rounded-2xl flex items-center justify-between hover:bg-white/20 active:scale-[0.99] transition-all cursor-pointer group w-full'

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={classes} style={glassPanel}>
        {content}
      </a>
    )
  }
  return (
    <div className={classes} style={glassPanel}>
      {content}
    </div>
  )
}
