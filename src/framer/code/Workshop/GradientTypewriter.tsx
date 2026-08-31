// Gradient Typewriter - Completely restructured with working borders and organized controls

import { useEffect, useState, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

interface GradientTypewriterProps {
	// Text Content
	textStrings: string[]
	textTransform: "none" | "uppercase" | "lowercase" | "capitalize"
	textDirection: "ltr" | "rtl"
	
	// Typography
	font: CSSProperties
	textColor: string
	horizontalAlign: "left" | "center" | "right"
	verticalAlign: "top" | "center" | "bottom"
	
	// Animation
	animationEffect: "typewriter" | "reveal"
	
	// Typewriter
	typewriterMode: "letters" | "words" | "sentences"
	typewriterEasing: any
	startDelay: number
	loopAnimation: boolean
	pauseBetweenLoops: number
	showCursor: boolean
	cursorColor: string
	
	// Reveal Animation
	revealMode: "letters" | "words" | "sentences"
	revealDirection: "top" | "bottom" | "left" | "right"
	revealDistanceX: number
	revealDistanceY: number
	revealStagger: number
	revealEasing: any
	revealDelay: number
	
	// Gradient
	enableGradient: boolean
	gradientColors: {
		color1: string
		color2: string
		color3: string
		color4: string
	}
	gradientDirection: number
	gradientBlur: number
	gradientSpeed: number
	gradientEasing: any
	
	// Container
	containerBackground: string
	containerPadding: {
		top: number
		right: number
		bottom: number
		left: number
	}
	containerBorder: {
		enabled: boolean
		width: number
		color: string
		style: "solid" | "dashed" | "dotted"
		radius: number
	}
	
	// Positioning
	textOffsetX: number
	textOffsetY: number
	
	style?: CSSProperties
}

/**
 * Gradient Typewriter V3
 * 
 * Completely restructured component with working borders and organized controls
 *
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 100
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function GradientTypewriter(props: GradientTypewriterProps) {
	const {
		textStrings = ["Hello World"],
		textTransform = "none",
		textDirection = "ltr",
		font = {
			fontSize: "40px",
			fontWeight: 700,
			letterSpacing: "-0.04em",
			lineHeight: "1em",
		},
		textColor = "#000000",
		horizontalAlign = "left",
		verticalAlign = "center",
		animationEffect = "typewriter",
		typewriterMode = "letters",
		typewriterEasing = {
			type: "spring",
			stiffness: 100,
			damping: 20,
		},
		startDelay = 0,
		loopAnimation = true,
		pauseBetweenLoops = 2000,
		showCursor = true,
		cursorColor = "#000000",
		revealMode = "letters",
		revealDirection = "bottom",
		revealDistanceX = 0,
		revealDistanceY = 50,
		revealStagger = 50,
		revealEasing = {
			type: "spring",
			stiffness: 100,
			damping: 20,
		},
		revealDelay = 0,
		enableGradient = false,
		gradientColors = {
			color1: "#FF0080",
			color2: "#7928CA",
			color3: "#0070F3",
			color4: "#00DFD8",
		},
		gradientDirection = 45,
		gradientBlur = 0,
		gradientSpeed = 3,
		containerBackground = "#FFFFFF",
		containerPadding = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20,
		},
		containerBorder = {
			enabled: false,
			width: 2,
			color: "#000000",
			style: "solid",
			radius: 8,
		},
		textOffsetX = 0,
		textOffsetY = 0,
	} = props

	const isFixedWidth = props?.style && props.style.width === "100%"

	const [displayedText, setDisplayedText] = useState("")
	const [currentIndex, setCurrentIndex] = useState(0)
	const [currentStringIndex, setCurrentStringIndex] = useState(0)
	const [isDeleting, setIsDeleting] = useState(false)
	const [hasStarted, setHasStarted] = useState(false)
	const [isRevealed, setIsRevealed] = useState(false)

	// Transform text
	const transformText = (text: string): string => {
		switch (textTransform) {
			case "uppercase":
				return text.toUpperCase()
			case "lowercase":
				return text.toLowerCase()
			case "capitalize":
				return text.replace(/\b\w/g, (char) => char.toUpperCase())
			default:
				return text
		}
	}

	const currentText = textStrings[currentStringIndex] || "Hello World"
	const transformedText = transformText(currentText)

	// Get next chunk based on mode
	const getNextChunk = (text: string, currentLength: number, isForward: boolean): number => {
		if (typewriterMode === "letters") {
			return isForward ? currentLength + 1 : currentLength - 1
		} else if (typewriterMode === "words") {
			if (isForward) {
				const remaining = text.slice(currentLength)
				const match = remaining.match(/^\s*\S+/)
				return match ? currentLength + match[0].length : text.length
			} else {
				const before = text.slice(0, currentLength)
				const match = before.match(/\S+\s*$/)
				return match ? currentLength - match[0].length : 0
			}
		} else {
			if (isForward) {
				const remaining = text.slice(currentLength)
				const match = remaining.match(/^[^.!?]*[.!?]\s*/)
				return match ? currentLength + match[0].length : text.length
			} else {
				const before = text.slice(0, currentLength)
				const match = before.match(/[^.!?]*[.!?]\s*$/)
				return match ? currentLength - match[0].length : 0
			}
		}
	}

	// Calculate typing speed from easing
	const getTypingSpeed = () => {
		// Base speed of 100ms, can be adjusted based on easing type
		return 100
	}

	// Reveal animation on mount
	useEffect(() => {
		if (animationEffect === "reveal" && typeof window !== "undefined") {
			const revealTimeout = window.setTimeout(() => {
				startTransition(() => setIsRevealed(true))
			}, 100)
			return () => clearTimeout(revealTimeout)
		} else {
			setIsRevealed(true)
		}
	}, [animationEffect])

	// Typewriter effect - only run when animationEffect is "typewriter"
	useEffect(() => {
		if (animationEffect !== "typewriter") {
			setDisplayedText(transformedText)
			return
		}

		if (typeof window === "undefined") {
			setDisplayedText(transformedText)
			return
		}

		if (!hasStarted) {
			const delayTimeout = window.setTimeout(() => {
				startTransition(() => setHasStarted(true))
			}, startDelay)
			return () => clearTimeout(delayTimeout)
		}

		let timeout: number
		const typingSpeed = getTypingSpeed()

		if (!isDeleting && currentIndex < transformedText.length) {
			timeout = window.setTimeout(() => {
				const nextIndex = getNextChunk(transformedText, currentIndex, true)
				startTransition(() => {
					setDisplayedText(transformedText.slice(0, nextIndex))
					setCurrentIndex(nextIndex)
				})
			}, typingSpeed)
		} else if (!isDeleting && currentIndex === transformedText.length && loopAnimation) {
			timeout = window.setTimeout(() => {
				startTransition(() => setIsDeleting(true))
			}, pauseBetweenLoops)
		} else if (isDeleting && currentIndex > 0) {
			timeout = window.setTimeout(() => {
				const nextIndex = getNextChunk(transformedText, currentIndex, false)
				startTransition(() => {
					setDisplayedText(transformedText.slice(0, nextIndex))
					setCurrentIndex(nextIndex)
				})
			}, typingSpeed / 2)
		} else if (isDeleting && currentIndex === 0) {
			startTransition(() => {
				setIsDeleting(false)
				setCurrentStringIndex((prev) => (prev + 1) % textStrings.length)
			})
		}

		return () => {
			if (timeout) clearTimeout(timeout)
		}
	}, [animationEffect, currentIndex, transformedText, isDeleting, hasStarted, textStrings.length, loopAnimation, pauseBetweenLoops, startDelay])

	// Container border styles
	const borderStyles = containerBorder.enabled
		? {
				border: `${containerBorder.width}px ${containerBorder.style} ${containerBorder.color}`,
				borderRadius: `${containerBorder.radius}px`,
		  }
		: {
				borderRadius: `${containerBorder.radius}px`,
		  }

	// Get reveal animation variants
	const getRevealVariants = () => {
		const xDistance = revealDistanceX
		const yDistance = revealDistanceY
		
		const initial = {
			top: { y: yDistance, x: xDistance, opacity: 0 },
			bottom: { y: -yDistance, x: xDistance, opacity: 0 },
			left: { x: xDistance, y: yDistance, opacity: 0 },
			right: { x: -xDistance, y: yDistance, opacity: 0 },
		}

		return {
			initial: initial[revealDirection],
			animate: { x: 0, y: 0, opacity: 1 },
		}
	}

	const revealVariants = getRevealVariants()

	// Split text based on reveal mode
	const splitTextForReveal = (text: string) => {
		if (revealMode === "letters") {
			return text.split("")
		} else if (revealMode === "words") {
			// Split by words but keep spaces
			const parts: string[] = []
			const words = text.split(/(\s+)/)
			words.forEach(word => {
				if (word.length > 0) {
					parts.push(word)
				}
			})
			return parts
		} else {
			// Split by sentences
			const parts: string[] = []
			const sentences = text.split(/([.!?]+\s*)/)
			sentences.forEach(sentence => {
				if (sentence.length > 0) {
					parts.push(sentence)
				}
			})
			return parts
		}
	}

	const textParts = animationEffect === "reveal" ? splitTextForReveal(transformedText) : []

	return (
		<div
			style={{
				...props.style,
				position: "relative",
				boxSizing: "border-box",
				background: containerBackground,
				padding: `${containerPadding.top}px ${containerPadding.right}px ${containerPadding.bottom}px ${containerPadding.left}px`,
				...borderStyles,
				display: "flex",
				alignItems:
					verticalAlign === "top" ? "flex-start" : verticalAlign === "bottom" ? "flex-end" : "center",
				justifyContent:
					horizontalAlign === "left" ? "flex-start" : horizontalAlign === "right" ? "flex-end" : "center",
				overflow: "visible",
				...(isFixedWidth ? {} : { minWidth: "max-content" }),
			}}
		>
			<div
				style={{
					position: "relative",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems:
						verticalAlign === "top" ? "flex-start" : verticalAlign === "bottom" ? "flex-end" : "center",
					justifyContent:
						horizontalAlign === "left"
							? "flex-start"
							: horizontalAlign === "right"
								? "flex-end"
								: "center",
				}}
			>
				<div
					style={{
						position: "relative",
						display: "inline-block",
						transform: `translate(${textOffsetX}px, ${textOffsetY}px)`,
					}}
				>
					{animationEffect === "reveal" ? (
						<span
							style={{
								...font,
								position: "relative",
								color: enableGradient ? "transparent" : textColor,
								background: enableGradient
									? `linear-gradient(${gradientDirection}deg, ${gradientColors.color1}, ${gradientColors.color2}, ${gradientColors.color3}, ${gradientColors.color4})`
									: "none",
								backgroundSize: enableGradient ? "200% 200%" : "auto",
								WebkitBackgroundClip: enableGradient ? "text" : "unset",
								WebkitTextFillColor: enableGradient ? "transparent" : "unset",
								backgroundClip: enableGradient ? "text" : "unset",
								animation: enableGradient ? `gradientMove ${gradientSpeed}s ease infinite` : "none",
								width: isFixedWidth ? "100%" : "max-content",
								wordBreak: "break-word",
								whiteSpace: "pre-wrap",
								direction: textDirection,
								display: "inline",
							}}
						>
							{textParts.map((part, index) => {
								// Skip empty parts
								if (part.length === 0) return null
								
								return (
									<motion.span
										key={index}
										initial={revealVariants.initial}
										animate={revealVariants.animate}
										transition={{
											...revealEasing,
											delay: revealDelay / 1000 + (index * revealStagger) / 1000,
										}}
										style={{
											display: "inline-block",
											whiteSpace: part.trim().length === 0 ? "pre" : "normal",
										}}
									>
										{part}
									</motion.span>
								)
							})}
						</span>
					) : (
						<>
							{enableGradient && (
								<div
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
										background: `linear-gradient(${gradientDirection}deg, ${gradientColors.color1}, ${gradientColors.color2}, ${gradientColors.color3}, ${gradientColors.color4})`,
										backgroundSize: "200% 200%",
										animation: `gradientMove ${gradientSpeed}s ease infinite`,
										filter: gradientBlur > 0 ? `blur(${gradientBlur}px)` : "none",
										WebkitMaskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="0">${displayedText}</text></svg>')`,
										maskImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="0">${displayedText}</text></svg>')`,
										WebkitMaskSize: "contain",
										maskSize: "contain",
										WebkitMaskRepeat: "no-repeat",
										maskRepeat: "no-repeat",
										pointerEvents: "none",
									}}
								/>
							)}
							<span
								style={{
									...font,
									position: "relative",
									color: enableGradient ? "transparent" : textColor,
									background: enableGradient
										? `linear-gradient(${gradientDirection}deg, ${gradientColors.color1}, ${gradientColors.color2}, ${gradientColors.color3}, ${gradientColors.color4})`
										: "none",
									backgroundSize: enableGradient ? "200% 200%" : "auto",
									WebkitBackgroundClip: enableGradient ? "text" : "unset",
									WebkitTextFillColor: enableGradient ? "transparent" : "unset",
									backgroundClip: enableGradient ? "text" : "unset",
									animation: enableGradient ? `gradientMove ${gradientSpeed}s ease infinite` : "none",
									width: isFixedWidth ? "100%" : "max-content",
									wordBreak: "break-word",
									whiteSpace: "pre-wrap",
									direction: textDirection,
									display: "inline-block",
								}}
							>
								{displayedText}
							</span>
						</>
					)}
				</div>
				{showCursor && animationEffect === "typewriter" && (
					<motion.span
						style={{
							display: "inline-block",
							width: "2px",
							height: font.fontSize || "1em",
							backgroundColor: cursorColor,
							marginLeft: "2px",
							animation: "blink 1s step-end infinite",
							transform: `translate(${textOffsetX}px, ${textOffsetY}px)`,
						}}
					/>
				)}
			</div>
			<style>
				{`
					@keyframes blink {
						0%, 50% { opacity: 1; }
						51%, 100% { opacity: 0; }
					}
					@keyframes gradientMove {
						0% { background-position: 0% 50%; }
						50% { background-position: 100% 50%; }
						100% { background-position: 0% 50%; }
					}
				`}
			</style>
		</div>
	)
}

