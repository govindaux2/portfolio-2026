// Continuously animated component where multiple small stars merge into one large star, shine with gradient color fill, then break apart back to original positions. Includes glow effects and light glare with smooth butter-like animations.

import { useEffect, useState, useMemo, type CSSProperties } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

interface StarMergeProps {
    starCount: number
    smallStarSize: number
    largeStarSize: number
    starColor: string
    glowColor: string
    shineColor: string
    animationDuration: number
    glowIntensity: number
    easingPreset: string
    customEasing: number[]
    useCustomEasing: boolean
    interactionTrigger: string
    autoPlay: boolean
    enableReverse: boolean
    showLoading: boolean
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function StarMerge(props: StarMergeProps) {
    const {
        starCount = 6,
        smallStarSize = 20,
        largeStarSize = 80,
        starColor = "#FFD700",
        glowColor = "#FFA500",
        shineColor = "#FFFFFF",
        animationDuration = 3,
        glowIntensity = 20,
        easingPreset = "butter",
        customEasing = [0.34, 1.56, 0.64, 1],
        useCustomEasing = false,
        interactionTrigger = "none",
        autoPlay = true,
        enableReverse = false,
        showLoading = true,
    } = props

    const [phase, setPhase] = useState<"scattered" | "merging" | "shining" | "breaking">("scattered")
    const [isAnimating, setIsAnimating] = useState(autoPlay)
    const [isLoading, setIsLoading] = useState(showLoading)
    const [isReversing, setIsReversing] = useState(false)
    
    // Use percentage-based center point for responsiveness
    const centerX = 50
    const centerY = 50

    const starPositions = useMemo(() => {
        const positions = []
        const radius = 20 // 20% of viewBox
        for (let i = 0; i < starCount; i++) {
            const angle = (i / starCount) * Math.PI * 2
            positions.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
            })
        }
        return positions
    }, [starCount, centerX, centerY])

    useEffect(() => {
        if (showLoading) {
            const loadingTimer = setTimeout(() => {
                setIsLoading(false)
            }, 1000)
            return () => clearTimeout(loadingTimer)
        } else {
            setIsLoading(false)
        }
    }, [showLoading])

    useEffect(() => {
        if (!isAnimating || isLoading) return

        const sequence = async () => {
            // Forward animation
            setIsReversing(false)
            await new Promise((resolve) => setTimeout(resolve, animationDuration * 200))
            setPhase("merging")
            await new Promise((resolve) => setTimeout(resolve, animationDuration * 400))
            setPhase("shining")
            await new Promise((resolve) => setTimeout(resolve, animationDuration * 300))
            setPhase("breaking")
            await new Promise((resolve) => setTimeout(resolve, animationDuration * 400))
            setPhase("scattered")
            
            // Reverse animation if enabled
            if (enableReverse) {
                await new Promise((resolve) => setTimeout(resolve, animationDuration * 200))
                setIsReversing(true)
                setPhase("breaking")
                await new Promise((resolve) => setTimeout(resolve, animationDuration * 400))
                setPhase("shining")
                await new Promise((resolve) => setTimeout(resolve, animationDuration * 300))
                setPhase("merging")
                await new Promise((resolve) => setTimeout(resolve, animationDuration * 400))
                setPhase("scattered")
            }
        }

        const totalDuration = enableReverse ? animationDuration * 2600 : animationDuration * 1300
        const interval = setInterval(sequence, totalDuration)
        sequence()

        return () => clearInterval(interval)
    }, [animationDuration, isAnimating, enableReverse, isLoading])

    const createStarPath = (size: number) => {
        const points = 5
        const outerRadius = size / 2
        const innerRadius = outerRadius * 0.4
        let path = ""

        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * Math.PI) / points - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            path += `${i === 0 ? "M" : "L"} ${x} ${y} `
        }
        path += "Z"
        return path
    }
    
    // Scale star sizes relative to viewBox (percentage-based)
    const scaledSmallStarSize = (smallStarSize / 500) * 100
    const scaledLargeStarSize = (largeStarSize / 500) * 100
    const scaledGlowIntensity = (glowIntensity / 500) * 100

    const easingPresets = {
        butter: [0.34, 1.56, 0.64, 1],
        smooth: [0.45, 0, 0.55, 1],
        bounce: [0.68, -0.55, 0.265, 1.55],
        elastic: [0.5, 1.5, 0.5, 1],
        spring: [0.6, 0.04, 0.98, 0.335],
        snappy: [0.85, 0, 0.15, 1],
        gentle: [0.25, 0.46, 0.45, 0.94],
    }

    const activeEasing = useCustomEasing ? customEasing : easingPresets[easingPreset]

    const handleInteraction = () => {
        if (interactionTrigger === "click") {
            setIsAnimating(!isAnimating)
        } else if (interactionTrigger === "tap") {
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), animationDuration * 1300)
        }
    }

    const handleMouseEnter = () => {
        if (interactionTrigger === "hover") {
            setIsAnimating(true)
        }
    }

    const handleMouseLeave = () => {
        if (interactionTrigger === "hover") {
            setIsAnimating(false)
        }
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                background: "transparent",
                cursor: interactionTrigger !== "none" ? "pointer" : "default",
            }}
            onClick={handleInteraction}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isLoading ? (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <motion.div
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                        style={{
                            width: "40px",
                            height: "40px",
                            border: `4px solid ${glowColor}`,
                            borderTopColor: starColor,
                            borderRadius: "50%",
                        }}
                    />
                </div>
            ) : (
                <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ display: "block" }}
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation={scaledGlowIntensity} result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <radialGradient id="shineGradient">
                            <stop offset="0%" stopColor={shineColor} stopOpacity="1" />
                            <stop offset="50%" stopColor={starColor} stopOpacity="1" />
                            <stop offset="100%" stopColor={glowColor} stopOpacity="0.8" />
                        </radialGradient>
                        <radialGradient id="glareGradient">
                            <stop offset="0%" stopColor={shineColor} stopOpacity="0.9" />
                            <stop offset="100%" stopColor={shineColor} stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {phase !== "shining" &&
                        starPositions.map((pos, index) => (
                            <motion.g
                                key={index}
                                initial={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
                                animate={{
                                    x: phase === "scattered" || phase === "breaking" ? pos.x : centerX,
                                    y: phase === "scattered" || phase === "breaking" ? pos.y : centerY,
                                    opacity: phase === "merging" ? 0 : 1,
                                    scale: phase === "merging" ? 0.3 : 1,
                                    rotate: isReversing ? (phase === "merging" ? 0 : 360) : (phase === "merging" ? 360 : 0),
                                }}
                                transition={{
                                    duration: animationDuration * 0.4,
                                    ease: activeEasing,
                                    opacity: { duration: animationDuration * 0.3 },
                                }}
                            >
                                <path
                                    d={createStarPath(scaledSmallStarSize)}
                                    fill={starColor}
                                    filter="url(#glow)"
                                    style={{ transformOrigin: "center" }}
                                />
                            </motion.g>
                        ))}

                    {(phase === "merging" || phase === "shining" || phase === "breaking") && (
                        <motion.g
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: phase === "breaking" ? 0 : 1,
                                scale: phase === "breaking" ? 0.3 : 1,
                                rotate: phase === "shining" ? (isReversing ? -360 : 360) : 0,
                            }}
                            transition={{
                                duration: animationDuration * 0.4,
                                ease: activeEasing,
                                rotate: { duration: animationDuration * 0.3, ease: "linear" },
                            }}
                        >
                            <g transform={`translate(${centerX}, ${centerY})`}>
                                <motion.path
                                    d={createStarPath(scaledLargeStarSize)}
                                    fill={phase === "shining" ? "url(#shineGradient)" : starColor}
                                    filter="url(#glow)"
                                    animate={{
                                        scale: phase === "shining" ? [1, 1.1, 1] : 1,
                                    }}
                                    transition={{
                                        duration: animationDuration * 0.3,
                                        repeat: phase === "shining" ? Number.POSITIVE_INFINITY : 0,
                                        ease: "easeInOut",
                                    }}
                                />

                                {phase === "shining" && (
                                    <>
                                        <motion.circle
                                            r={scaledLargeStarSize * 0.6}
                                            fill="url(#glareGradient)"
                                            animate={{
                                                scale: [0, 1.5, 0],
                                                opacity: [0, 0.8, 0],
                                            }}
                                            transition={{
                                                duration: animationDuration * 0.3,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "easeOut",
                                            }}
                                        />
                                        <motion.circle
                                            r={scaledLargeStarSize * 0.3}
                                            fill={shineColor}
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: animationDuration * 0.15,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    </>
                                )}
                            </g>
                        </motion.g>
                    )}
                </svg>
            )}
        </div>
    )
}

