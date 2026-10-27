import { Download, Share2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/ui/Button'
import { IconButton, Segmented } from '@/ui/controls'
import { drawCard, shareOrDownload, toBlob, type CardContent, type CardFormat } from './card'

/** "Udostępnij" button that opens a preview of the share card in two formats. */
export function ShareButton({
  content,
  label = 'Udostępnij wynik',
  variant = 'secondary',
}: {
  content: CardContent
  label?: string
  variant?: 'secondary' | 'reward' | 'primary'
}) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<CardFormat>('post')
  const [preview, setPreview] = useState<{ key: string; url: string; blob: Blob } | null>(null)
  const [status, setStatus] = useState('')
  const ref = useRef<HTMLDialogElement>(null)
  const key = `${format}|${JSON.stringify(content)}`

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    let alive = true
    let url = ''
    void drawCard(content, format)
      .then(toBlob)
      .then((blob) => {
        url = URL.createObjectURL(blob)
        if (alive) setPreview({ key, url, blob })
      })
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
    // content is captured through key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key])

  const ready = preview?.key === key ? preview : null
  const name = `leapy-${format}.png`

  return (
    <>
      <Button
        variant={variant}
        size="lg"
        block
        icon={<Share2 aria-hidden className="size-5" />}
        onClick={() => {
          setStatus('')
          setOpen(true)
        }}
      >
        {label}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby="share-title"
        onCancel={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] rounded-2xl bg-surface p-0 text-ink shadow-lg backdrop:bg-[var(--overlay)]"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id="share-title" className="text-heading text-ink">
              Karta do udostępnienia
            </h2>
            <IconButton label="Zamknij" onClick={() => setOpen(false)}>
              <X aria-hidden className="size-6" />
            </IconButton>
          </div>
          <div className="mt-3">
            <Segmented
              label="Format karty"
              value={format}
              onChange={setFormat}
              options={[
                { value: 'post', label: 'Post 4:5' },
                { value: 'story', label: 'Relacja 9:16' },
              ]}
            />
          </div>
          <div className="mt-4 grid place-items-center rounded-xl bg-sunken p-3">
            {ready ? (
              <img
                src={ready.url}
                alt={`Karta: ${content.kicker}, ${content.value}. ${content.detail}`}
                className="max-h-[46dvh] w-auto rounded-lg shadow-md"
              />
            ) : (
              <div
                aria-busy="true"
                aria-label="Rysuję kartę"
                className={format === 'post' ? 'aspect-[4/5] h-[46dvh]' : 'aspect-[9/16] h-[46dvh]'}
              />
            )}
          </div>
          <p className="mt-3 text-small text-ink-2">
            Karta powstaje na tym urządzeniu. Nic nie jest wysyłane, dopóki jej nie udostępnisz.
          </p>
          <div className="mt-4">
            <Button
              block
              size="lg"
              disabled={!ready}
              icon={<Download aria-hidden className="size-5" />}
              onClick={() =>
                ready &&
                void shareOrDownload(ready.blob, name, 'Uczę się z Leapy.').then((r) =>
                  setStatus(
                    r === 'shared'
                      ? 'Udostępniono.'
                      : r === 'downloaded'
                        ? `Zapisano plik ${name}.`
                        : '',
                  ),
                )
              }
            >
              Udostępnij lub zapisz
            </Button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-small font-bold text-ink-2">
            {status}
          </p>
        </div>
      </dialog>
    </>
  )
}
