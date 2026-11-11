import { useState } from 'react'

interface ImagenProductoProps {
  src: string | null
  alt: string
  className?: string
}

/** Imagen con respaldo: si la URL falta o no carga, muestra la inicial del producto. */
export function ImagenProducto({ src, alt, className = '' }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false)
  if (!src || fallo) {
    return (
      <div className={`flex items-center justify-center bg-albahaca-100 font-display text-3xl font-extrabold text-albahaca-600 ${className}`} aria-hidden>
        {alt.charAt(0)}
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFallo(true)} className={`bg-albahaca-100 object-cover ${className}`} />
}
