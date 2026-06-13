import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onClose?.()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  const bg = type === 'error' ? 'bg-red-500/80' : 'bg-emerald-500/80'

  return (
    <div className={`toast fixed top-5 right-5 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-2xl backdrop-blur-md ${bg} text-white border border-white/20`}>
      {message}
    </div>
  )
}