addPropertyControls(GradientTypewriter, {
	// Text Content Accordion
	textStrings: {
		type: ControlType.Array,
		title: "Text Strings",
		control: {
			type: ControlType.String,
		},
		defaultValue: ["Hello World"],
	},
	textTransform: {
		type: ControlType.Enum,
		title: "Transform",
		options: ["none", "uppercase", "lowercase", "capitalize"],
		optionTitles: ["None", "Uppercase", "Lowercase", "Capitalize"],
		defaultValue: "none",
	},
	textDirection: {
		type: ControlType.Enum,
		title: "Direction",
		options: ["ltr", "rtl"],
		optionTitles: ["Left to Right", "Right to Left"],
		defaultValue: "ltr",
		displaySegmentedControl: true,
	},

	// Typography Accordion
	font: {
		type: ControlType.Font,
		title: "Font",
		defaultValue: {
			fontSize: "40px",
			variant: "Bold",
			letterSpacing: "-0.04em",
			lineHeight: "1em",
		},
		controls: "extended",
		defaultFontType: "sans-serif",
	},
	textColor: {
		type: ControlType.Color,
		title: "Text Color",
		defaultValue: "#000000",
	},
	horizontalAlign: {
		type: ControlType.Enum,
		title: "Horizontal Align",
		options: ["left", "center", "right"],
		optionTitles: ["Left", "Center", "Right"],
		defaultValue: "left",
		displaySegmentedControl: true,
	},
	verticalAlign: {
		type: ControlType.Enum,
		title: "Vertical Align",
		options: ["top", "center", "bottom"],
		optionTitles: ["Top", "Center", "Bottom"],
		defaultValue: "center",
		displaySegmentedControl: true,
	},

	// Animation Accordion
	animationEffect: {
		type: ControlType.Enum,
		title: "Effect",
		options: ["typewriter", "reveal"],
		optionTitles: ["Typewriter", "Reveal"],
		defaultValue: "typewriter",
	},

	// Typewriter
	typewriterMode: {
		type: ControlType.Enum,
		title: "Mode",
		options: ["letters", "words", "sentences"],
		optionTitles: ["Letters", "Words", "Sentences"],
		defaultValue: "letters",
	},
	typewriterEasing: {
		type: ControlType.Transition,
		title: "Easing",
		defaultValue: {
			type: "spring",
			stiffness: 100,
			damping: 20,
		},
	},
	startDelay: {
		type: ControlType.Number,
		title: "Start Delay",
		defaultValue: 0,
		min: 0,
		max: 10000,
		step: 100,
		unit: "ms",
	},
	loopAnimation: {
		type: ControlType.Boolean,
		title: "Loop",
		defaultValue: true,
		enabledTitle: "On",
		disabledTitle: "Off",
	},
	pauseBetweenLoops: {
		type: ControlType.Number,
		title: "Pause Duration",
		defaultValue: 2000,
		min: 500,
		max: 5000,
		step: 100,
		unit: "ms",
	},
	showCursor: {
		type: ControlType.Boolean,
		title: "Show Cursor",
		defaultValue: true,
		enabledTitle: "Show",
		disabledTitle: "Hide",
	},
	cursorColor: {
		type: ControlType.Color,
		title: "Cursor Color",
		defaultValue: "#000000",
	},

	// Reveal Animation Accordion
	revealMode: {
		type: ControlType.Enum,
		title: "Mode",
		options: ["letters", "words", "sentences"],
		optionTitles: ["Letters", "Words", "Sentences"],
		defaultValue: "letters",
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealDirection: {
		type: ControlType.Enum,
		title: "Reveal Direction",
		options: ["top", "bottom", "left", "right"],
		optionTitles: ["Top", "Bottom", "Left", "Right"],
		defaultValue: "bottom",
		displaySegmentedControl: true,
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealDistanceX: {
		type: ControlType.Number,
		title: "Distance X",
		defaultValue: 0,
		min: -200,
		max: 200,
		step: 5,
		unit: "px",
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealDistanceY: {
		type: ControlType.Number,
		title: "Distance Y",
		defaultValue: 50,
		min: -200,
		max: 200,
		step: 5,
		unit: "px",
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealStagger: {
		type: ControlType.Number,
		title: "Stagger",
		defaultValue: 50,
		min: 0,
		max: 1000,
		step: 10,
		unit: "ms",
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealEasing: {
		type: ControlType.Transition,
		title: "Easing",
		defaultValue: {
			type: "spring",
			stiffness: 100,
			damping: 20,
		},
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},
	revealDelay: {
		type: ControlType.Number,
		title: "Delay",
		defaultValue: 0,
		min: 0,
		max: 5000,
		step: 100,
		unit: "ms",
		hidden: ({ animationEffect }) => animationEffect !== "reveal",
	},

	// Gradient Accordion
	enableGradient: {
		type: ControlType.Boolean,
		title: "Enable Gradient",
		defaultValue: false,
		enabledTitle: "On",
		disabledTitle: "Off",
	},
	gradientColors: {
		type: ControlType.Object,
		title: "Gradient Colors",
		controls: {
			color1: {
				type: ControlType.Color,
				title: "Color 1",
				defaultValue: "#FF0080",
			},
			color2: {
				type: ControlType.Color,
				title: "Color 2",
				defaultValue: "#7928CA",
			},
			color3: {
				type: ControlType.Color,
				title: "Color 3",
				defaultValue: "#0070F3",
			},
			color4: {
				type: ControlType.Color,
				title: "Color 4",
				defaultValue: "#00DFD8",
			},
		},
		defaultValue: {
			color1: "#FF0080",
			color2: "#7928CA",
			color3: "#0070F3",
			color4: "#00DFD8",
		},
		hidden: ({ enableGradient }) => !enableGradient,
	},
	gradientDirection: {
		type: ControlType.Number,
		title: "Direction",
		defaultValue: 45,
		min: 0,
		max: 360,
		step: 1,
		unit: "deg",
		hidden: ({ enableGradient }) => !enableGradient,
	},
	gradientBlur: {
		type: ControlType.Number,
		title: "Blur",
		defaultValue: 0,
		min: 0,
		max: 50,
		step: 1,
		unit: "px",
		hidden: ({ enableGradient }) => !enableGradient,
	},
	gradientSpeed: {
		type: ControlType.Number,
		title: "Animation Speed",
		defaultValue: 3,
		min: 0.5,
		max: 10,
		step: 0.5,
		unit: "s",
		hidden: ({ enableGradient }) => !enableGradient,
	},
	gradientEasing: {
		type: ControlType.Transition,
		title: "Easing",
		defaultValue: {
			type: "tween",
			ease: "linear",
		},
		hidden: ({ enableGradient }) => !enableGradient,
	},

	// Container Accordion
	containerBackground: {
		type: ControlType.Color,
		title: "Background",
		defaultValue: "#FFFFFF",
	},
	containerPadding: {
		type: ControlType.Object,
		title: "Padding",
		controls: {
			top: {
				type: ControlType.Number,
				title: "Top",
				defaultValue: 20,
				min: 0,
				max: 100,
				step: 1,
				unit: "px",
			},
			right: {
				type: ControlType.Number,
				title: "Right",
				defaultValue: 20,
				min: 0,
				max: 100,
				step: 1,
				unit: "px",
			},
			bottom: {
				type: ControlType.Number,
				title: "Bottom",
				defaultValue: 20,
				min: 0,
				max: 100,
				step: 1,
				unit: "px",
			},
			left: {
				type: ControlType.Number,
				title: "Left",
				defaultValue: 20,
				min: 0,
				max: 100,
				step: 1,
				unit: "px",
			},
		},
		defaultValue: {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20,
		},
	},
	containerBorder: {
		type: ControlType.Object,
		title: "Border",
		controls: {
			enabled: {
				type: ControlType.Boolean,
				title: "Enable",
				defaultValue: false,
				enabledTitle: "On",
				disabledTitle: "Off",
			},
			width: {
				type: ControlType.Number,
				title: "Width",
				defaultValue: 2,
				min: 1,
				max: 20,
				step: 1,
				unit: "px",
			},
			color: {
				type: ControlType.Color,
				title: "Color",
				defaultValue: "#000000",
			},
			style: {
				type: ControlType.Enum,
				title: "Style",
				options: ["solid", "dashed", "dotted"],
				optionTitles: ["Solid", "Dashed", "Dotted"],
				defaultValue: "solid",
			},
			radius: {
				type: ControlType.Number,
				title: "Radius",
				defaultValue: 8,
				min: 0,
				max: 50,
				step: 1,
				unit: "px",
			},
		},
		defaultValue: {
			enabled: false,
			width: 2,
			color: "#000000",
			style: "solid",
			radius: 8,
		},
	},

	// Positioning Accordion
	textOffsetX: {
		type: ControlType.Number,
		title: "Offset X",
		defaultValue: 0,
		min: -500,
		max: 500,
		step: 1,
		unit: "px",
	},
	textOffsetY: {
		type: ControlType.Number,
		title: "Offset Y",
		defaultValue: 0,
		min: -500,
		max: 500,
		step: 1,
		unit: "px",
	},
})