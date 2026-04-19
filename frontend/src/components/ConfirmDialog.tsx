import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  warning?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, warning, onConfirm, onCancel }: ConfirmDialogProps) {
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    setVisible(open)
  }, [open])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        {warning && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700">{warning}</p>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm()
              onCancel()
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            确认移除
          </button>
        </div>
      </div>
    </div>
  )
}
