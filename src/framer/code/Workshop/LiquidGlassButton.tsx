// Responsive liquid glass button component with glassmorphism effect and interactive animations
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { useState, type CSSProperties } from "react"

interface LiquidGlassButtonProps {
    label: string
    labelFont: CSSProperties
    labelColor: string
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    blur: number
    opacity: number
    padding: number
    gap: number
    icon?: string
    iconPosition: "left" | "right"
    showIcon: boolean
    glowColor: string
    glowIntensity: number
    enableHoverEffect: boolean
    enablePressEffect: boolean
    enableDistortion: boolean
    distortionIntensity: number
    distortionScale: number
    distortionSpeed: number
    noiseOpacity: number
    style?: CSSProperties
    chromaticAberration: number
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function LiquidGlassButton(props: LiquidGlassButtonProps) {
    const {
        label,
        labelFont,
        labelColor,
        backgroundColor,
        borderColor,
        borderWidth,
        borderRadius,
        blur,
        opacity,
        padding,
        gap,
        icon,
        iconPosition,
        showIcon,
        glowColor,
        glowIntensity,
        enableHoverEffect,
        enablePressEffect,
        enableDistortion,
        distortionIntensity,
        distortionScale,
        distortionSpeed,
        noiseOpacity,
        style,
        chromaticAberration,
    } = props

    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)

    const isFixedWidth = style?.width === "100%"
    const filterId = `distortion-${Math.random().toString(36).substr(2, 9)}`

    return (
        <motion.button
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: iconPosition === "right" ? "row" : "row",
                gap: showIcon && icon ? gap : 0,
                padding: `${padding}px ${padding * 1.5}px`,
                backgroundColor: backgroundColor,
                border: `${borderWidth}px solid ${borderColor}`,
                borderRadius: borderRadius,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                opacity: opacity,
                cursor: "pointer",
                overflow: "hidden",
                outline: "none",
                ...(isFixedWidth ? { width: "100%", ...style } : { width: "max-content" }),
                boxShadow: isHovered && enableHoverEffect
                    ? `0 0 ${glowIntensity}px ${glowColor}, 0 4px 12px rgba(0, 0, 0, 0.15)`
                    : "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            whileHover={
                enableHoverEffect
                    ? {
                          scale: 1.02,
                          transition: { duration: 0.2 },
                      }
                    : {}
            }
            whileTap={
                enablePressEffect
                    ? {
                          scale: 0.98,
                          transition: { duration: 0.1 },
                      }
                    : {}
            }
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onTapStart={() => setIsPressed(true)}
            onTap={() => setIsPressed(false)}
            onTapCancel={() => setIsPressed(false)}
        >
            {enableDistortion && (
                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                    <defs>
                        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency={distortionScale / 100}
                                numOctaves="4"
                                result="noise"
                                seed="1"
                            >
                                <animate
                                    attributeName="seed"
                                    dur={`${10 / distortionSpeed}s`}
                                    values="1;100;1"
                                    repeatCount="indefinite"
                                />
                            </feTurbulence>
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="noise"
                                scale={distortionIntensity * 2}
                                xChannelSelector="R"
                                yChannelSelector="G"
                                result="distorted"
                            />
                        </filter>
                        <filter id={`${filterId}-chromatic`} x="-50%" y="-50%" width="200%" height="200%">
                            <feTurbulence
                                type="turbulence"
                                baseFrequency={distortionScale / 80}
                                numOctaves="2"
                                result="turbulence"
                            >
                                <animate
                                    attributeName="baseFrequency"
                                    dur={`${8 / distortionSpeed}s`}
                                    values={`${distortionScale / 80};${(distortionScale / 80) * 2};${distortionScale / 80}`}
                                    repeatCount="indefinite"
                                />
                            </feTurbulence>
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="turbulence"
                                scale={distortionIntensity * 1.5}
                                xChannelSelector="R"
                                yChannelSelector="B"
                                result="displaced"
                            />
                            <feColorMatrix
                                in="displaced"
                                type="matrix"
                                values="1 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 1 0"
                                result="red"
                            />
                            <feOffset in="red" dx={props.chromaticAberration} dy="0" result="redOffset" />
                            <feColorMatrix
                                in="displaced"
                                type="matrix"
                                values="0 0 0 0 0
                                        0 1 0 0 0
                                        0 0 0 0 0
                                        0 0 0 1 0"
                                result="green"
                            />
                            <feColorMatrix
                                in="displaced"
                                type="matrix"
                                values="0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 1 0 0
                                        0 0 0 1 0"
                                result="blue"
                            />
                            <feOffset in="blue" dx={-props.chromaticAberration} dy="0" result="blueOffset" />
                            <feBlend in="redOffset" in2="green" mode="screen" result="temp" />
                            <feBlend in="temp" in2="blueOffset" mode="screen" result="chromatic" />
                        </filter>
                    </defs>
                </svg>
            )}

            {enableDistortion && (
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backdropFilter: `url(#${filterId}) blur(${blur / 4}px)`,
                        WebkitBackdropFilter: `url(#${filterId}) blur(${blur / 4}px)`,
                        opacity: noiseOpacity,
                        pointerEvents: "none",
                        mixBlendMode: "normal",
                    }}
                    animate={{
                        opacity: [noiseOpacity * 0.8, noiseOpacity, noiseOpacity * 0.8],
                    }}
                    transition={{
                        duration: 2 / distortionSpeed,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            )}

