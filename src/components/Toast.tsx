import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface ToastMessage {
  id: string
  text: string
  duration?: number
}

interface ToastContextType {
  show: (text: string, duration?: number) => void
  toasts: ToastMessage[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = useCallback((text: string, duration = 2000) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, text, duration }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ show, toasts }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-in bg-surface-raised border border-line rounded-lg px-4 py-3 text-sm font-medium text-fg shadow-lg pointer-events-auto"
        >
          {toast.text}
        </div>
      ))}
    </div>
  )
}
