import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRandomProduct } from '../lib/api'
import { ProductCard } from '../components/ProductCard'

export function ChooseBudget() {
  const [sp] = useSearchParams()
  const category = sp.get('c') || ''
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(15000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)
  const nav = useNavigate()

  useEffect(() => {
    if (!category) nav('/')
  }, [category, nav])

  const disabled = useMemo(() => min >= max, [min, max])

  const spin = async () => {
    setError(null)
    setLoading(true)
    try {
      const p = await getRandomProduct({ category, min_price: min, max_price: max })
      setProduct(p)
    } catch (e: any) {
      setProduct(null)
      setError('N-am găsit nimic pe bugetul ăsta 😕')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button className="text-sm opacity-80 hover:opacity-100" onClick={() => nav(-1)}>← Înapoi</button>
      <h2 className="text-3xl font-bold mt-6">{category || 'Alege categorie'}</h2>
      <div className="glass rounded-3xl p-6 mt-6">
        <div className="flex gap-6 items-center">
          <div className="flex-1">
            <label className="block text-sm mb-1">Buget minim (RON)</label>
            <input type="range" min={0} max={20000} step={500} value={min} onChange={e => setMin(parseInt(e.target.value))} className="w-full" />
            <div className="text-sm opacity-80 mt-1">{(min/100).toFixed(0)} lei</div>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Buget maxim (RON)</label>
            <input type="range" min={0} max={20000} step={500} value={max} onChange={e => setMax(parseInt(e.target.value))} className="w-full" />
            <div className="text-sm opacity-80 mt-1">{(max/100).toFixed(0)} lei</div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button disabled={disabled || loading} onClick={spin} className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-50">Găsește ceva bun</button>
          <button onClick={() => nav(`/toate?c=${encodeURIComponent(category)}&min=${min}&max=${max}`)} className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10">Vezi toate bunăciunile</button>
        </div>
      </div>

      <div className="mt-8">
        {loading && <div className="opacity-80">Se încarcă...</div>}
        {error && <div className="text-rose-300">{error}</div>}
        {product && <ProductCard p={product} />}
      </div>
    </div>
  )
}

