// Gradient Text Reveal
// A scroll-driven, character-level color animation for Framer.
// Each character sweeps through a 5-stop gradient palette in sync with scroll.

import { addPropertyControls, ControlType } from "framer"
import {
    useRef,
    useEffect,
    useMemo,
    useCallback,
    useLayoutEffect,
    memo,
    startTransition,
} from "react"
import { useReducedMotion } from "framer-motion"

interface Props {
    text: string
    fontSize: number
    fontWeight: number
    fontFamily: string
    textAlign: "left" | "center" | "right"
    lineHeight: number
    letterSpacing: number
    direction: "ltr" | "rtl"
    preset: "fast" | "balanced" | "cinematic" | "custom"
    customStiffness: number
    customDamping: number
    customWindowSize: number
    scrollOffsetStart: number
    scrollOffsetEnd: number
    colorInitial: string
    colorTransition1: string
    colorTransition2: string
    colorTransition3: string
    colorFinal: string
    performanceMode: boolean
    replayOnScrollBack: boolean
}

const PRESETS = {
    fast:      { stiffness: 180, damping: 22, windowSize: 0.15 },
    balanced:  { stiffness: 100, damping: 18, windowSize: 0.12 },
    cinematic: { stiffness:  55, damping: 13, windowSize: 0.08 },
} as const

const REST_THRESHOLD = 0.0008
const MAX_DT         = 0.05

