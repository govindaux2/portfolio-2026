// Image container with option to open in new tab and image upload control
import { addPropertyControls, ControlType } from "framer"
import type { CSSProperties } from "react"

interface ImageContainerProps {
    image: {
        src: string
        alt?: string
    }
    enableOpenInNewTab: boolean
    objectFit: "contain" | "cover" | "fill" | "none"
    borderRadius: number
    style?: CSSProperties
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 */
export default function ImageContainer(props: ImageContainerProps) {
    const {
        image = {
            src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg",
            alt: "Gradient 1 - Blue",
        },
        enableOpenInNewTab = true,
        objectFit = "cover",
        borderRadius = 0,
        style,
    } = props

    const handleClick = () => {
        if (enableOpenInNewTab && typeof window !== "undefined") {
            window.open(image.src, "_blank", "noopener,noreferrer")
        }
    }

    const containerStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        cursor: enableOpenInNewTab ? "pointer" : "default",
        borderRadius: `${borderRadius}px`,
        ...style,
    }

    const imageStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        objectFit: objectFit,
        display: "block",
    }

    return (
        <div
            style={containerStyle}
            onClick={handleClick}
            role={enableOpenInNewTab ? "button" : undefined}
            tabIndex={enableOpenInNewTab ? 0 : undefined}
            onKeyDown={
                enableOpenInNewTab
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              handleClick()
                          }
                      }
                    : undefined
            }
            aria-label={enableOpenInNewTab ? "Open image in new tab" : undefined}
        >
            <img src={image.src} alt={image.alt || ""} style={imageStyle} />
        </div>
    )
}

addPropertyControls(ImageContainer, {
    image: {
        type: ControlType.ResponsiveImage,
        title: "Image",
    },
    enableOpenInNewTab: {
        type: ControlType.Boolean,
        title: "Open in New Tab",
        defaultValue: true,
        enabledTitle: "Enabled",
        disabledTitle: "Disabled",
    },
    objectFit: {
        type: ControlType.Enum,
        title: "Object Fit",
        options: ["contain", "cover", "fill", "none"],
        optionTitles: ["Contain", "Cover", "Fill", "None"],
        defaultValue: "cover",
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
})