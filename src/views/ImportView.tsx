import { AlertCircle, CheckCircle2, FileSpreadsheet, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { kindLabel } from '../lib/amazon/detect'
import { Card, Spinner } from '../components/ui'
import { useStore } from '../state/store'

const STEPS = [
  ['Open Amazon → Account → Data and Privacy', 'Request your data ("Your Orders" is enough).'],
  ['Wait for the e-mail', 'Amazon usually delivers the archive within a few hours.'],
  ['Drop the ZIP below', 'Or unzip it and drop the CSV files — both work.'],
]

export function ImportView() {
  const { importFiles, loadDemo, busy, error, dataset, hasData } = useStore()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) void importFiles(files)
  }

  return (
    <div className="mx-auto grid grid-cols-1 max-w-4xl gap-4">
      <Card>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition"
          style={{
            borderColor: dragging ? 'var(--color-accent)' : 'var(--color-line)',
            background: dragging ? 'var(--color-accent-soft)' : 'transparent',
          }}
        >
          <Upload className="size-8 text-[var(--color-accent)]" />
          <div>
            <p className="text-base font-semibold">Drop your Amazon export here</p>
            <p className="muted mt-1 text-sm">
              <code>Your Orders.zip</code>, <code>Order History.csv</code> or any of the CSVs inside the archive.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={!!busy}>
              <FileSpreadsheet className="size-4" />
              Choose files
            </button>
            <button type="button" className="btn" onClick={() => void loadDemo()} disabled={!!busy}>
              <Sparkles className="size-4" />
              Try with sample data
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,.zip"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              if (files.length) void importFiles(files)
              e.target.value = ''
            }}
          />
          {busy && <Spinner label={busy} />}
        </div>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <p className="muted mt-4 flex items-start gap-2 text-xs">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          Everything is parsed in your browser. No upload, no server, no analytics — the files never leave this
          device. Reload-safe storage uses your browser&apos;s IndexedDB and can be wiped in Settings.
        </p>
      </Card>

      {hasData && dataset.sources.length > 0 && (
        <Card title="Imported files" subtitle="Detected by column layout, not by file name.">
          <ul className="grid grid-cols-1 gap-2">
            {dataset.sources.map((s, idx) => (
              <li
                key={`${s.file}-${idx}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-line)' }}
              >
                <span className="flex items-center gap-2">
                  {s.kind === 'unknown' ? (
                    <AlertCircle className="size-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  )}
                  <span className="font-medium">{s.file}</span>
                </span>
                <span className="muted text-xs">
                  {kindLabel[s.kind]} · {s.rows.toLocaleString()} rows
                  {s.skipped > 0 && ` · ${s.skipped} skipped`}
                  {s.notes.length > 0 && ` · ${s.notes.join(' ')}`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="How to get your data">
        <ol className="grid grid-cols-1 gap-3">
          {STEPS.map(([title, hint], idx) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-white">
                {idx + 1}
              </span>
              <span>
                <span className="block text-sm font-medium">{title}</span>
                <span className="muted block text-xs">{hint}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="muted mt-4 text-xs">
          Supported layouts: <code>Order History.csv</code>, <code>Retail.OrderHistory.*.csv</code>, the legacy order
          history report, <code>Digital Content Orders.csv</code>, <code>Refund Details.csv</code>,{' '}
          <code>Return Requests.csv</code> and <code>Cart History.csv</code>.
        </p>
      </Card>
    </div>
  )
}