function parseHex(hex: string): [number, number, number] {
    const h = hex.replace("#", "")
    const f = h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h
    const n = parseInt(f, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function buildPalette(
    c0: string, c1: string, c2: string, c3: string, c4: string
): Float32Array {
    const palette = new Float32Array(15)
    ;[c0, c1, c2, c3, c4].forEach((c, i) => {
        const [r, g, b] = parseHex(c)
        palette[i * 3]     = r / 255
        palette[i * 3 + 1] = g / 255
        palette[i * 3 + 2] = b / 255
    })
    return palette
}

function colorAtProgress(p: number, palette: Float32Array): string {
    const clamped = p < 0 ? 0 : p > 1 ? 1 : p
    const scaled  = clamped * 4
    const lo      = scaled | 0
    const hi      = lo < 4 ? lo + 1 : 4
    const t       = scaled - lo

    const ai = lo * 3, bi = hi * 3
    const r = Math.round((palette[ai]     + (palette[bi]     - palette[ai])     * t) * 255)
    const g = Math.round((palette[ai + 1] + (palette[bi + 1] - palette[ai + 1]) * t) * 255)
    const b = Math.round((palette[ai + 2] + (palette[bi + 2] - palette[ai + 2]) * t) * 255)
    return `rgb(${r},${g},${b})`
}

function stepSpring(
    state:    Float32Array,
    targets:  Float32Array,
    idx:      number,
    dt:       number,
    k:        number,
    d:        number,
): boolean {
    const si  = idx * 2
    const cur = state[si]
    const vel = state[si + 1]
    const tar = targets[idx]

    const force   = -k * (cur - tar) - d * vel
    const newVel  = vel + force * dt
    const newCur  = cur + newVel * dt

    state[si]     = newCur
    state[si + 1] = newVel

    return Math.abs(newCur - cur) > REST_THRESHOLD
}

function tokenise(text: string, wordMode: boolean): string[] {
    return wordMode ? text.match(/\S+|\s+/g) ?? [text] : Array.from(text)
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
const GradientTextReveal = memo(function GradientTextReveal(props: Props) {
    const {
        text,
        fontSize,
        fontWeight,
        fontFamily,
        textAlign,
        lineHeight,
        letterSpacing,
        direction,
        preset,
        customStiffness,
        customDamping,
        customWindowSize,
        scrollOffsetStart,
        scrollOffsetEnd,
        colorInitial,
        colorTransition1,
        colorTransition2,
        colorTransition3,
        colorFinal,
        performanceMode,
        replayOnScrollBack,
    } = props

    const prefersReduced = useReducedMotion()

    const { stiffness, damping, windowSize } = useMemo(() => {
        if (preset === "custom") {
            return {
                stiffness:  customStiffness,
                damping:    customDamping,
                windowSize: customWindowSize,
            }
        }
        return PRESETS[preset]
    }, [preset, customStiffness, customDamping, customWindowSize])

    const useWordMode = performanceMode || text.replace(/\s/g, "").length > 600

    const tokens = useMemo(
        () => tokenise(text, useWordMode),
        [text, useWordMode]
    )
    const total = tokens.length

    const palette = useMemo(
        () => buildPalette(colorInitial, colorTransition1, colorTransition2, colorTransition3, colorFinal),
        [colorInitial, colorTransition1, colorTransition2, colorTransition3, colorFinal]
    )

    const containerRef  = useRef<HTMLDivElement>(null)
    const spanRefs      = useRef<(HTMLSpanElement | null)[]>([])
    const springState   = useRef<Float32Array>(new Float32Array(total * 2))
    const springTargets = useRef<Float32Array>(new Float32Array(total))
    const rafRef        = useRef<number>(0)
    const isVisible     = useRef<boolean>(true)
    const isRunning     = useRef<boolean>(false)
    const lastTime      = useRef<number>(0)
    const scrollRafRef  = useRef<number>(0)

    useLayoutEffect(() => {
        spanRefs.current    = new Array(total).fill(null)
        springState.current = new Float32Array(total * 2)
        springTargets.current = new Float32Array(total)
    }, [total])

    const startLoop = useCallback(() => {
        if (isRunning.current) return
        isRunning.current = true
        lastTime.current  = 0

        const loop = (now: number) => {
            if (!isRunning.current) return

            if (lastTime.current === 0) lastTime.current = now
            const dt = Math.min((now - lastTime.current) / 1000, MAX_DT)
            lastTime.current = now

            let anyActive = false
            const state   = springState.current
            const targets = springTargets.current
            const spans   = spanRefs.current

            for (let i = 0; i < total; i++) {
                const moved = stepSpring(state, targets, i, dt, stiffness, damping)
                if (moved) {
                    anyActive = true
                    const span = spans[i]
                    if (span) span.style.color = colorAtProgress(state[i * 2], palette)
                }
            }

            if (anyActive && isVisible.current) {
                rafRef.current = requestAnimationFrame(loop)
            } else {
                isRunning.current = false
            }
        }

        rafRef.current = requestAnimationFrame(loop)
    }, [total, stiffness, damping, palette])

    const stopLoop = useCallback(() => {
        isRunning.current = false
        cancelAnimationFrame(rafRef.current)
    }, [])

    useEffect(() => {
        startLoop()
        return stopLoop
    }, [startLoop, stopLoop])

    useEffect(() => {
        const el = containerRef.current
        if (!el || typeof IntersectionObserver === "undefined") return

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible.current = entry.isIntersecting
                if (entry.isIntersecting) startLoop()
            },
            { threshold: 0 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [startLoop])

    useEffect(() => {
        if (!prefersReduced) return
        const targets = springTargets.current
        const state   = springState.current
        const spans   = spanRefs.current
        for (let i = 0; i < total; i++) {
            targets[i]       = 1
            state[i * 2]     = 1
            state[i * 2 + 1] = 0
            const span = spans[i]
            if (span) span.style.color = colorAtProgress(1, palette)
        }
    }, [prefersReduced, total, palette])

    useEffect(() => {
        if (prefersReduced) return

        const ss = scrollOffsetStart / 100
        const se = scrollOffsetEnd   / 100

        const computeTargets = () => {
            const el = containerRef.current
            if (!el) return

            const rect = el.getBoundingClientRect()
            const vh   = typeof window !== "undefined" ? window.innerHeight : 0

            const travelPx  = rect.height + vh * (se - ss)
            const movedPx   = vh * ss - rect.top
            const progress  = travelPx > 0 ? movedPx / travelPx : 0
            const clamped   = progress < 0 ? 0 : progress > 1 ? 1 : progress

            const n       = total
            const win     = windowSize
            const targets = springTargets.current

            for (let i = 0; i < n; i++) {
                const pos = direction === "rtl"
                    ? (n - 1 - i) / (n > 1 ? n - 1 : 1)
                    : i            / (n > 1 ? n - 1 : 1)

                const localT  = (clamped - (pos - win)) / (win * 2)
                const charProg = localT < 0 ? 0 : localT > 1 ? 1 : localT

                if (replayOnScrollBack) {
                    targets[i] = charProg
                } else {
                    if (charProg > targets[i]) targets[i] = charProg
                }
            }

            startLoop()
        }

        const onScroll = () => {
            if (scrollRafRef.current) return
            scrollRafRef.current = requestAnimationFrame(() => {
                scrollRafRef.current = 0
                computeTargets()
            })
        }

        const scrollEl = (() => {
            if (typeof window === "undefined") return null
            let el: Element | null = containerRef.current?.parentElement ?? null
            while (el) {
                const { overflowY } = getComputedStyle(el)
                if (overflowY === "scroll" || overflowY === "auto") return el
                el = el.parentElement
            }
            return window
        })()

        if (scrollEl) {
            scrollEl.addEventListener("scroll", onScroll, { passive: true })
            if (scrollEl !== window && typeof window !== "undefined") {
                window.addEventListener("scroll", onScroll, { passive: true })
            }
        }

        computeTargets()

        return () => {
            if (scrollEl) {
                scrollEl.removeEventListener("scroll", onScroll)
                if (scrollEl !== window && typeof window !== "undefined") {
                    window.removeEventListener("scroll", onScroll)
                }
            }
            cancelAnimationFrame(scrollRafRef.current)
        }
    }, [
        prefersReduced,
        total,
        windowSize,
        scrollOffsetStart,
        scrollOffsetEnd,
        direction,
        replayOnScrollBack,
        startLoop,
    ])

    const containerStyle: React.CSSProperties = {
        width:       "100%",
        fontSize,
        fontWeight,
        fontFamily:  fontFamily || undefined,
        textAlign,
        lineHeight,
        letterSpacing: letterSpacing ? `${letterSpacing}em` : undefined,
        whiteSpace:  "pre-wrap",
        wordBreak:   "break-word",
        userSelect:  "none",
    }

    if (prefersReduced) {
        return (
            <div style={{ ...containerStyle, color: colorFinal }}>
                {text}
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            style={containerStyle}
            aria-label={text}
            role="text"
        >
            {tokens.map((token, i) => (
                <span
                    key={i}
                    ref={el => { spanRefs.current[i] = el }}
                    style={{
                        color:       colorAtProgress(0, palette),
                        display:     "inline",
                        willChange:  "color",
                    }}
                >
                    {token}
                </span>
            ))}
        </div>
    )
})

export default GradientTextReveal

addPropertyControls(GradientTextReveal, {
    text: {
        type:            ControlType.String,
        title:           "Text",
        displayTextArea: true,
        defaultValue:    "Luminacle is a design-driven studio crafting high-end websites and AI-powered visual experiences that elevate every brand.",
    },
    fontSize: {
        type:         ControlType.Number,
        title:        "Font Size",
        defaultValue: 48,
        min:          8,
        max:          200,
        step:         1,
        unit:         "px",
    },
    fontWeight: {
        type:         ControlType.Enum,
        title:        "Weight",
        options:      [100, 200, 300, 400, 500, 600, 700, 800, 900],
        optionTitles: ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black"],
        defaultValue: 700,
    },
    fontFamily: {
        type:         ControlType.String,
        title:        "Font Family",
        defaultValue: "",
        placeholder:  "Inherit from canvas",
    },
    lineHeight: {
        type:         ControlType.Number,
        title:        "Line Height",
        defaultValue: 1.2,
        min:          0.8,
        max:          3,
        step:         0.05,
    },
    letterSpacing: {
        type:         ControlType.Number,
        title:        "Letter Spacing",
        defaultValue: -0.02,
        min:          -0.1,
        max:          0.3,
        step:         0.005,
        unit:         "em",
    },
    textAlign: {
        type:         ControlType.Enum,
        title:        "Alignment",
        options:      ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: "left",
    },
    colorInitial: {
        type:         ControlType.Color,
        title:        "Color — Initial",
        defaultValue: "#3a3a3a",
    },
    colorTransition1: {
        type:         ControlType.Color,
        title:        "Color — Step 1",
        defaultValue: "#6b6b8a",
    },
    colorTransition2: {
        type:         ControlType.Color,
        title:        "Color — Step 2",
        defaultValue: "#a78bfa",
    },
    colorTransition3: {
        type:         ControlType.Color,
        title:        "Color — Step 3",
        defaultValue: "#f0abfc",
    },
    colorFinal: {
        type:         ControlType.Color,
        title:        "Color — Final",
        defaultValue: "#ffffff",
    },
    preset: {
        type:         ControlType.Enum,
        title:        "Preset",
        options:      ["fast", "balanced", "cinematic", "custom"],
        optionTitles: ["⚡ Fast", "⚖ Balanced", "🎬 Cinematic", "✏ Custom"],
        defaultValue: "balanced",
    },
    customStiffness: {
        type:         ControlType.Number,
        title:        "Stiffness",
        defaultValue: 100,
        min:          10,
        max:          500,
        step:         5,
        hidden:       (props: Props) => props.preset !== "custom",
    },
    customDamping: {
        type:         ControlType.Number,
        title:        "Damping",
        defaultValue: 18,
        min:          1,
        max:          80,
        step:         1,
        hidden:       (props: Props) => props.preset !== "custom",
    },
    customWindowSize: {
        type:         ControlType.Number,
        title:        "Window Size",
        defaultValue: 0.12,
        min:          0.01,
        max:          0.5,
        step:         0.01,
        hidden:       (props: Props) => props.preset !== "custom",
    },
    scrollOffsetStart: {
        type:         ControlType.Number,
        title:        "Scroll Start",
        defaultValue: 20,
        min:          0,
        max:          95,
        step:         1,
        unit:         "%",
    },
    scrollOffsetEnd: {
        type:         ControlType.Number,
        title:        "Scroll End",
        defaultValue: 80,
        min:          5,
        max:          100,
        step:         1,
        unit:         "%",
    },
    direction: {
        type:         ControlType.Enum,
        title:        "Direction",
        options:      ["ltr", "rtl"],
        optionTitles: ["Left → Right", "Right → Left"],
        defaultValue: "ltr",
    },
    replayOnScrollBack: {
        type:         ControlType.Boolean,
        title:        "Replay on Scroll Up",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle:"No",
    },
    performanceMode: {
        type:         ControlType.Boolean,
        title:        "Granularity",
        defaultValue: false,
        enabledTitle: "Words",
        disabledTitle:"Characters",
    },
})