            {enableDistortion && (
                <motion.div
                    style={{
                        position: "absolute",
                        top: "-10%",
                        left: "-10%",
                        right: "-10%",
                        bottom: "-10%",
                        backdropFilter: `url(#${filterId}-chromatic)`,
                        WebkitBackdropFilter: `url(#${filterId}-chromatic)`,
                        opacity: noiseOpacity * 1.2,
                        pointerEvents: "none",
                        mixBlendMode: "normal",
                    }}
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20 / distortionSpeed,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />
            )}

            {enableDistortion && (
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backdropFilter: `url(#${filterId}) blur(${blur / 3}px) saturate(1.2)`,
                        WebkitBackdropFilter: `url(#${filterId}) blur(${blur / 3}px) saturate(1.2)`,
                        opacity: noiseOpacity * 0.8,
                        pointerEvents: "none",
                        mixBlendMode: "normal",
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 4 / distortionSpeed,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            )}

            <motion.div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `radial-gradient(circle at ${isPressed ? "50% 50%" : "0% 0%"}, ${glowColor}40, transparent 70%)`,
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: "none",
                }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            {showIcon && icon && iconPosition === "left" && (
                <span
                    style={{
                        fontSize: labelFont.fontSize || "14px",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {icon}
                </span>
            )}

            <span
                style={{
                    ...labelFont,
                    color: labelColor,
                    position: "relative",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </span>

            {showIcon && icon && iconPosition === "right" && (
                <span
                    style={{
                        fontSize: labelFont.fontSize || "14px",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {icon}
                </span>
            )}

            <motion.div
                style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: `radial-gradient(circle, ${glowColor}20, transparent 70%)`,
                    pointerEvents: "none",
                }}
                animate={{
                    x: isHovered ? ["0%", "50%", "0%"] : "0%",
                    y: isHovered ? ["0%", "50%", "0%"] : "0%",
                }}
                transition={{
                    duration: 3,
                    repeat: isHovered ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                }}
            />
        </motion.button>
    )
}

addPropertyControls(LiquidGlassButton, {
    label: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "Glass Button",
    },
    labelFont: {
        type: ControlType.Font,
        title: "Label Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "14px",
            variant: "Semibold",
            letterSpacing: "-0.01em",
            lineHeight: "1em",
        },
    },
    labelColor: {
        type: ControlType.Color,
        title: "Label Color",
        defaultValue: "#FFFFFF",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "rgba(255, 255, 255, 0.1)",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border Color",
        defaultValue: "rgba(255, 255, 255, 0.2)",
    },
    borderWidth: {
        type: ControlType.Number,
        title: "Border Width",
        defaultValue: 1,
        min: 0,
        max: 5,
        step: 0.5,
        unit: "px",
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Border Radius",
        defaultValue: 12,
        min: 0,
        max: 50,
        step: 1,
        unit: "px",
    },
    blur: {
        type: ControlType.Number,
        title: "Blur Amount",
        defaultValue: 10,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
    opacity: {
        type: ControlType.Number,
        title: "Opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.05,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 12,
        min: 4,
        max: 32,
        step: 2,
        unit: "px",
    },
    showIcon: {
        type: ControlType.Boolean,
        title: "Show Icon",
        defaultValue: false,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    icon: {
        type: ControlType.String,
        title: "Icon",
        defaultValue: "✨",
        hidden: ({ showIcon }) => !showIcon,
    },
    iconPosition: {
        type: ControlType.Enum,
        title: "Icon Position",
        options: ["left", "right"],
        optionTitles: ["Left", "Right"],
        defaultValue: "left",
        displaySegmentedControl: true,
        hidden: ({ showIcon }) => !showIcon,
    },
    gap: {
        type: ControlType.Number,
        title: "Icon Gap",
        defaultValue: 8,
        min: 0,
        max: 20,
        step: 2,
        unit: "px",
        hidden: ({ showIcon }) => !showIcon,
    },
    glowColor: {
        type: ControlType.Color,
        title: "Glow Color",
        defaultValue: "#FFFFFF",
    },
    glowIntensity: {
        type: ControlType.Number,
        title: "Glow Intensity",
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 5,
        unit: "px",
    },
    enableHoverEffect: {
        type: ControlType.Boolean,
        title: "Hover Effect",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    enablePressEffect: {
        type: ControlType.Boolean,
        title: "Press Effect",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    enableDistortion: {
        type: ControlType.Boolean,
        title: "Distortion",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    distortionIntensity: {
        type: ControlType.Number,
        title: "Distortion Intensity",
        defaultValue: 8,
        min: 0,
        max: 30,
        step: 1,
        hidden: ({ enableDistortion }) => !enableDistortion,
    },
    distortionScale: {
        type: ControlType.Number,
        title: "Distortion Scale",
        defaultValue: 3,
        min: 1,
        max: 10,
        step: 0.5,
        hidden: ({ enableDistortion }) => !enableDistortion,
    },
    distortionSpeed: {
        type: ControlType.Number,
        title: "Distortion Speed",
        defaultValue: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        hidden: ({ enableDistortion }) => !enableDistortion,
    },
    noiseOpacity: {
        type: ControlType.Number,
        title: "Noise Opacity",
        defaultValue: 0.4,
        min: 0,
        max: 1,
        step: 0.05,
        hidden: ({ enableDistortion }) => !enableDistortion,
    },
    chromaticAberration: {
        type: ControlType.Number,
        title: "Chromatic Aberration",
        defaultValue: 2,
        min: 0,
        max: 10,
        step: 0.5,
        unit: "px",
        hidden: ({ enableDistortion }) => !enableDistortion,
    },
})