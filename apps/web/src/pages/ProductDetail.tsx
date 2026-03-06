import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Product } from '../lib/api'

export function ProductDetail() {
  const { id } = useParams()
  const [p, setP] = useState<Product | null>(null)
  useEffect(() => {
    // Optional for MVP; could fetch /v1/products/{id}
  }, [id])
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="opacity-80">Pagina de produs va veni curând.</div>
    </div>
  )
}

