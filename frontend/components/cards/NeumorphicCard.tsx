'use client'

import { getRows, getSocials, initials, type CardTemplateProps, type RowItem } from './shared'

const NEU_BG = 'bg-[#e2e8f0]'
const NEU_FLAT = `${NEU_BG} shadow-[6px_6px_14px_#bec9d8,-6px_-6px_14px_#ffffff]`
const NEU_FLAT_SM = `${NEU_BG} shadow-[3px_3px_8px_#bec9d8,-3px_-3px_8px_#ffffff]`
const NEU_FLAT_LG = `${NEU_BG} shadow-[8px_8px_18px_#bec9d8,-8px_-8px_18px_#ffffff]`
const NEU_PRESSED = `${NEU_BG} shadow-[inset_4px_4px_8px_#bec9d8,inset_-4px_-4px_8px_#ffffff]`
const NEU_PRESSED_SM = `${NEU_BG} shadow-[inset_2px_2px_5px_#bec9d8,inset_-2px_-2px_5px_#ffffff]`

export default function NeumorphicCard({ user, showQr = true, qrChildren, onAddContact, onVcfContact }: CardTemplateProps) {
  const socials = getSocials(user)
  const rows = getRows(user)

  return (
    <div className={`w-full max-w-[400px] mx-auto rounded-[44px] overflow-hidden ${NEU_BG} border border-slate-300/40 shadow-2xl text-slate-700`}>
      <div className="px-6 py-5 space-y-5">
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            className={`${NEU_FLAT_SM} rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600`}
          >
            <span className="text-blue-500 text-sm font-bold leading-none">+</span>
            <span>Add background picture</span>
          </button>
          <button
            type="button"
            className={`${NEU_FLAT_SM} rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600`}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Edit</span>
          </button>
        </div>

        <section className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-4">
            <div className={`w-28 h-28 rounded-full ${NEU_FLAT_LG} flex items-center justify-center p-2.5`}>
              <div className={`w-full h-full rounded-full ${NEU_PRESSED} flex items-center justify-center relative overflow-hidden text-2xl font-bold text-slate-500`}>
                {user.profile_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profile_image} alt={user.name || ''} className="w-full h-full object-cover rounded-full" />
                ) : (
                  initials(user.name)
                )}
              </div>
            </div>
            <span className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#e2e8f0] shadow-sm" title="Active" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-0.5">{user.name || 'Нэргүй хэрэглэгч'}</h1>
          {user.title && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{user.title}</p>}
          {user.company && (
            <div className={`${NEU_FLAT_SM} rounded-full px-3.5 py-1 inline-flex items-center gap-1.5`}>
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-xs font-medium text-slate-600">{user.company}</span>
            </div>
          )}
        </section>

        {showQr && qrChildren && (
          <section className="flex justify-center">
            <div className={`${NEU_PRESSED} p-4 rounded-2xl`}>{qrChildren}</div>
          </section>
        )}

        <section className="pt-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex-1 h-px border-t border-slate-300/60" style={{ boxShadow: '0 1px 0 0 #ffffff' }} />
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase whitespace-nowrap">
              Connect With Me On
            </span>
            <div className="flex-1 h-px border-t border-slate-300/60" style={{ boxShadow: '0 1px 0 0 #ffffff' }} />
          </div>
          <div className="flex justify-between items-center px-3">
            {socials.map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                href={href || undefined}
                aria-label={label}
                className={`w-13 h-13 p-3 rounded-full ${NEU_FLAT_SM} flex items-center justify-center group active:scale-[0.98] transition-transform`}
              >
                <Icon className="w-5 h-5 text-slate-600 transition-colors" />
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3.5 pt-1">
          {rows.map((row, i) => (
            <InfoRow key={i} {...row} />
          ))}
        </section>
      </div>

      <footer className="p-6 pt-3 pb-7 space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={onAddContact}
            className="bg-gradient-to-br from-[#3f88fc] to-[#3575dd] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs tracking-wide shadow-[5px_5px_14px_#a9b8cc,-4px_-4px_12px_#ffffff] active:scale-[0.98] transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
            <span>Add Contact</span>
          </button>
          <button
            type="button"
            onClick={onVcfContact}
            className={`${NEU_FLAT} text-slate-700 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs tracking-wide border border-white/40 active:scale-[0.98] transition-transform`}
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
            <span>VCF Contact</span>
          </button>
        </div>
        <div className={`w-32 h-1 ${NEU_PRESSED} mx-auto rounded-full opacity-75 mt-2`} />
      </footer>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href }: RowItem) {
  const content = (
    <>
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${NEU_PRESSED_SM} flex items-center justify-center shrink-0 text-slate-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left truncate">
          <h2 className="text-sm font-bold text-slate-800 leading-tight truncate">{value}</h2>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</span>
        </div>
      </div>
      <div className="pr-1 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
      </div>
    </>
  )

  const classes = `w-full ${NEU_FLAT} rounded-2xl p-3 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-transform`

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }
  return <div className={classes}>{content}</div>
}
