import { CameraPlusIcon, StarIcon, XIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const MAX_PHOTOS = 5

/**
 * Downscales a photo in the browser so the demo db (localStorage) stays small.
 * With the real API this becomes a multipart upload to Laravel storage instead.
 */
function toDataUrl(file: File, maxSize = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable image'))
    }
    img.src = url
  })
}

export function PhotoPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (photos: string[]) => void
}) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const add = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const room = MAX_PHOTOS - value.length
    const picked = [...files].filter((f) => f.type.startsWith('image/')).slice(0, room)
    const urls = await Promise.all(picked.map((f) => toDataUrl(f).catch(() => null)))
    onChange([...value, ...urls.filter((u): u is string => !!u)])
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">{t('seller.photos')}</p>
        <p className="text-xs text-muted">
          {value.length}/{MAX_PHOTOS} · {t('seller.photosHint')}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {value.map((src, i) => (
          <div
            key={src.slice(-32) + i}
            className="group relative aspect-square overflow-hidden rounded-xl border-2 border-ink"
          >
            <img src={src} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full border-2 border-ink bg-lime px-1.5 text-[10px] font-extrabold text-ink">
                <StarIcon weight="fill" /> {t('seller.cover')}
              </span>
            )}
            <button
              type="button"
              aria-label={t('seller.removePhoto')}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full border-2 border-ink bg-white text-ink opacity-0 transition group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            >
              <XIcon weight="bold" className="size-3" />
            </button>
          </div>
        ))}
        {value.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void add(e.dataTransfer.files)
            }}
            className="grid-paper flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink/40 text-xs font-bold text-muted transition hover:border-ink hover:text-foreground disabled:opacity-50"
          >
            <CameraPlusIcon weight="duotone" className="size-7" />
            {busy ? t('common.loading') : t('seller.addPhoto')}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void add(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
