'use client'

import { getRows, getSocials, initials, type CardTemplateProps, type RowItem } from './shared'

export default function CyberCard({ user, showQr = true, qrChildren, onAddContact, onVcfContact }: CardTemplateProps) {
  const socials = getSocials(user)
  const rows = getRows(user)

  return (
    <div
      className="w-full max-w-[400px] mx-auto rounded-[44px] overflow-hidden shadow-2xl relative text-slate-800"
      style={{
        background:
          'radial-gradient(circle at 80% 10%, rgba(244,114,182,0.35) 0%, transparent 45%), radial-gradient(circle at 15% 35%, rgba(56,189,248,0.35) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(192,132,252,0.35) 0%, transparent 50%), radial-gradient(circle at 20% 90%, rgba(56,189,248,0.25) 0%, transparent 45%), linear-gradient(160deg, #dbeafe 0%, #f3e8ff 45%, #fed7aa 80%, #fbcfe8 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 px-5 pt-7 pb-2 flex items-center justify-between gap-3">
        <button
          type="button"
          className="chrome-pod px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-slate-700 tracking-wide active:scale-95 transition-all"
          style={pod}
        >
          <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span className="bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent uppercase tracking-wider text-[11px] font-bold">
            Add BG Art
          </span>
        </button>
        <button
          type="button"
          className="px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-700 tracking-wide active:scale-95 transition-all"
          style={pod}
        >
          <svg className="w-3.5 h-3.5 text-fuchsia-500" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span className="bg-gradient-to-r from-indigo-900 to-pink-600 bg-clip-text text-transparent uppercase tracking-wider text-[11px] font-bold">
            Edit
          </span>
        </button>
      </div>

      <main className="relative z-10 px-5 pb-4">
        <div className="flex flex-col items-center mt-3 text-center">
          <div className="relative">
            <svg
              className="absolute -top-3 -right-3 w-8 h-8 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
            </svg>
            <svg
              className="absolute -bottom-1 -left-3 w-6 h-6 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.7)]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
            </svg>
            <div className="w-28 h-28 rounded-full p-[3.5px] bg-gradient-to-tr from-cyan-400 via-white to-fuchsia-400 shadow-[0_10px_28px_rgba(56,189,248,0.45),inset_0_2px_4px_#ffffff]">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-white/90 to-blue-50/70 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/80 relative text-2xl font-black text-slate-600/80">
                {user.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover rounded-full" />
                ) : (
                  initials(user.name)
                )}
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-[0_0_8px_#34d399] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <div className="mt-3.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: '"Syne", sans-serif' }}>
                {user.name || 'Нэргүй хэрэглэгч'}
              </h1>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
                </svg>
              </span>
            </div>
            {user.title && (
              <p className="text-xs uppercase tracking-[0.22em] font-semibold text-slate-600 mt-1">{user.title}</p>
            )}
            {user.company && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/50 border border-white/80 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-950/80">{user.company}</span>
              </div>
            )}
          </div>
        </div>

        {showQr && qrChildren && (
          <div className="flex justify-center mt-5">
            <div className="chrome-pod p-4 rounded-2xl" style={pod}>
              {qrChildren}
            </div>
          </div>
        )}

        <section className="mt-6">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-700/90 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-pink-500 rounded-sm rotate-45" />
              Connect With Me On
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 border border-white text-indigo-900">
              {socials.length} Channels
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {socials.map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                aria-label={label}
                href={href || undefined}
                className="h-13 py-2.5 rounded-2xl flex items-center justify-center text-slate-700 group"
                style={bubble}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              </a>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-2.5">
          {rows.map((row, i) => (
            <InfoRow key={i} {...row} />
          ))}
        </section>
      </main>

      <footer className="relative z-10 px-5 pt-3 pb-8 bg-gradient-to-t from-white/70 via-white/30 to-transparent backdrop-blur-[2px]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onAddContact}
            className="h-12 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-sm tracking-wider active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(180deg, #67e8f9 0%, #38bdf8 38%, #6366f1 78%, #a855f7 100%)',
              boxShadow:
                'inset 0 2px 3px rgba(255,255,255,0.8), inset 0 -3px 5px rgba(15,23,42,0.4), 0 8px 20px -3px rgba(56,189,248,0.5), 0 4px 6px -2px rgba(99,102,241,0.35)',
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
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
            className="h-12 rounded-2xl flex items-center justify-center gap-2 text-slate-800 font-bold text-sm tracking-wider active:scale-[0.97] transition-transform"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,245,255,0.5) 100%)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.95), 0 6px 18px rgba(147,197,253,0.28)',
            }}
          >
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span className="bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">VCF Contact</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

const pod: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(224,237,255,0.45) 45%, rgba(240,225,255,0.55) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 8px 32px 0 rgba(99,102,241,0.12), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(168,85,247,0.15)',
}

const bubble: React.CSSProperties = {
  background: 'linear-gradient(145deg, #ffffff 0%, #e0f2fe 40%, #bae6fd 80%, #ddd6fe 100%)',
  border: '1.5px solid rgba(255,255,255,0.9)',
  boxShadow: 'inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(99,102,241,0.25), 0 6px 14px rgba(125,211,252,0.35)',
}

function InfoRow({ icon: Icon, label, value, href }: RowItem) {
  const content = (
    <>
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400/20 via-cyan-200/40 to-white/90 border border-white shadow-inner flex items-center justify-center text-sky-600 group-hover:rotate-6 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-slate-900 tracking-wide text-sm truncate max-w-[200px]">{value}</div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</div>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-white/60 border border-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </>
  )

  const classes = 'p-3 rounded-2xl flex items-center justify-between group hover:scale-[1.01] transition-transform duration-200 w-full'

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={classes} style={pod}>
        {content}
      </a>
    )
  }
  return (
    <div className={classes} style={pod}>
      {content}
    </div>
  )
}
