import { Link } from 'react-router-dom'

const categories = [
  { key: 'De Bagat in Gura', color: 'from-pink-500/30 to-fuchsia-500/20', title: 'De Bagat in Gura' },
  { key: 'De F***t', color: 'from-amber-500/30 to-orange-500/20', title: 'De F***t' },
  { key: 'De Purtat', color: 'from-sky-500/30 to-cyan-500/20', title: 'De Purtat' },
  { key: 'Pentru Copii', color: 'from-green-500/30 to-emerald-500/20', title: 'Pentru Copii' },
  { key: 'De Citit', color: 'from-purple-500/30 to-violet-500/20', title: 'De Citit' },
  { key: '18+', color: 'from-red-500/30 to-rose-500/20', title: '18+' },
]

export function Landing() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ceva Bun</h1>
        <p className="opacity-80 mt-2">Descoperă ceva bun pe bugetul tău.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Link key={c.key} to={`/alege?c=${encodeURIComponent(c.key)}`} className="block">
            <div className={`glass rounded-3xl p-8 h-40 bg-gradient-to-br ${c.color} hover:scale-[1.02] transition-transform`}>
              <div className="text-xl font-semibold">{c.title}</div>
              <div className="opacity-85 mt-2">Alege un buget și îți sugerăm ceva.</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

