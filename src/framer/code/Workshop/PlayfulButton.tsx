// Colorful button component with playful animations for preschool app
import { motion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { useRef, useEffect } from "react"
import type { CSSProperties } from "react"

interface PlayfulButtonProps {
    label: string
    backgroundColor: string
    textColor: string
    icon: string
    size: "small" | "medium" | "large"
    onClick?: () => void
    style?: CSSProperties
    font: any
    enableSounds: boolean
    hoverSound: string
    clickSound: string
    volume: number
}

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function PlayfulButton(props: PlayfulButtonProps) {
    const {
        label,
        backgroundColor,
        textColor,
        icon,
        size,
        onClick,
        style,
        font,
        enableSounds = true,
        hoverSound = "https://framerusercontent.com/assets/JKdtP4M3dZmIM4zCXxzKjMvc.mp3",
        clickSound = "https://framerusercontent.com/assets/8w3IUatLX9a5JVJ6XPCVuHi94.mp3",
        volume = 0.5,
    } = props

    const hoverAudioRef = useRef<HTMLAudioElement | null>(null)
    const clickAudioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined" && enableSounds) {
            hoverAudioRef.current = new Audio(hoverSound)
            clickAudioRef.current = new Audio(clickSound)
            
            if (hoverAudioRef.current) hoverAudioRef.current.volume = volume
            if (clickAudioRef.current) clickAudioRef.current.volume = volume
        }

        return () => {
            if (hoverAudioRef.current) {
                hoverAudioRef.current.pause()
                hoverAudioRef.current = null
            }
            if (clickAudioRef.current) {
                clickAudioRef.current.pause()
                clickAudioRef.current = null
            }
        }
    }, [hoverSound, clickSound, volume, enableSounds])

    const playHoverSound = () => {
        if (enableSounds && hoverAudioRef.current) {
            hoverAudioRef.current.currentTime = 0
            hoverAudioRef.current.play().catch(() => {
                // Ignore errors if audio can't play
            })
        }
    }

    const playClickSound = () => {
        if (enableSounds && clickAudioRef.current) {
            clickAudioRef.current.currentTime = 0
            clickAudioRef.current.play().catch(() => {
                // Ignore errors if audio can't play
            })
        }
    }

    const handleClick = () => {
        playClickSound()
        if (onClick) onClick()
    }

    const sizeStyles = {
        small: { padding: "12px 24px", fontSize: "16px", iconSize: "20px" },
        medium: { padding: "16px 32px", fontSize: "20px", iconSize: "28px" },
        large: { padding: "20px 40px", fontSize: "24px", iconSize: "36px" },
    }

    const currentSize = sizeStyles[size]

    return (
        <motion.button
            style={{
                ...style,
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                padding: currentSize.padding,
                backgroundColor,
                color: textColor,
                border: "none",
                borderRadius: "24px",
                cursor: "pointer",
                boxShadow: "0 4px 0 rgba(0, 0, 0, 0.15)",
                userSelect: "none",
                minWidth: "max-content",
                ...font,
            }}
            onClick={handleClick}
            onHoverStart={playHoverSound}
            whileHover={{
                scale: 1.05,
                boxShadow: "0 6px 0 rgba(0, 0, 0, 0.15)",
            }}
            whileTap={{
                scale: 0.95,
                boxShadow: "0 2px 0 rgba(0, 0, 0, 0.15)",
                y: 2,
            }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
            }}
        >
            {icon && (
                <motion.span
                    style={{
                        fontSize: currentSize.iconSize,
                        lineHeight: 1,
                    }}
                    animate={{
                        rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                    }}
                >
                    {icon}
                </motion.span>
            )}
            <span style={{ fontWeight: 700 }}>{label}</span>
        </motion.button>
    )
}

addPropertyControls(PlayfulButton, {
    label: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "Let's Play!",
    },
    icon: {
        type: ControlType.String,
        title: "Icon",
        defaultValue: "🎨",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FF6B6B",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#FFFFFF",
    },
    size: {
        type: ControlType.Enum,
        title: "Size",
        options: ["small", "medium", "large"],
        optionTitles: ["Small", "Medium", "Large"],
        defaultValue: "medium",
        displaySegmentedControl: true,
    },
    font: {
        type: ControlType.Font,
        title: "Font",
        controls: "extended",
        defaultFontType: "sans-serif",
        defaultValue: {
            fontSize: "20px",
            variant: "Bold",
            letterSpacing: "-0.01em",
            lineHeight: "1em",
        },
    },
    enableSounds: {
        type: ControlType.Boolean,
        title: "Enable Sounds",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    hoverSound: {
        type: ControlType.File,
        title: "Hover Sound",
        allowedFileTypes: ["mp3", "wav", "ogg"],
    },
    clickSound: {
        type: ControlType.File,
        title: "Click Sound",
        allowedFileTypes: ["mp3", "wav", "ogg"],
    },
    volume: {
        type: ControlType.Number,
        title: "Volume",
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.1,
        displayStepper: false,
    },
})