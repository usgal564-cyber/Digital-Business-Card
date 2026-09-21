'use client'

import { getRows, getSocials, initials, type CardTemplateProps, type RowItem } from './shared'

export default function AbstractCard({ user, showQr = true, qrChildren, onAddContact, onVcfContact }: CardTemplateProps) {
  const socials = getSocials(user)
  const rows = getRows(user)

  return (
    <div
      className="w-full max-w-[420px] mx-auto rounded-[44px] shadow-2xl relative overflow-hidden text-stone-800"
      style={{
        backgroundColor: '#FAF5EE',
        backgroundImage:
          'radial-gradient(circle at 15% 15%, rgba(255,138,101,0.45) 0%, transparent 45%), radial-gradient(circle at 85% 25%, rgba(255,184,0,0.35) 0%, transparent 40%), radial-gradient(circle at 50% 65%, rgba(112,72,232,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 85%, rgba(200,90,50,0.25) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(32,201,151,0.15) 0%, transparent 45%)',
      }}
    >
      <div aria-hidden className="absolute -top-14 -left-14 w-48 h-48 rounded-full bg-gradient-to-br from-orange-300/50 to-red-400/30 blur-2xl pointer-events-none" />
      <div aria-hidden className="absolute top-1/3 -right-16 w-52 h-52 rounded-full bg-gradient-to-tl from-violet-500/20 via-amber-400/25 to-transparent blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-red-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 px-5 pt-7 pb-4">
        <header className="flex items-center justify-between mb-5">
          <button
            type="button"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-900/10 text-xs font-medium text-stone-700"
            style={pillBadge}
          >
            <span className="text-sm leading-none font-bold text-orange-600">+</span>
            <span>Add background picture</span>
          </button>
          <button
            type="button"
            aria-label="Edit Card"
            className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 shadow-sm border border-stone-200/80 text-xs font-semibold text-stone-800 active:scale-95 transition-all"
          >
            <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="tracking-wider">Edit</span>
          </button>
        </header>

        <section className="flex flex-col items-center text-center mt-1 mb-5">
          <div className="relative mb-3.5">
            <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-orange-400 via-amber-400 to-violet-500 opacity-60 blur-sm" />
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-br from-orange-300 via-white to-orange-600 shadow-lg relative flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden border border-stone-100 text-2xl font-extrabold text-stone-700">
                {user.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover rounded-full relative z-10" />
                ) : (
                  <span className="relative z-10">{initials(user.name)}</span>
                )}
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-orange-50/90 -z-0" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-600 border-2 border-white flex items-center justify-center shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-1" style={{ fontFamily: '"Syne", sans-serif' }}>
            {user.name || 'Нэргүй хэрэглэгч'}
          </h1>
          {user.title && (
            <p className="text-xs uppercase font-semibold tracking-[0.25em] text-stone-600 mb-2.5">{user.title}</p>
          )}
          {user.company && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-stone-200/90 text-xs font-medium text-stone-700" style={pillBadge}>
              <span className="w-2 h-2 rounded-sm bg-gradient-to-tr from-orange-300 to-orange-600 rotate-45" />
              <span className="font-medium tracking-wide">{user.company}</span>
            </div>
          )}
        </section>

        {showQr && qrChildren && (
          <div className="flex justify-center mb-5">
            <div className="p-4 rounded-2xl" style={glassCard}>
              {qrChildren}
            </div>
          </div>
        )}

        <section className="w-full mb-5">
          <div className="flex items-center justify-center gap-3 mb-3.5">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-stone-400" />
            <p className="text-[10px] font-bold tracking-[0.22em] text-stone-500 uppercase">CONNECT WITH ME ON</p>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-stone-400" />
          </div>
          <div className="grid grid-cols-4 gap-2.5 px-1">
            {socials.map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                aria-label={label}
                href={href || undefined}
                className="group relative flex flex-col items-center justify-center h-12 rounded-2xl bg-white/80 border border-stone-200/80 shadow-sm transition-all duration-200 active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center transition-colors duration-200">
                  <Icon className="w-4 h-4 text-orange-700" />
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          {rows.map((row, i) => (
            <InfoRow key={i} {...row} />
          ))}
        </section>
      </div>

      <footer className="relative z-20 p-4 pt-3 bg-gradient-to-t from-[#FAF5EE] via-[#FAF5EE]/95 to-transparent">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            type="button"
            onClick={onAddContact}
            className="group relative flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-semibold text-xs tracking-wider shadow-lg active:scale-95 transition-all duration-150 overflow-hidden"
            style={{ background: 'linear-gradient(to right, #C85A32, #FF5733, #FF8A65)' }}
          >
            <svg className="w-4 h-4 shrink-0 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="relative z-10 whitespace-nowrap">Add Contact</span>
          </button>
          <button
            type="button"
            onClick={onVcfContact}
            className="group flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/90 border border-orange-700/30 text-orange-700 font-semibold text-xs tracking-wider shadow-sm active:scale-95 transition-all duration-150"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="whitespace-nowrap">VCF Contact</span>
          </button>
        </div>
      </footer>
    </div>
  )
}

const pillBadge: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,243,235,0.8))',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,1), 0 2px 6px rgba(0,0,0,0.04)',
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 10px 30px -10px rgba(199,87,49,0.08), 0 4px 12px rgba(0,0,0,0.03)',
}

function InfoRow({ icon: Icon, label, value, href }: RowItem) {
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-100 to-orange-100 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
          <Icon className="w-5 h-5 text-orange-700" />
        </div>
        <div className="truncate text-left">
          <span className="block text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-snug truncate" style={{ fontFamily: '"Syne", sans-serif' }}>
            {value}
          </span>
          <span className="block text-[11px] font-semibold tracking-wider text-stone-400 uppercase">{label}</span>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-stone-100/70 flex items-center justify-center text-stone-400 group-hover:text-orange-700 group-hover:bg-amber-100/50 group-hover:translate-x-0.5 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  )

  const classes = 'group flex items-center justify-between p-3.5 rounded-2xl hover:bg-white hover:border-orange-300/50 transition-all duration-200 active:scale-[0.99] w-full'

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={classes} style={glassCard}>
        {content}
      </a>
    )
  }
  return (
    <div className={classes} style={glassCard}>
      {content}
    </div>
  )
}