addPropertyControls(StarMerge, {
    starCount: {
        type: ControlType.Number,
        title: "Star Count",
        defaultValue: 6,
        min: 3,
        max: 12,
        step: 1,
    },
    smallStarSize: {
        type: ControlType.Number,
        title: "Small Star Size",
        defaultValue: 20,
        min: 10,
        max: 40,
        step: 1,
        unit: "px",
    },
    largeStarSize: {
        type: ControlType.Number,
        title: "Large Star Size",
        defaultValue: 80,
        min: 40,
        max: 150,
        step: 5,
        unit: "px",
    },
    starColor: {
        type: ControlType.Color,
        title: "Star Color",
        defaultValue: "#FFD700",
    },
    glowColor: {
        type: ControlType.Color,
        title: "Glow Color",
        defaultValue: "#FFA500",
    },
    shineColor: {
        type: ControlType.Color,
        title: "Shine Color",
        defaultValue: "#FFFFFF",
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Animation Speed",
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 0.5,
        unit: "s",
    },
    glowIntensity: {
        type: ControlType.Number,
        title: "Glow Intensity",
        defaultValue: 20,
        min: 5,
        max: 50,
        step: 5,
    },
    useCustomEasing: {
        type: ControlType.Boolean,
        title: "Custom Easing",
        defaultValue: false,
        enabledTitle: "Custom",
        disabledTitle: "Preset",
    },
    easingPreset: {
        type: ControlType.Enum,
        title: "Easing Preset",
        options: ["butter", "smooth", "bounce", "elastic", "spring", "snappy", "gentle"],
        optionTitles: ["Butter", "Smooth", "Bounce", "Elastic", "Spring", "Snappy", "Gentle"],
        defaultValue: "butter",
        hidden: ({ useCustomEasing }) => useCustomEasing,
    },
    customEasing: {
        type: ControlType.Array,
        title: "Cubic Bezier",
        control: {
            type: ControlType.Number,
            min: -2,
            max: 2,
            step: 0.01,
        },
        maxCount: 4,
        defaultValue: [0.34, 1.56, 0.64, 1],
        hidden: ({ useCustomEasing }) => !useCustomEasing,
    },
    autoPlay: {
        type: ControlType.Boolean,
        title: "Auto Play",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    interactionTrigger: {
        type: ControlType.Enum,
        title: "Interaction",
        options: ["none", "hover", "click", "tap"],
        optionTitles: ["None", "Hover", "Click/Toggle", "Tap/Once"],
        defaultValue: "none",
        hidden: ({ autoPlay }) => autoPlay,
    },
    enableReverse: {
        type: ControlType.Boolean,
        title: "Reverse Animation",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    showLoading: {
        type: ControlType.Boolean,
        title: "Loading State",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
})