import { useEffect, useRef, useState, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useInView } from "framer-motion"

interface LottiePlayerProps {
    sourceType: "url" | "file"
    lottieUrl: string
    lottieFile: string
    autoplay: boolean
    loop: boolean
    speed: number
    direction: "normal" | "reverse"
    controls: boolean
    hoverPlay: boolean
    transparent: boolean
    backdrop: string
    containerStyle: {
        borderWidth: number
        borderColor: string
        borderStyle: "solid" | "dashed" | "dotted"
        roundness: number
    }
    scale: number
    horizontal: "left" | "center" | "right"
    vertical: "top" | "center" | "bottom"
    xOffset: number
    yOffset: number
    scrollAnimation: boolean
    behavior: "scrub" | "play" | "playOnce"
    start: number
    end: number
    responsiveMode: boolean
    fitMode: "contain" | "cover" | "fill" | "none"
    maintainAspectRatio: boolean
    scaleOnMobile: number
    scaleOnTablet: number
    scaleOnDesktop: number
    scrollPhysics: boolean
    style?: CSSProperties
}

/**
 * Lottie Player with comprehensive controls
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 400
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function LottiePlayer(props: LottiePlayerProps) {
    const {
        sourceType = "url",
        lottieUrl = "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.json",
        lottieFile = "",
        autoplay = true,
        loop = true,
        speed = 1,
        direction = "normal",
        controls = false,
        hoverPlay = false,
        transparent = false,
        backdrop = "#FFFFFF",
        containerStyle = {
            borderWidth: 0,
            borderColor: "#000000",
            borderStyle: "solid",
            roundness: 0,
        },
        scale = 1,
        horizontal = "center",
        vertical = "center",
        xOffset = 0,
        yOffset = 0,
        scrollAnimation = false,
        behavior = "scrub",
        start = 0,
        end = 100,
        responsiveMode = false,
        fitMode = "contain",
        maintainAspectRatio = true,
        scaleOnMobile = 1,
        scaleOnTablet = 1,
        scaleOnDesktop = 1,
        scrollPhysics = false,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const lottieRef = useRef<any>(null)
    const [isPlaying, setIsPlaying] = useState(autoplay && !hoverPlay && !scrollAnimation)
    const [isHovered, setIsHovered] = useState(false)
    const [lottieLoaded, setLottieLoaded] = useState(false)
    const [deviceScale, setDeviceScale] = useState(1)
    const isInView = useInView(containerRef, { amount: 0.1 })
    const hasPlayedOnce = useRef(false)

    const animationSource = sourceType === "url" ? lottieUrl : lottieFile

    useEffect(() => {
        if (!responsiveMode || typeof window === "undefined") return

        const updateDeviceScale = () => {
            const width = window.innerWidth
            let newScale = scaleOnDesktop

            if (width < 768) {
                newScale = scaleOnMobile
            } else if (width < 1024) {
                newScale = scaleOnTablet
            }

            startTransition(() => setDeviceScale(newScale))
        }

        updateDeviceScale()
        window.addEventListener("resize", updateDeviceScale)

        return () => {
            window.removeEventListener("resize", updateDeviceScale)
        }
    }, [responsiveMode, scaleOnMobile, scaleOnTablet, scaleOnDesktop])

    useEffect(() => {
        if (typeof window === "undefined") return

        const checkLottie = () => {
            if ((window as any).lottie) {
                startTransition(() => setLottieLoaded(true))
                return true
            }
            return false
        }

        if (checkLottie()) return

        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        script.async = true
        script.onload = () => {
            startTransition(() => setLottieLoaded(true))
        }
        document.head.appendChild(script)

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script)
            }
        }
    }, [])

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current || !animationSource || !lottieLoaded) return

        const lottieWeb = (window as any).lottie

        if (!lottieWeb) return

        if (lottieRef.current) {
            lottieRef.current.destroy()
        }

        lottieRef.current = lottieWeb.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: loop && !scrollAnimation,
            autoplay: autoplay && !hoverPlay && !scrollAnimation,
            path: animationSource,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid meet",
                progressiveLoad: true,
                hideOnTransparent: true,
                className: "lottie-svg",
            },
        })

        lottieRef.current.setSpeed(speed)
        lottieRef.current.setDirection(direction === "reverse" ? -1 : 1)

        if (scrollAnimation) {
            lottieRef.current.goToAndStop(0, true)
        }

        return () => {
            if (lottieRef.current) {
                lottieRef.current.destroy()
                lottieRef.current = null
            }
        }
    }, [animationSource, loop, autoplay, speed, direction, scrollAnimation, hoverPlay, lottieLoaded])

    useEffect(() => {
        if (!lottieRef.current || scrollAnimation) return

        if (hoverPlay) {
            if (isHovered) {
                lottieRef.current.play()
                startTransition(() => setIsPlaying(true))
            } else {
                lottieRef.current.pause()
                startTransition(() => setIsPlaying(false))
            }
        } else if (isPlaying) {
            lottieRef.current.play()
        } else {
            lottieRef.current.pause()
        }
    }, [isPlaying, isHovered, hoverPlay, scrollAnimation])

    useEffect(() => {
        if (!lottieRef.current || !scrollAnimation || !isInView) return

        const handleScroll = () => {
            if (!containerRef.current || !lottieRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const startPos = (start / 100) * windowHeight
            const endPos = (end / 100) * windowHeight

            const scrollProgress = Math.max(
                0,
                Math.min(1, (windowHeight - rect.top - startPos) / (endPos - startPos))
            )

            const totalFrames = lottieRef.current.totalFrames
            const targetFrame = scrollProgress * totalFrames

            if (behavior === "scrub") {
                lottieRef.current.goToAndStop(targetFrame, true)
            } else if (behavior === "play") {
                if (scrollProgress > 0 && scrollProgress < 1) {
                    lottieRef.current.play()
                } else {
                    lottieRef.current.pause()
                }
            } else if (behavior === "playOnce") {
                if (scrollProgress > 0 && !hasPlayedOnce.current) {
                    lottieRef.current.play()
                    hasPlayedOnce.current = true
                }
            }
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [scrollAnimation, behavior, start, end, isInView])

    const togglePlay = () => {
        if (scrollAnimation || hoverPlay) return
        startTransition(() => setIsPlaying(!isPlaying))
    }

    const justifyContent =
        horizontal === "left" ? "flex-start" : horizontal === "right" ? "flex-end" : "center"
    const alignItems = vertical === "top" ? "flex-start" : vertical === "bottom" ? "flex-end" : "center"

    const finalScale = responsiveMode ? scale * deviceScale : scale

    const objectFit = fitMode === "none" ? undefined : fitMode

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent,
                alignItems,
                backgroundColor: transparent ? "transparent" : backdrop,
                border: `${containerStyle.borderWidth}px ${containerStyle.borderStyle} ${containerStyle.borderColor}`,
                borderRadius: containerStyle.roundness,
                overflow: "hidden",
                ...(scrollPhysics && { scrollBehavior: "smooth" }),
            }}
            onMouseEnter={() => startTransition(() => setIsHovered(true))}
            onMouseLeave={() => startTransition(() => setIsHovered(false))}
        >
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${finalScale}) translate(${xOffset}px, ${yOffset}px)`,
                    transformOrigin: "center",
                    imageRendering: "crisp-edges",
                    WebkitFontSmoothing: "antialiased",
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                    ...(objectFit && { objectFit }),
                    ...(maintainAspectRatio && { aspectRatio: "auto" }),
                }}
            />
            {controls && !scrollAnimation && !hoverPlay && (
                <button
                    onClick={togglePlay}
                    style={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.2s",
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)"
                    }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                            <rect x="5" y="4" width="3" height="12" />
                            <rect x="12" y="4" width="3" height="12" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                            <path d="M6 4l10 6-10 6z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    )
}

addPropertyControls(LottiePlayer, {
    sourceType: {
        type: ControlType.Enum,
        title: "Source Type",
        options: ["url", "file"],
        optionTitles: ["URL", "File"],
        defaultValue: "url",
        displaySegmentedControl: true,
    },
    lottieUrl: {
        type: ControlType.String,
        title: "Lottie URL",
        defaultValue: "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189de081159a/IGmMCqhzpt.json",
        hidden: ({ sourceType }) => sourceType !== "url",
    },
    lottieFile: {
        type: ControlType.File,
        title: "Lottie File",
        allowedFileTypes: ["json"],
        hidden: ({ sourceType }) => sourceType !== "file",
    },
    autoplay: {
        type: ControlType.Boolean,
        title: "Autoplay",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    speed: {
        type: ControlType.Number,
        title: "Speed",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x",
    },
    direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: ["normal", "reverse"],
        optionTitles: ["Normal", "Reverse"],
        defaultValue: "normal",
        displaySegmentedControl: true,
    },
    controls: {
        type: ControlType.Boolean,
        title: "Controls",
        defaultValue: false,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    hoverPlay: {
        type: ControlType.Boolean,
        title: "Hover Play",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    transparent: {
        type: ControlType.Boolean,
        title: "Transparent",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    backdrop: {
        type: ControlType.Color,
        title: "Backdrop",
        defaultValue: "#FFFFFF",
        hidden: ({ transparent }) => transparent,
    },
    containerStyle: {
        type: ControlType.Object,
        title: "Container Style",
        controls: {
            borderWidth: {
                type: ControlType.Number,
                title: "Border Width",
                defaultValue: 0,
                min: 0,
                max: 20,
                unit: "px",
            },
            borderColor: {
                type: ControlType.Color,
                title: "Border Color",
                defaultValue: "#000000",
            },
            borderStyle: {
                type: ControlType.Enum,
                title: "Border Style",
                options: ["solid", "dashed", "dotted"],
                optionTitles: ["Solid", "Dashed", "Dotted"],
                defaultValue: "solid",
            },
            roundness: {
                type: ControlType.Number,
                title: "Roundness",
                defaultValue: 0,
                min: 0,
                max: 100,
                unit: "px",
            },
        },
    },
    scale: {
        type: ControlType.Number,
        title: "Scale",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x",
    },
    horizontal: {
        type: ControlType.Enum,
        title: "Horizontal",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    vertical: {
        type: ControlType.Enum,
        title: "Vertical",
        options: ["top", "center", "bottom"],
        optionTitles: ["Top", "Center", "Bottom"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    xOffset: {
        type: ControlType.Number,
        title: "X Offset",
        defaultValue: 0,
        min: -500,
        max: 500,
        unit: "px",
    },
    yOffset: {
        type: ControlType.Number,
        title: "Y Offset",
        defaultValue: 0,
        min: -500,
        max: 500,
        unit: "px",
    },
    scrollAnimation: {
        type: ControlType.Boolean,
        title: "Scroll Animation",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    behavior: {
        type: ControlType.Enum,
        title: "Behavior",
        options: ["scrub", "play", "playOnce"],
        optionTitles: ["Scrub", "Play", "Play Once"],
        defaultValue: "scrub",
        hidden: ({ scrollAnimation }) => !scrollAnimation,
    },
    start: {
        type: ControlType.Number,
        title: "Start",
        defaultValue: 0,
        min: 0,
        max: 100,
        unit: "%",
        hidden: ({ scrollAnimation }) => !scrollAnimation,
    },
    end: {
        type: ControlType.Number,
        title: "End",
        defaultValue: 100,
        min: 0,
        max: 100,
        unit: "%",
        hidden: ({ scrollAnimation }) => !scrollAnimation,
    },
    responsiveMode: {
        type: ControlType.Boolean,
        title: "Responsive Mode",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    fitMode: {
        type: ControlType.Enum,
        title: "Fit Mode",
        options: ["contain", "cover", "fill", "none"],
        optionTitles: ["Contain", "Cover", "Fill", "None"],
        defaultValue: "contain",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
    maintainAspectRatio: {
        type: ControlType.Boolean,
        title: "Maintain Aspect Ratio",
        defaultValue: true,
        enabledTitle: "Yes",
        disabledTitle: "No",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
    scaleOnMobile: {
        type: ControlType.Number,
        title: "Scale on Mobile",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
    scaleOnTablet: {
        type: ControlType.Number,
        title: "Scale on Tablet",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
    scaleOnDesktop: {
        type: ControlType.Number,
        title: "Scale on Desktop",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        unit: "x",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
    scrollPhysics: {
        type: ControlType.Boolean,
        title: "Smooth Scroll",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
        hidden: ({ responsiveMode }) => !responsiveMode,
    },
})