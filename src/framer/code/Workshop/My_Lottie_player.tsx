// Production-ready Lottie player component with scale and position controls

import { useEffect, useRef, useState, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

interface LottiePlayerProps {
    sourceType: "url" | "file"
    lottieUrl: string
    lottieFile: string
    autoplay: boolean
    loop: boolean
    speed: number
    direction: "normal" | "reverse"
    showControls: boolean
    hoverPlay: boolean
    transparentBackdrop: boolean
    backgroundColor: string
    scale: number
    horizontalPosition: "left" | "center" | "right"
    verticalPosition: "top" | "center" | "bottom"
    customHorizontalOffset: number
    customVerticalOffset: number
    responsiveMode: boolean
    fitMode: "contain" | "cover" | "fill" | "none"
    maintainAspectRatio: boolean
    scaleOnMobile: number
    scaleOnTablet: number
    scaleOnDesktop: number
    containerStyle: {
        borderWidth: number
        borderColor: string
        borderStyle: "solid" | "dashed" | "dotted"
        borderRadius: number
    }
    buttonPosition: {
        vertical: "top" | "center" | "bottom"
        horizontal: "left" | "center" | "right"
        verticalOffset: number
        horizontalOffset: number
    }
    playInView: boolean
    viewThreshold: number
    clickToReplay: boolean
    reverseAnimation: {
        reverseOnLoop: boolean
        reverseDelay: number
        reverseSpeed: number
    }
    enableScrollAnimation: boolean
    scrollStart: number
    scrollEnd: number
    scrollBehavior: "scrub" | "play" | "playOnce"
    scrollPhysics: {
        easingType: "linear" | "easeIn" | "easeOut" | "easeInOut" | "spring"
        springStiffness: number
        springDamping: number
        velocity: number
        smoothing: number
        inertia: boolean
        inertiaDecay: number
    }
    style?: CSSProperties
}

/**
 * Production-ready Lottie Player
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
        lottieUrl = "https://lottie.host/d826e0a7-b7e9-4b09-9a4b-3c5acb8c7e93/QLfiM6wjGT.json",
        lottieFile,
        autoplay = true,
        loop = true,
        speed = 1,
        direction = "normal",
        showControls = false,
        hoverPlay = false,
        transparentBackdrop = false,
        backgroundColor = "#FFFFFF",
        scale = 1,
        horizontalPosition = "center",
        verticalPosition = "center",
        customHorizontalOffset = 0,
        customVerticalOffset = 0,
        responsiveMode = false,
        fitMode = "contain",
        maintainAspectRatio = true,
        scaleOnMobile = 0.8,
        scaleOnTablet = 0.9,
        scaleOnDesktop = 1,
        containerStyle = {
            borderWidth: 0,
            borderColor: "#000000",
            borderStyle: "solid",
            borderRadius: 0,
        },
        buttonPosition = {
            vertical: "bottom",
            horizontal: "center",
            verticalOffset: 20,
            horizontalOffset: 0,
        },
        playInView = false,
        viewThreshold = 0.5,
        clickToReplay = false,
        reverseAnimation = {
            reverseOnLoop: false,
            reverseDelay: 0,
            reverseSpeed: 1,
        },
        enableScrollAnimation = false,
        scrollStart = 0,
        scrollEnd = 100,
        scrollBehavior = "scrub",
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const lottieInstanceRef = useRef<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isPlaying, setIsPlaying] = useState(autoplay && !hoverPlay)
    const [error, setError] = useState<string | null>(null)
    const [currentScale, setCurrentScale] = useState(scale)
    const [isInView, setIsInView] = useState(false)
    const hasPlayedOnceRef = useRef(false)
    const isReversingRef = useRef(false)
    const reverseTimeoutRef = useRef<number | null>(null)

    const source = sourceType === "url" ? lottieUrl : (lottieFile || lottieUrl)

    // Load Lottie library
    useEffect(() => {
        if (typeof window === "undefined") return

        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
        script.async = true
        script.onload = () => {
            startTransition(() => setIsLoaded(true))
        }
        script.onerror = () => {
            startTransition(() => setError("Failed to load Lottie library"))
        }
        document.body.appendChild(script)

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    // Handle responsive scaling
    useEffect(() => {
        if (!responsiveMode || typeof window === "undefined") {
            startTransition(() => setCurrentScale(scale))
            return
        }

        const updateScale = () => {
            const width = window.innerWidth
            let newScale = scale

            if (width < 768) {
                newScale = scale * scaleOnMobile
            } else if (width < 1024) {
                newScale = scale * scaleOnTablet
            } else {
                newScale = scale * scaleOnDesktop
            }

            startTransition(() => setCurrentScale(newScale))
        }

        updateScale()
        window.addEventListener("resize", updateScale)

        return () => {
            window.removeEventListener("resize", updateScale)
        }
    }, [responsiveMode, scale, scaleOnMobile, scaleOnTablet, scaleOnDesktop])

    // Handle play in view
    useEffect(() => {
        if (!playInView || !containerRef.current || typeof window === "undefined" || !lottieInstanceRef.current) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    startTransition(() => setIsInView(entry.isIntersecting))
                    
                    if (entry.isIntersecting) {
                        if (lottieInstanceRef.current && !enableScrollAnimation && !hoverPlay) {
                            lottieInstanceRef.current.play()
                            startTransition(() => setIsPlaying(true))
                        }
                    } else {
                        if (lottieInstanceRef.current && !enableScrollAnimation && !hoverPlay) {
                            lottieInstanceRef.current.pause()
                            startTransition(() => setIsPlaying(false))
                        }
                    }
                })
            },
            {
                threshold: viewThreshold,
            }
        )

        observer.observe(containerRef.current)

        return () => {
            observer.disconnect()
        }
    }, [playInView, viewThreshold, enableScrollAnimation, hoverPlay])

    // Handle scroll-based animation
    useEffect(() => {
        if (!enableScrollAnimation || !lottieInstanceRef.current || typeof window === "undefined") {
            return
        }

        const handleScroll = () => {
            if (!lottieInstanceRef.current || !containerRef.current) return

            const rect = containerRef.current.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const elementTop = rect.top
            const elementBottom = rect.bottom
            const elementHeight = rect.height

            // Calculate when element enters viewport (bottom of element reaches bottom of viewport)
            // to when it leaves viewport (top of element reaches top of viewport)
            const scrollableDistance = windowHeight + elementHeight
            const scrolled = windowHeight - elementTop

            // Raw scroll progress from 0 to 1 as element moves through viewport
            const rawProgress = Math.max(0, Math.min(1, scrolled / scrollableDistance))

            // Map to user-defined start/end range
            const startFraction = scrollStart / 100
            const endFraction = scrollEnd / 100
            const rangeFraction = endFraction - startFraction

            // Calculate progress within the defined range
            let rangeProgress = 0
            if (rawProgress < startFraction) {
                rangeProgress = 0
            } else if (rawProgress > endFraction) {
                rangeProgress = 1
            } else {
                rangeProgress = (rawProgress - startFraction) / rangeFraction
            }

            const totalFrames = lottieInstanceRef.current.totalFrames

            if (scrollBehavior === "scrub") {
                // Scrub through animation based on scroll position
                const frame = rangeProgress * totalFrames
                lottieInstanceRef.current.goToAndStop(frame, true)
            } else if (scrollBehavior === "play") {
                // Play animation when in range
                if (rangeProgress > 0 && rangeProgress < 1) {
                    if (!isPlaying) {
                        lottieInstanceRef.current.play()
                        startTransition(() => setIsPlaying(true))
                    }
                } else {
                    if (isPlaying) {
                        lottieInstanceRef.current.pause()
                        startTransition(() => setIsPlaying(false))
                    }
                }
            } else if (scrollBehavior === "playOnce") {
                // Play animation once when entering range
                if (rangeProgress > 0 && rangeProgress < 1 && !hasPlayedOnceRef.current) {
                    lottieInstanceRef.current.play()
                    hasPlayedOnceRef.current = true
                    startTransition(() => setIsPlaying(true))
                }
            }
        }

        handleScroll() // Initial check
        window.addEventListener("scroll", handleScroll, { passive: true })

        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [enableScrollAnimation, scrollStart, scrollEnd, scrollBehavior, isPlaying])

    // Initialize Lottie animation
    useEffect(() => {
        if (!isLoaded || !containerRef.current || typeof window === "undefined") return

        const lottie = (window as any).lottie

        if (!lottie) return

        // Clear previous instance
        if (lottieInstanceRef.current) {
            lottieInstanceRef.current.destroy()
        }

        try {
            lottieInstanceRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: "svg",
                loop: reverseAnimation.reverseOnLoop ? false : loop,
                autoplay: enableScrollAnimation ? false : (autoplay && !hoverPlay),
                path: source,
                rendererSettings: {
                    preserveAspectRatio: maintainAspectRatio ? "xMidYMid meet" : "xMidYMid slice",
                    progressiveLoad: true,
                    hideOnTransparent: true,
                    className: "lottie-svg-high-quality",
                    clearCanvas: false,
                    context: null,
                    scaleMode: "noScale",
                    filterSize: {
                        width: "200%",
                        height: "200%",
                        x: "-50%",
                        y: "-50%",
                    },
                },
            })

            lottieInstanceRef.current.setSpeed(speed)
            lottieInstanceRef.current.setDirection(direction === "normal" ? 1 : -1)

            // Handle reverse animation on loop
            if (reverseAnimation.reverseOnLoop && loop) {
                lottieInstanceRef.current.addEventListener("complete", () => {
                    if (reverseTimeoutRef.current) {
                        clearTimeout(reverseTimeoutRef.current)
                    }

                    reverseTimeoutRef.current = window.setTimeout(() => {
                        if (lottieInstanceRef.current) {
                            // Toggle direction
                            isReversingRef.current = !isReversingRef.current
                            const newDirection = isReversingRef.current ? -1 : 1
                            lottieInstanceRef.current.setDirection(newDirection)
                            
                            // Set reverse speed
                            const newSpeed = isReversingRef.current ? reverseAnimation.reverseSpeed : speed
                            lottieInstanceRef.current.setSpeed(newSpeed)
                            
                            // Play animation
                            lottieInstanceRef.current.play()
                        }
                    }, reverseAnimation.reverseDelay * 1000)
                })
            }

            lottieInstanceRef.current.addEventListener("data_ready", () => {
                startTransition(() => setError(null))
            })

            lottieInstanceRef.current.addEventListener("data_failed", () => {
                startTransition(() => setError("Failed to load animation"))
            })

            startTransition(() => setIsPlaying(enableScrollAnimation ? false : (autoplay && !hoverPlay)))
            hasPlayedOnceRef.current = false
        } catch (err) {
            startTransition(() => setError("Error initializing animation"))
        }

        return () => {
            if (reverseTimeoutRef.current) {
                clearTimeout(reverseTimeoutRef.current)
            }
            if (lottieInstanceRef.current) {
                lottieInstanceRef.current.destroy()
            }
        }
    }, [isLoaded, source, loop, autoplay, hoverPlay, speed, direction, maintainAspectRatio, enableScrollAnimation, reverseAnimation.reverseOnLoop, reverseAnimation.reverseDelay, reverseAnimation.reverseSpeed])

    // Handle hover play
    const handleMouseEnter = () => {
        if (hoverPlay && lottieInstanceRef.current) {
            lottieInstanceRef.current.play()
            startTransition(() => setIsPlaying(true))
        }
    }

    const handleMouseLeave = () => {
        if (hoverPlay && lottieInstanceRef.current) {
            lottieInstanceRef.current.stop()
            startTransition(() => setIsPlaying(false))
        }
    }

    // Handle play/pause toggle
    const togglePlayPause = () => {
        if (!lottieInstanceRef.current) return

        if (isPlaying) {
            lottieInstanceRef.current.pause()
            startTransition(() => setIsPlaying(false))
        } else {
            lottieInstanceRef.current.play()
            startTransition(() => setIsPlaying(true))
        }
    }

    // Handle click to replay
    const handleContainerClick = () => {
        if (clickToReplay && lottieInstanceRef.current) {
            lottieInstanceRef.current.goToAndPlay(0)
            startTransition(() => setIsPlaying(true))
        }
    }

    // Calculate position based on alignment
    const getHorizontalAlignment = () => {
        switch (horizontalPosition) {
            case "left":
                return "0%"
            case "right":
                return "100%"
            default:
                return "50%"
        }
    }

    const getVerticalAlignment = () => {
        switch (verticalPosition) {
            case "top":
                return "0%"
            case "bottom":
                return "100%"
            default:
                return "50%"
        }
    }

    // Get container styles based on fit mode
    const getContainerStyles = (): CSSProperties => {
        const horizontalAlign = getHorizontalAlignment()
        const verticalAlign = getVerticalAlignment()
        
        // Calculate transform origin based on alignment
        let transformOriginX = "50%"
        let transformOriginY = "50%"
        let translateX = "-50%"
        let translateY = "-50%"
        
        if (horizontalPosition === "left") {
            transformOriginX = "0%"
            translateX = "0%"
        } else if (horizontalPosition === "right") {
            transformOriginX = "100%"
            translateX = "-100%"
        }
        
        if (verticalPosition === "top") {
            transformOriginY = "0%"
            translateY = "0%"
        } else if (verticalPosition === "bottom") {
            transformOriginY = "100%"
            translateY = "-100%"
        }

        const baseStyles: CSSProperties = {
            position: "absolute",
            left: horizontalAlign,
            top: verticalAlign,
            transform: `translate(${translateX}, ${translateY}) translate(${customHorizontalOffset}px, ${customVerticalOffset}px) scale(${currentScale})`,
            transformOrigin: `${transformOriginX} ${transformOriginY}`,
        }

        switch (fitMode) {
            case "contain":
                return {
                    ...baseStyles,
                    width: "100%",
                    height: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                }
            case "cover":
                return {
                    ...baseStyles,
                    width: "100%",
                    height: "100%",
                    minWidth: "100%",
                    minHeight: "100%",
                }
            case "fill":
                return {
                    ...baseStyles,
                    width: "100%",
                    height: "100%",
                }
            case "none":
            default:
                return {
                    ...baseStyles,
                    width: "100%",
                    height: "100%",
                }
        }
    }

    // Calculate button position
    const getButtonPosition = (): CSSProperties => {
        const position: CSSProperties = {
            position: "absolute",
            zIndex: 10,
        }

        // Vertical positioning
        switch (buttonPosition.vertical) {
            case "top":
                position.top = `${buttonPosition.verticalOffset}px`
                break
            case "center":
                position.top = "50%"
                position.transform = "translateY(-50%)"
                break
            case "bottom":
                position.bottom = `${buttonPosition.verticalOffset}px`
                break
        }

        // Horizontal positioning
        switch (buttonPosition.horizontal) {
            case "left":
                position.left = `${buttonPosition.horizontalOffset}px`
                if (buttonPosition.vertical === "center") {
                    position.transform = "translate(0, -50%)"
                }
                break
            case "center":
                position.left = "50%"
                if (buttonPosition.vertical === "center") {
                    position.transform = `translate(calc(-50% + ${buttonPosition.horizontalOffset}px), -50%)`
                } else {
                    position.transform = `translateX(calc(-50% + ${buttonPosition.horizontalOffset}px))`
                }
                break
            case "right":
                position.right = `${buttonPosition.horizontalOffset}px`
                if (buttonPosition.vertical === "center") {
                    position.transform = "translate(0, -50%)"
                }
                break
        }

        return position
    }

    const isStatic = RenderTarget.current() === RenderTarget.thumbnail

    if (isStatic) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: transparentBackdrop ? "transparent" : backgroundColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                }}
            >
                Lottie Player
            </div>
        )
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: transparentBackdrop ? "transparent" : backgroundColor,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                border: `${containerStyle.borderWidth}px ${containerStyle.borderStyle} ${containerStyle.borderColor}`,
                borderRadius: `${containerStyle.borderRadius}px`,
                cursor: clickToReplay ? "pointer" : "default",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerClick}
        >
            <style>{`
                .lottie-svg-high-quality svg {
                    shape-rendering: geometricPrecision;
                    text-rendering: geometricPrecision;
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    -ms-interpolation-mode: nearest-neighbor;
                    width: 100%;
                    height: 100%;
                }
            `}</style>
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: fitMode === "cover" ? "hidden" : "visible",
                }}
            >
                <div
                    ref={containerRef}
                    style={{
                        ...getContainerStyles(),
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                        WebkitFontSmoothing: "antialiased",
                    }}
                />
            </div>

            {error && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#FF0000",
                        fontSize: 14,
                        fontFamily: "Inter, sans-serif",
                        textAlign: "center",
                        padding: 20,
                    }}
                >
                    {error}
                </div>
            )}

            {showControls && !error && (
                <div
                    style={{
                        ...getButtonPosition(),
                        display: "flex",
                        gap: 10,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        padding: "10px 20px",
                        borderRadius: 25,
                    }}
                >
                    <button
                        onClick={togglePlayPause}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? "⏸" : "▶"}
                    </button>
                </div>
            )}
        </div>
    )
}

addPropertyControls(LottiePlayer, {
    sourceType: {
        type: ControlType.Enum,
        title: "Source",
        options: ["url", "file"],
        optionTitles: ["URL", "File"],
        defaultValue: "url",
        displaySegmentedControl: true,
    },
    lottieUrl: {
        type: ControlType.String,
        title: "Link",
        defaultValue: "https://lottie.host/d826e0a7-b7e9-4b09-9a4b-3c5acb8c7e93/QLfiM6wjGT.json",
        hidden: ({ sourceType }) => sourceType !== "url",
    },
    lottieFile: {
        type: ControlType.File,
        title: "File",
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
    reverseAnimation: {
        type: ControlType.Object,
        title: "Reverse Animation",
        controls: {
            reverseOnLoop: {
                type: ControlType.Boolean,
                title: "Reverse on Loop",
                defaultValue: false,
                enabledTitle: "Yes",
                disabledTitle: "No",
            },
            reverseDelay: {
                type: ControlType.Number,
                title: "Reverse Delay",
                defaultValue: 0,
                min: 0,
                max: 10,
                step: 0.1,
                unit: "s",
            },
            reverseSpeed: {
                type: ControlType.Number,
                title: "Reverse Speed",
                defaultValue: 1,
                min: 0.1,
                max: 3,
                step: 0.1,
                unit: "x",
            },
        },
    },
    showControls: {
        type: ControlType.Boolean,
        title: "Controls",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    buttonPosition: {
        type: ControlType.Object,
        title: "Button Position",
        controls: {
            vertical: {
                type: ControlType.Enum,
                title: "Vertical",
                options: ["top", "center", "bottom"],
                optionTitles: ["Top", "Center", "Bottom"],
                defaultValue: "bottom",
                displaySegmentedControl: true,
            },
            horizontal: {
                type: ControlType.Enum,
                title: "Horizontal",
                options: ["left", "center", "right"],
                optionTitles: ["Left", "Center", "Right"],
                defaultValue: "center",
                displaySegmentedControl: true,
            },
            verticalOffset: {
                type: ControlType.Number,
                title: "Y Offset",
                defaultValue: 20,
                min: -200,
                max: 200,
                step: 1,
                unit: "px",
            },
            horizontalOffset: {
                type: ControlType.Number,
                title: "X Offset",
                defaultValue: 0,
                min: -200,
                max: 200,
                step: 1,
                unit: "px",
            },
        },
        hidden: ({ showControls }) => !showControls,
    },
    hoverPlay: {
        type: ControlType.Boolean,
        title: "Hover Play",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    playInView: {
        type: ControlType.Boolean,
        title: "Play in View",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    viewThreshold: {
        type: ControlType.Number,
        title: "View Threshold",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
        hidden: ({ playInView }) => !playInView,
    },
    transparentBackdrop: {
        type: ControlType.Boolean,
        title: "Transparent",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Backdrop",
        defaultValue: "#FFFFFF",
        hidden: ({ transparentBackdrop }) => transparentBackdrop,
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
                step: 1,
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
            borderRadius: {
                type: ControlType.Number,
                title: "Roundness",
                defaultValue: 0,
                min: 0,
                max: 100,
                step: 1,
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
    },
    horizontalPosition: {
        type: ControlType.Enum,
        title: "Horizontal Position",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    verticalPosition: {
        type: ControlType.Enum,
        title: "Vertical Position",
        options: ["top", "center", "bottom"],
        optionTitles: ["Top", "Center", "Bottom"],
        defaultValue: "center",
        displaySegmentedControl: true,
    },
    customHorizontalOffset: {
        type: ControlType.Number,
        title: "X Offset",
        defaultValue: 0,
        min: -500,
        max: 500,
        step: 1,
        unit: "px",
    },
    customVerticalOffset: {
        type: ControlType.Number,
        title: "Y Offset",
        defaultValue: 0,
        min: -500,
        max: 500,
        step: 1,
        unit: "px",
    },
    enableScrollAnimation: {
        type: ControlType.Boolean,
        title: "Scroll Animation",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    scrollBehavior: {
        type: ControlType.Enum,
        title: "Behavior",
        options: ["scrub", "play", "playOnce"],
        optionTitles: ["Scrub", "Play", "Play Once"],
        defaultValue: "scrub",
        displaySegmentedControl: true,
        hidden: ({ enableScrollAnimation }) => !enableScrollAnimation,
    },
    scrollStart: {
        type: ControlType.Number,
        title: "Start",
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        hidden: ({ enableScrollAnimation }) => !enableScrollAnimation,
    },
    scrollEnd: {
        type: ControlType.Number,
        title: "End",
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        hidden: ({ enableScrollAnimation }) => !enableScrollAnimation,
    },
    clickToReplay: {
        type: ControlType.Boolean,
        title: "Click to Replay",
        defaultValue: false,
        enabledTitle: "Yes",
        disabledTitle: "No",
    },
})