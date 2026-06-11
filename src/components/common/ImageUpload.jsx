import { useRef, useState } from 'react'
import { FiCamera, FiUpload, FiX, FiCheck } from 'react-icons/fi'
import { getToken, BASE } from '../../api/apiClient.js'

/**
 * ImageUpload — click-to-upload image component backed by Cloudinary.
 *
 * Props:
 *   value    {string}   current image URL (controlled)
 *   onChange {function} called with new URL after successful upload
 *   folder   {string}   Cloudinary folder (default: 'urbanclone')
 *   shape    {string}   'circle' | 'rect' (default: 'rect')
 *   label    {string}   helper text shown below (optional)
 *   className {string}  extra classes on the container
 */
const ImageUpload = ({
  value,
  onChange,
  folder    = 'urbanclone',
  shape     = 'rect',
  label     = 'Click to upload image',
  className = '',
}) => {
  const inputRef          = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)

  const isCircle = shape === 'circle'

  const handleFile = async (file) => {
    if (!file) return
    setError('')
    setSuccess(false)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      // Use raw fetch for multipart — apiFetch forces Content-Type: application/json
      const token = getToken()
      const res = await fetch(`${BASE}/upload`, {
        method: 'POST',
        body:   formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed')

      onChange?.(data.url)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className={`
          relative overflow-hidden cursor-pointer group border-2 border-dashed border-neutral-200
          hover:border-brand transition-all
          ${isCircle ? 'w-24 h-24 rounded-full' : 'w-full h-36 rounded-2xl'}
          ${uploading ? 'opacity-70 pointer-events-none' : ''}
        `}
      >
        {/* Current image */}
        {value ? (
          <img
            src={value}
            alt="Uploaded"
            className={`w-full h-full object-cover ${isCircle ? 'rounded-full' : 'rounded-2xl'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-neutral-50">
            <FiUpload size={22} className="text-neutral-300" />
            <span className="text-xs text-neutral-400 text-center px-3">{label}</span>
          </div>
        )}

        {/* Overlay on hover / uploading */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          bg-black/40 transition-opacity
          ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          ${isCircle ? 'rounded-full' : 'rounded-2xl'}
        `}>
          {uploading ? (
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <FiCheck size={24} className="text-white" strokeWidth={3} />
          ) : (
            <FiCamera size={24} className="text-white" />
          )}
        </div>

        {/* Clear button */}
        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange?.('') }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors z-10"
          >
            <FiX size={12} className="text-white" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      {success && <p className="text-xs text-brand font-medium">Uploaded successfully!</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

export default ImageUpload
