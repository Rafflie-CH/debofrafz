import { useState, useRef } from 'react'
import Toast from '@/components/Toast'
import Watermark from '@/components/Watermark'

export default function Home() {
  const [code, setCode] = useState('')
  const [mode, setMode] = useState('obf-basic')
  const [customString, setCustomString] = useState('Nantibisadiubah')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.js')) {
      showToast('Hanya file .js yang diizinkan', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setCode(ev.target.result)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.js')) {
      const reader = new FileReader()
      reader.onload = (ev) => setCode(ev.target.result)
      reader.readAsText(file)
    } else {
      showToast('Hanya file .js', 'error')
    }
  }

  const handleProcess = async () => {
    if (!code.trim()) return showToast('Masukkan kode atau upload file', 'error')
    setLoading(true)
    try {
      const isObf = mode.startsWith('obf')
      const endpoint = isObf ? '/api/obfuscate' : '/api/deobfuscate'
      const subMode = mode.includes('hard') ? 'hard' : 'basic'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          mode: subMode,
          customString: mode === 'obf-hard' ? customString : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setOutput(data.result)
        showToast(`${isObf ? 'Obfuscate' : 'Deobfuscate'} berhasil!`)
      } else {
        showToast(data.error || 'Terjadi kesalahan', 'error')
      }
    } catch (err) {
      showToast('Gagal terhubung ke server', 'error')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    showToast('Tersalin ke clipboard!')
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `processed_${Date.now()}.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('File diunduh!')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background animation */}
      <div className="bg-animate" />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Main Card */}
      <div className="glass rgb-glow w-full max-w-4xl p-6 sm:p-8 relative z-10 transition-all duration-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          JS Obfuscator & Deobfuscator
        </h1>
        <p className="text-center text-sm text-cyan-200/70 mt-2">
          Encrypt / Decrypt kode JavaScript ala pro
        </p>

        {/* Mode Selector */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['obf-basic', 'Obfuscate Basic'],
            ['obf-hard', 'Obfuscate Hard'],
            ['deobf-basic', 'Deobfuscate Basic'],
            ['deobf-hard', 'Deobfuscate Hard'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setMode(val)}
              className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                mode === val
                  ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom string input for obf hard */}
        {mode === 'obf-hard' && (
          <div className="mt-5">
            <label className="text-xs text-cyan-300/80 mb-1 block">Custom Identifier</label>
            <input
              type="text"
              value={customString}
              onChange={(e) => setCustomString(e.target.value)}
              placeholder="contoh: rafz"
              className="w-full bg-black/40 border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 backdrop-blur-sm"
            />
          </div>
        )}

        {/* Upload area */}
        <div
          className="mt-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div
            className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 text-center cursor-pointer hover:border-cyan-300 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".js"
              ref={fileInputRef}
              onChange={handleFile}
              className="hidden"
            />
            <p className="text-cyan-200/70 text-sm">
              📁 Drop file .js di sini atau klik untuk upload
            </p>
          </div>
        </div>

        {/* Code Editor */}
        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// tempel atau tulis kode JavaScript di sini..."
          className="w-full mt-6 bg-black/50 border border-cyan-500/30 rounded-2xl p-5 text-sm font-mono text-cyan-100 placeholder-cyan-600/50 focus:outline-none focus:border-cyan-400 resize-y backdrop-blur-md"
        />

        {/* Proses Button */}
        <button
          onClick={handleProcess}
          disabled={loading}
          className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-2xl shadow-cyan-700/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            '⚡ Proses'
          )}
        </button>

        {/* Output Area */}
        {output && (
          <div className="mt-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-cyan-300/80 font-semibold">Hasil</span>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg border border-white/10 transition"
                >
                  📋 Salin
                </button>
                <button
                  onClick={downloadFile}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg border border-white/10 transition"
                >
                  ⬇ Download
                </button>
              </div>
            </div>
            <pre className="bg-black/60 border border-cyan-500/20 rounded-2xl p-5 text-xs sm:text-sm font-mono text-green-300 max-h-96 overflow-auto whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>
        )}
      </div>

      <Watermark />
    </div>
  )
}