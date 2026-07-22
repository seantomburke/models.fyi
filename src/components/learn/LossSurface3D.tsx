import { useEffect, useMemo, useRef, useState } from 'react'
import {
  descendSurface,
  interpolateSurfaceColor,
  projectPoint,
  sampleGradientVectors,
  sampleSurface,
  seededValue,
} from './lossLandscape'

const GRID = sampleSurface()
const VECTORS = sampleGradientVectors(GRID)
const SURFACE_LOSSES = GRID.flat().map((point) => point.z)
const SURFACE_MIN = Math.min(...SURFACE_LOSSES)
const SURFACE_MAX = Math.max(...SURFACE_LOSSES)
const DEFAULT_YAW = -0.72
const DEFAULT_PITCH = 0.68
const SURFACE_STEPS = 42

function readColor(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

function hexChannels(
  color: string,
  fallback: readonly [number, number, number]
): [number, number, number] {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color)
  if (!match) return [...fallback]
  return [
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16),
  ]
}

export function LossSurface3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [yaw, setYaw] = useState(DEFAULT_YAW)
  const [pitch, setPitch] = useState(DEFAULT_PITCH)
  const [size, setSize] = useState({ width: 640, height: 390 })
  const [themeVersion, setThemeVersion] = useState(0)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
  const [seedText, setSeedText] = useState('17')
  const [start, setStart] = useState({ x: 2.8, y: 2.5 })
  const [learningRate, setLearningRate] = useState(0.11)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [seedError, setSeedError] = useState('')
  const path = useMemo(
    () => descendSurface(start, SURFACE_STEPS, learningRate),
    [learningRate, start]
  )
  const currentPoint = path[step]

  const summary = useMemo(
    () =>
      `The small arrows show the local downhill direction. At step ${step}, the path is at loss ${currentPoint.z.toFixed(2)} near x ${currentPoint.x.toFixed(2)}, y ${currentPoint.y.toFixed(2)}.`,
    [currentPoint, step]
  )

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setStep((value) => {
        if (value >= SURFACE_STEPS) {
          setPlaying(false)
          return SURFACE_STEPS
        }
        return value + 1
      })
    }, 75)
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(([entry]) => {
            const width = Math.max(320, Math.round(entry.contentRect.width))
            setSize({ width, height: Math.round(width * 0.61) })
          })
    observer?.observe(canvas)
    return () => observer?.disconnect()
  }, [])

  useEffect(() => {
    if (typeof MutationObserver === 'undefined') return
    const observer = new MutationObserver(() => setThemeVersion((version) => version + 1))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let context: CanvasRenderingContext2D | null = null
    try {
      context = canvas.getContext('2d')
    } catch {
      return
    }
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(size.width * dpr)
    canvas.height = Math.round(size.height * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.clearRect(0, 0, size.width, size.height)
    context.translate(size.width / 2, size.height * 0.58)

    const scale = Math.min(size.width / 14, size.height / 8.5)
    const projected = GRID.map((row) => row.map((point) => projectPoint(point, yaw, pitch, scale)))
    const cells: Array<{ points: ReturnType<typeof projectPoint>[]; depth: number; loss: number }> = []
    for (let row = 0; row < GRID.length - 1; row++) {
      for (let column = 0; column < GRID[row].length - 1; column++) {
        const points = [
          projected[row][column],
          projected[row][column + 1],
          projected[row + 1][column + 1],
          projected[row + 1][column],
        ]
        const originals = [
          GRID[row][column],
          GRID[row][column + 1],
          GRID[row + 1][column + 1],
          GRID[row + 1][column],
        ]
        cells.push({
          points,
          depth: points.reduce((sum, point) => sum + point.depth, 0) / points.length,
          loss: originals.reduce((sum, point) => sum + point.z, 0) / originals.length,
        })
      }
    }
    cells.sort((a, b) => a.depth - b.depth)

    const accent = readColor('--color-accent', '#0d9488')
    const line = readColor('--color-line-strong', 'rgba(28,25,23,.16)')
    const vectorColor = readColor('--color-fg-muted', '#78716c')
    const surfaceLow = hexChannels(readColor('--color-accent-soft', '#f0fdfa'), [240, 253, 250])
    const surfaceHigh = hexChannels(accent, [13, 148, 136])
    for (const cell of cells) {
      const heat = (cell.loss - SURFACE_MIN) / (SURFACE_MAX - SURFACE_MIN)
      context.beginPath()
      context.moveTo(cell.points[0].x, cell.points[0].y)
      for (let index = 1; index < cell.points.length; index++) {
        context.lineTo(cell.points[index].x, cell.points[index].y)
      }
      context.closePath()
      context.globalAlpha = 0.38 + heat * 0.5
      context.fillStyle = interpolateSurfaceColor(heat, surfaceLow, surfaceHigh)
      context.fill()
      context.globalAlpha = 0.55
      context.strokeStyle = line
      context.lineWidth = 0.7
      context.stroke()
    }

    context.globalAlpha = 0.72
    context.strokeStyle = vectorColor
    context.fillStyle = vectorColor
    context.lineWidth = 1.25
    for (const vector of VECTORS) {
      const start = projectPoint(vector.start, yaw, pitch, scale)
      const end = projectPoint(vector.end, yaw, pitch, scale)
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      context.beginPath()
      context.moveTo(start.x, start.y)
      context.lineTo(end.x, end.y)
      context.stroke()
      context.beginPath()
      context.moveTo(end.x, end.y)
      context.lineTo(end.x - Math.cos(angle - 0.55) * 4, end.y - Math.sin(angle - 0.55) * 4)
      context.lineTo(end.x - Math.cos(angle + 0.55) * 4, end.y - Math.sin(angle + 0.55) * 4)
      context.closePath()
      context.fill()
    }

    const projectedPath = path.slice(0, step + 1).map((point) => projectPoint(point, yaw, pitch, scale))
    context.globalAlpha = 1
    context.strokeStyle = accent
    context.lineWidth = 3
    context.beginPath()
    projectedPath.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    })
    context.stroke()
    const end = projectedPath[projectedPath.length - 1]
    context.fillStyle = accent
    context.beginPath()
    context.arc(end.x, end.y, 5, 0, Math.PI * 2)
    context.fill()
  }, [path, pitch, size, step, themeVersion, yaw])

  const rotate = (yawDelta: number, pitchDelta: number) => {
    setYaw((value) => value + yawDelta)
    setPitch((value) => Math.min(1.25, Math.max(0.2, value + pitchDelta)))
  }

  const resetView = () => {
    setYaw(DEFAULT_YAW)
    setPitch(DEFAULT_PITCH)
  }

  const chooseSeededStart = () => {
    const seed = Number(seedText)
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
      setSeedError('Enter a whole-number seed from 0 to 4,294,967,295.')
      return
    }
    setStart({
      x: seededValue(seed, -3, 3),
      y: seededValue((seed ^ 0x9e3779b9) >>> 0, -3, 3),
    })
    setStep(0)
    setPlaying(false)
    setSeedError('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => rotate(-0.12, 0),
      ArrowRight: () => rotate(0.12, 0),
      ArrowUp: () => rotate(0, 0.1),
      ArrowDown: () => rotate(0, -0.1),
      Home: resetView,
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <section className="rounded-lg border border-line p-4" aria-labelledby="loss-surface-title">
      <h2 id="loss-surface-title" className="text-lg font-semibold tracking-tight">
        Two weights make a surface
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
        Height and color both encode loss. The small arrows point down the local slope, while the
        teal path connects the steps training takes. Pick a starting point, then start the descent;
        Doodle-64 follows this rule across 65 dimensions.
      </p>
      <canvas
        ref={canvasRef}
        width={640}
        height={390}
        tabIndex={0}
        role="img"
        aria-label={`Projected loss surface with a continuous low-to-high loss color scale and gradient vectors. ${summary} Use arrow keys to rotate and Home to reset the view.`}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          setDragStart({ x: event.clientX, y: event.clientY, yaw, pitch })
        }}
        onPointerMove={(event) => {
          if (!dragStart) return
          setYaw(dragStart.yaw + (event.clientX - dragStart.x) * 0.01)
          setPitch(Math.min(1.25, Math.max(0.2, dragStart.pitch - (event.clientY - dragStart.y) * 0.01)))
        }}
        onPointerUp={() => setDragStart(null)}
        onPointerCancel={() => setDragStart(null)}
        className="mt-4 aspect-[640/390] w-full touch-none rounded bg-surface-raised"
      >
        Projected loss surface. {summary}
      </canvas>
      <p className="mt-3 text-sm text-fg-secondary">{summary}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">
          Surface random seed
          <input
            type="number"
            min="0"
            max="4294967295"
            step="1"
            value={seedText}
            onChange={(event) => setSeedText(event.target.value)}
            className="mt-1 block w-44 rounded border border-line bg-surface-raised px-3 py-2 font-mono tabular-nums"
          />
        </label>
        <button type="button" onClick={chooseSeededStart} className="rounded border border-line bg-surface-raised px-3 py-2 text-sm font-medium hover:border-line-strong">
          Choose seeded start
        </button>
        <button type="button" onClick={() => { setStep(0); setPlaying(true) }} className="rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-deep">
          {playing ? 'Training…' : 'Start training'}
        </button>
      </div>
      {seedError && <p className="mt-2 text-sm text-seg-3" role="alert">{seedError}</p>}
      <label className="mt-3 block text-xs text-fg-muted">
        Learning rate: <span className="font-mono tabular-nums">{learningRate.toFixed(2)}</span>
        <input
          type="range"
          min="0.03"
          max="0.8"
          step="0.01"
          value={learningRate}
          aria-label="Surface learning rate"
          onChange={(event) => { setLearningRate(Number(event.target.value)); setStep(0); setPlaying(false) }}
          className="mt-1 w-full accent-[var(--color-accent)]"
        />
      </label>
      <p className="mt-2 text-xs text-fg-muted" role="status">
        Step {step} of {SURFACE_STEPS}: loss {currentPoint.z.toFixed(2)}. A different seed can lead into a different basin.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Rotate loss surface">
        <button type="button" onClick={() => rotate(-0.12, 0)} className="rounded border border-line px-3 py-2 text-sm hover:border-line-strong">
          Rotate left
        </button>
        <button type="button" onClick={() => rotate(0.12, 0)} className="rounded border border-line px-3 py-2 text-sm hover:border-line-strong">
          Rotate right
        </button>
        <button type="button" onClick={resetView} className="rounded border border-line px-3 py-2 text-sm hover:border-line-strong">
          Reset view
        </button>
      </div>
    </section>
  )
}
