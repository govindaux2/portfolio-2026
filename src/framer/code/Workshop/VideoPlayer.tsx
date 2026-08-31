// Lightweight, high-performance Video Player component with fullscreen, orientation toggle, and timeline scrubbing
import { useRef, useState, useEffect, useCallback, startTransition, type CSSProperties } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion, AnimatePresence } from "framer-motion"

interface VideoPlayerProps {
    videoUrl: string
    autoplay: boolean
    loop: boolean
    muted: boolean
    orientation: "portrait" | "landscape"
    showControls: {
        playPause: boolean
        fullscreen: boolean
        timeline: boolean
        closeButton: boolean
    }
    backgroundColor: string
    accentColor: string
    videoOffsetX: number
    videoOffsetY: number
    videoAlignment: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right"
    containerBackground: string
    showStroke: boolean
    strokeColor: string
    strokeWidth: number
    cornerRadius: number
    enableHoldBehavior: boolean
    holdBehavior: "speed-up" | "pause"
    holdSpeedMultiplier: number
    enableDoubleTap: boolean
    skipSeconds: number
    tapToPause: boolean
    videoScale: number
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function VideoPlayer(props: VideoPlayerProps) {
    const {
        videoUrl = "https://framerusercontent.com/assets/MLWPbW1dUQawJLhhun3dBwpgJak.mp4",
        autoplay = true,
        loop = true,
        muted = true,
        orientation = "landscape",
        showControls = {
            playPause: true,
            fullscreen: true,
            timeline: true,
            closeButton: true,
        },
        backgroundColor = "#000000",
        accentColor = "#FFFFFF",
        videoOffsetX = 0,
        videoOffsetY = 0,
        videoAlignment = "center",
        containerBackground = "#000000",
        showStroke = false,
        strokeColor = "#FFFFFF",
        strokeWidth = 2,
        cornerRadius = 0,
        enableHoldBehavior = true,
        holdBehavior = "speed-up",
        holdSpeedMultiplier = 2,
        enableDoubleTap = true,
        skipSeconds = 10,
        tapToPause = true,
        videoScale = 1,
    } = props

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrubberRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isPlaying, setIsPlaying] = useState(autoplay)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showUI, setShowUI] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isDraggingScrubber, setIsDraggingScrubber] = useState(false)
    const hideTimeoutRef = useRef<number | null>(null)
    const [isSpeedingUp, setIsSpeedingUp] = useState(false)
    const [isHoldingToPause, setIsHoldingToPause] = useState(false)
    const [skipDirection, setSkipDirection] = useState<"forward" | "backward" | null>(null)
    const lastTapRef = useRef<number>(0)
    const lastTapSideRef = useRef<"left" | "right" | null>(null)
    const normalPlaybackRate = useRef<number>(1)
    const wasFullscreenBeforeOrientationChange = useRef<boolean>(false)
    const isHoldingRef = useRef<boolean>(false)
    const tapTimeoutRef = useRef<number | null>(null)

    const isPortrait = orientation === "portrait"

    const scheduleHideUI = useCallback(() => {
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
        }
        hideTimeoutRef.current = window.setTimeout(() => {
            if (!isDraggingScrubber && !isHovering) {
                startTransition(() => setShowUI(false))
            }
        }, 3000)
    }, [isDraggingScrubber, isHovering])

    const handleShowUI = useCallback(() => {
        startTransition(() => setShowUI(true))
        scheduleHideUI()
    }, [scheduleHideUI])

    const handleMouseEnter = useCallback(() => {
        startTransition(() => setIsHovering(true))
        handleShowUI()
    }, [handleShowUI])

    const handleMouseLeave = useCallback(() => {
        startTransition(() => setIsHovering(false))
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
        }
        startTransition(() => setShowUI(false))
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            if (!isDraggingScrubber) {
                startTransition(() => setCurrentTime(video.currentTime))
            }
        }

        const handleLoadedMetadata = () => {
            startTransition(() => setDuration(video.duration))
        }

        const handlePlay = () => {
            startTransition(() => setIsPlaying(true))
            scheduleHideUI()
        }

        const handlePause = () => {
            startTransition(() => setIsPlaying(false))
        }

        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("loadedmetadata", handleLoadedMetadata)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("loadedmetadata", handleLoadedMetadata)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
        }
    }, [scheduleHideUI, isDraggingScrubber])

    useEffect(() => {
        if (showUI && !isHovering && !isDraggingScrubber) {
            scheduleHideUI()
        }
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current)
            }
        }
    }, [showUI, isHovering, isDraggingScrubber, scheduleHideUI])

    const togglePlayPause = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            video.play()
        } else {
            video.pause()
        }
    }, [])

    const handleVideoMouseDown = useCallback((e: React.MouseEvent) => {
        if (!enableHoldBehavior || isDraggingScrubber) return
        
        e.preventDefault()
        e.stopPropagation()
        isHoldingRef.current = true
        
        const video = videoRef.current
        if (!video) return

        if (holdBehavior === "speed-up") {
            normalPlaybackRate.current = video.playbackRate
            video.playbackRate = holdSpeedMultiplier
            startTransition(() => setIsSpeedingUp(true))
        } else if (holdBehavior === "pause") {
            if (!video.paused) {
                video.pause()
                startTransition(() => setIsHoldingToPause(true))
            }
        }
    }, [enableHoldBehavior, holdBehavior, holdSpeedMultiplier, isDraggingScrubber])

    const handleVideoMouseUp = useCallback(() => {
        if (!enableHoldBehavior || !isHoldingRef.current) return
        
        isHoldingRef.current = false
        const video = videoRef.current
        if (!video) return

        if (holdBehavior === "speed-up" && isSpeedingUp) {
            video.playbackRate = normalPlaybackRate.current
            startTransition(() => setIsSpeedingUp(false))
        } else if (holdBehavior === "pause" && isHoldingToPause) {
            video.play()
            startTransition(() => setIsHoldingToPause(false))
        }
    }, [enableHoldBehavior, holdBehavior, isSpeedingUp, isHoldingToPause])

    const handleVideoTouchStart = useCallback((e: React.TouchEvent) => {
        if (!enableHoldBehavior || isDraggingScrubber) return
        
        e.preventDefault()
        e.stopPropagation()
        isHoldingRef.current = true
        
        const video = videoRef.current
        if (!video) return

        if (holdBehavior === "speed-up") {
            normalPlaybackRate.current = video.playbackRate
            video.playbackRate = holdSpeedMultiplier
            startTransition(() => setIsSpeedingUp(true))
        } else if (holdBehavior === "pause") {
            if (!video.paused) {
                video.pause()
                startTransition(() => setIsHoldingToPause(true))
            }
        }
    }, [enableHoldBehavior, holdBehavior, holdSpeedMultiplier, isDraggingScrubber])

    const handleVideoTouchEnd = useCallback(() => {
        if (!enableHoldBehavior || !isHoldingRef.current) return
        
        isHoldingRef.current = false
        const video = videoRef.current
        if (!video) return

        if (holdBehavior === "speed-up" && isSpeedingUp) {
            video.playbackRate = normalPlaybackRate.current
            startTransition(() => setIsSpeedingUp(false))
        } else if (holdBehavior === "pause" && isHoldingToPause) {
            video.play()
            startTransition(() => setIsHoldingToPause(false))
        }
    }, [enableHoldBehavior, holdBehavior, isSpeedingUp, isHoldingToPause])

    const skipVideo = useCallback((direction: "forward" | "backward") => {
        const video = videoRef.current
        if (!video) return

        const skipAmount = direction === "forward" ? skipSeconds : -skipSeconds
        video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + skipAmount))
        
        startTransition(() => setSkipDirection(direction))
        setTimeout(() => {
            startTransition(() => setSkipDirection(null))
        }, 500)
    }, [skipSeconds])

    const handleVideoClick = useCallback((e: React.MouseEvent) => {
        // Ignore if dragging scrubber or holding
        if (isDraggingScrubber || isHoldingRef.current) {
            return
        }

        if (!enableDoubleTap && !tapToPause) {
            return
        }

        const now = Date.now()
        const timeSinceLastTap = now - lastTapRef.current
        
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const side: "left" | "right" = clickX < rect.width / 2 ? "left" : "right"

        // Clear any existing tap timeout
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current)
            tapTimeoutRef.current = null
        }

        if (enableDoubleTap && timeSinceLastTap < 300 && lastTapSideRef.current === side) {
            // Double tap detected
            e.stopPropagation()
            skipVideo(side === "left" ? "backward" : "forward")
            lastTapRef.current = 0
            lastTapSideRef.current = null
        } else {
            // Single tap - wait to see if it's a double tap
            lastTapRef.current = now
            lastTapSideRef.current = side
            
            if (tapToPause) {
                tapTimeoutRef.current = window.setTimeout(() => {
                    if (lastTapRef.current === now) {
                        togglePlayPause()
                    }
                    tapTimeoutRef.current = null
                }, 300)
            }
        }
    }, [enableDoubleTap, tapToPause, skipVideo, togglePlayPause, isDraggingScrubber])

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isHoldingRef.current) {
                handleVideoMouseUp()
            }
        }
        
        const handleGlobalTouchEnd = () => {
            if (isHoldingRef.current) {
                handleVideoTouchEnd()
            }
        }

        window.addEventListener("mouseup", handleGlobalMouseUp)
        window.addEventListener("touchend", handleGlobalTouchEnd)
        
        return () => {
            window.removeEventListener("mouseup", handleGlobalMouseUp)
            window.removeEventListener("touchend", handleGlobalTouchEnd)
        }
    }, [handleVideoMouseUp, handleVideoTouchEnd])

    const toggleFullscreen = useCallback(() => {
        startTransition(() => setIsFullscreen((prev) => !prev))
        handleShowUI()
    }, [handleShowUI])

    const updateScrubberFromPosition = useCallback((clientX: number, rect: DOMRect) => {
        const video = videoRef.current
        if (!video || duration === 0) return

        const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
        const percentage = x / rect.width
        const newTime = percentage * duration

        video.currentTime = newTime
        startTransition(() => setCurrentTime(newTime))
    }, [duration])

    const handleScrubberMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        
        const rect = e.currentTarget.getBoundingClientRect()
        updateScrubberFromPosition(e.clientX, rect)
        
        startTransition(() => setIsDraggingScrubber(true))
    }, [updateScrubberFromPosition])

    const handleScrubberTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        
        const touch = e.touches[0]
        const rect = e.currentTarget.getBoundingClientRect()
        updateScrubberFromPosition(touch.clientX, rect)
        
        startTransition(() => setIsDraggingScrubber(true))
    }, [updateScrubberFromPosition])

    useEffect(() => {
        if (!isDraggingScrubber) return

        const handleGlobalMouseMove = (e: MouseEvent) => {
            const scrubber = scrubberRef.current
            if (!scrubber) return
            
            const rect = scrubber.getBoundingClientRect()
            updateScrubberFromPosition(e.clientX, rect)
        }

        const handleGlobalTouchMove = (e: TouchEvent) => {
            const scrubber = scrubberRef.current
            if (!scrubber) return
            
            const touch = e.touches[0]
            const rect = scrubber.getBoundingClientRect()
            updateScrubberFromPosition(touch.clientX, rect)
        }

        const handleGlobalMouseUp = () => {
            startTransition(() => setIsDraggingScrubber(false))
        }

        const handleGlobalTouchEnd = () => {
            startTransition(() => setIsDraggingScrubber(false))
        }

        window.addEventListener("mousemove", handleGlobalMouseMove)
        window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false })
        window.addEventListener("mouseup", handleGlobalMouseUp)
        window.addEventListener("touchend", handleGlobalTouchEnd)

        return () => {
            window.removeEventListener("mousemove", handleGlobalMouseMove)
            window.removeEventListener("touchmove", handleGlobalTouchMove)
            window.removeEventListener("mouseup", handleGlobalMouseUp)
            window.removeEventListener("touchend", handleGlobalTouchEnd)
        }
    }, [isDraggingScrubber, updateScrubberFromPosition])

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const getAlignmentStyles = () => {
        const alignmentMap = {
            "top-left": { alignItems: "flex-start", justifyContent: "flex-start" },
            "top-center": { alignItems: "flex-start", justifyContent: "center" },
            "top-right": { alignItems: "flex-start", justifyContent: "flex-end" },
            "center-left": { alignItems: "center", justifyContent: "flex-start" },
            "center": { alignItems: "center", justifyContent: "center" },
            "center-right": { alignItems: "center", justifyContent: "flex-end" },
            "bottom-left": { alignItems: "flex-end", justifyContent: "flex-start" },
            "bottom-center": { alignItems: "flex-end", justifyContent: "center" },
            "bottom-right": { alignItems: "flex-end", justifyContent: "flex-end" },
        }
        return alignmentMap[videoAlignment]
    }

    const videoStyle: CSSProperties = isFullscreen
        ? {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "contain",
              zIndex: 9999,
          }
        : {
              width: isPortrait ? "auto" : "100%",
              height: isPortrait ? "100%" : "auto",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transform: `translate(${videoOffsetX}px, ${videoOffsetY}px) scale(${videoScale})`,
          }

    const isTransparent = containerBackground === "rgba(0, 0, 0, 0)" || containerBackground === "transparent"

    useEffect(() => {
        const handleOrientationChange = () => {
            if (isFullscreen) {
                wasFullscreenBeforeOrientationChange.current = true
            }
        }

        if (typeof window !== "undefined") {
            window.addEventListener("orientationchange", handleOrientationChange)
            window.addEventListener("resize", handleOrientationChange)
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("orientationchange", handleOrientationChange)
                window.removeEventListener("resize", handleOrientationChange)
            }
        }
    }, [isFullscreen])

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current)
            }
            if (tapTimeoutRef.current) {
                clearTimeout(tapTimeoutRef.current)
            }
        }
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: isTransparent ? "transparent" : containerBackground,
                overflow: "hidden",
                display: "flex",
                ...getAlignmentStyles(),
                border: showStroke ? `${strokeWidth}px solid ${strokeColor}` : "none",
                borderRadius: cornerRadius,
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none",
                cursor: "default",
            }}
            onClick={handleShowUI}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleShowUI}
            onMouseLeave={handleMouseLeave}
        >
            {/* Fullscreen Black Overlay */}
            {isFullscreen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "#000000",
                        zIndex: 9998,
                        pointerEvents: "none",
                    }}
                />
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                autoPlay={autoplay}
                loop={loop}
                muted={muted}
                playsInline
                preload="auto"
                style={{
                    ...videoStyle,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    WebkitTouchCallout: "none",
                    cursor: "default",
                }}
                onClick={handleVideoClick}
                onMouseDown={handleVideoMouseDown}
                onMouseUp={handleVideoMouseUp}
                onTouchStart={handleVideoTouchStart}
                onTouchEnd={handleVideoTouchEnd}
            />

            {/* Skip Indicator */}
            <AnimatePresence>
                {skipDirection && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: isFullscreen ? "fixed" : "absolute",
                            top: "50%",
                            left: skipDirection === "backward" ? "25%" : "75%",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: accentColor,
                            padding: 16,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: isFullscreen ? 10001 : 2,
                            pointerEvents: "none",
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            {skipDirection === "forward" ? (
                                <>
                                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                                    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">
                                        {skipSeconds}
                                    </text>
                                </>
                            ) : (
                                <>
                                    <path d="M11 18V6l-8.5 6 8.5 6z" />
                                    <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">
                                        {skipSeconds}
                                    </text>
                                </>
                            )}
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {(showControls.playPause || showControls.fullscreen || showControls.timeline || showControls.closeButton) && (
                <AnimatePresence>
                    {showUI && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: isFullscreen ? "fixed" : "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                                zIndex: isFullscreen ? 10000 : 1,
                                cursor: "default",
                            }}
                        >
                            {/* Top Controls */}
                            {showControls.closeButton && isFullscreen && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        padding: 16,
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 12,
                                        pointerEvents: "auto",
                                    }}
                                >
                                    <button
                                        onClick={toggleFullscreen}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            border: "none",
                                            backgroundColor: "rgba(0,0,0,0.6)",
                                            color: accentColor,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                        aria-label="Close fullscreen"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Bottom Controls */}
                            {(showControls.timeline || showControls.playPause || showControls.fullscreen) && (
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        padding: 16,
                                        pointerEvents: "auto",
                                    }}
                                >
                                    {/* Timeline Scrubber */}
                                    {showControls.timeline && (
                                        <div
                                            ref={scrubberRef}
                                            style={{
                                                width: "100%",
                                                height: 8,
                                                backgroundColor: "rgba(255,255,255,0.3)",
                                                borderRadius: 4,
                                                cursor: isDraggingScrubber ? "grabbing" : "pointer",
                                                position: "relative",
                                                marginBottom: 12,
                                                padding: "8px 0",
                                                touchAction: "none",
                                            }}
                                            onMouseDown={handleScrubberMouseDown}
                                            onTouchStart={handleScrubberTouchStart}
                                        >
                                            <div
                                                style={{
                                                    width: `${progress}%`,
                                                    height: "100%",
                                                    backgroundColor: accentColor,
                                                    borderRadius: 4,
                                                    position: "relative",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        right: -8,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: "50%",
                                                        backgroundColor: accentColor,
                                                        cursor: isDraggingScrubber ? "grabbing" : "grab",
                                                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Control Buttons */}
                                    {(showControls.playPause || showControls.fullscreen) && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            {showControls.playPause && (
                                                <button
                                                    onClick={togglePlayPause}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        border: "none",
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        color: accentColor,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    aria-label={isPlaying ? "Pause" : "Play"}
                                                >
                                                    {isPlaying ? (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            )}

                                            {!isFullscreen && showControls.fullscreen && (
                                                <button
                                                    onClick={toggleFullscreen}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        border: "none",
                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                        color: accentColor,
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    aria-label="Fullscreen"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}

addPropertyControls(VideoPlayer, {
    videoUrl: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    autoplay: {
        type: ControlType.Boolean,
        title: "Autoplay",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    muted: {
        type: ControlType.Boolean,
        title: "Muted",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    orientation: {
        type: ControlType.Enum,
        title: "Orientation",
        options: ["portrait", "landscape"],
        optionTitles: ["Portrait (9:16)", "Landscape (16:9)"],
        defaultValue: "landscape",
        displaySegmentedControl: true,
    },
    showControls: {
        type: ControlType.Object,
        title: "Show Controls",
        controls: {
            playPause: {
                type: ControlType.Boolean,
                title: "Play/Pause Button",
                defaultValue: true,
                enabledTitle: "Show",
                disabledTitle: "Hide",
            },
            fullscreen: {
                type: ControlType.Boolean,
                title: "Fullscreen Button",
                defaultValue: true,
                enabledTitle: "Show",
                disabledTitle: "Hide",
            },
            timeline: {
                type: ControlType.Boolean,
                title: "Timeline Scrubber",
                defaultValue: true,
                enabledTitle: "Show",
                disabledTitle: "Hide",
            },
            closeButton: {
                type: ControlType.Boolean,
                title: "Close Button",
                defaultValue: true,
                enabledTitle: "Show",
                disabledTitle: "Hide",
            },
        },
        defaultValue: {
            playPause: true,
            fullscreen: true,
            timeline: true,
            closeButton: true,
        },
    },
    tapToPause: {
        type: ControlType.Boolean,
        title: "Tap to Pause",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    enableHoldBehavior: {
        type: ControlType.Boolean,
        title: "Hold Behavior",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    holdBehavior: {
        type: ControlType.Enum,
        title: "Hold Action",
        options: ["speed-up", "pause"],
        optionTitles: ["Speed Up", "Pause"],
        defaultValue: "speed-up",
        hidden: ({ enableHoldBehavior }) => !enableHoldBehavior,
    },
    holdSpeedMultiplier: {
        type: ControlType.Number,
        title: "Speed Multiplier",
        defaultValue: 2,
        min: 1.5,
        max: 4,
        step: 0.5,
        hidden: ({ enableHoldBehavior, holdBehavior }) => !enableHoldBehavior || holdBehavior !== "speed-up",
    },
    enableDoubleTap: {
        type: ControlType.Boolean,
        title: "Double Tap to Skip",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    skipSeconds: {
        type: ControlType.Number,
        title: "Skip Duration",
        defaultValue: 10,
        min: 5,
        max: 30,
        step: 5,
        unit: "s",
        hidden: ({ enableDoubleTap }) => !enableDoubleTap,
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#000000",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#FFFFFF",
    },
    videoOffsetX: {
        type: ControlType.Number,
        title: "Video Offset X",
        defaultValue: 0,
    },
    videoOffsetY: {
        type: ControlType.Number,
        title: "Video Offset Y",
        defaultValue: 0,
    },
    videoAlignment: {
        type: ControlType.Enum,
        title: "Video Alignment",
        options: [
            "top-left",
            "top-center",
            "top-right",
            "center-left",
            "center",
            "center-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
        ],
        optionTitles: [
            "Top Left",
            "Top Center",
            "Top Right",
            "Center Left",
            "Center",
            "Center Right",
            "Bottom Left",
            "Bottom Center",
            "Bottom Right",
        ],
        defaultValue: "center",
    },
    containerBackground: {
        type: ControlType.Color,
        title: "Container Background",
        defaultValue: "#000000",
    },
    showStroke: {
        type: ControlType.Boolean,
        title: "Show Stroke",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    strokeColor: {
        type: ControlType.Color,
        title: "Stroke Color",
        defaultValue: "#FFFFFF",
        hidden: ({ showStroke }) => !showStroke,
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke Width",
        defaultValue: 2,
        hidden: ({ showStroke }) => !showStroke,
    },
    cornerRadius: {
        type: ControlType.Number,
        title: "Corner Radius",
        defaultValue: 0,
    },
    videoScale: {
        type: ControlType.Number,
        title: "Video Scale",
        defaultValue: 1,
        min: 0.5,
        max: 10,
        step: 0.1,
    },
})