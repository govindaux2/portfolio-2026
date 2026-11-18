import { useMemo } from 'react'
import { ShaderFill } from './lib/custom-effect-runtime/index'
import {
  setup as setupMovingGradient,
  render as renderMovingGradient,
  manifest as manifestMovingGradient,
} from './lib/custom-effects/CodeComponentId_8ce92017e53431a2f04b3574f4ba7c98f6f55f1e_8358'

/** Figma frame 1:582, 273 × 151. The fill is the authored “Moving gradient” shader. */
export function Frame1() {
  const shader = useMemo(
    () => ({
      setup: setupMovingGradient,
      render: renderMovingGradient,
      params: {
        intensity: 1.3899999856948853,
        gradient: {
          stops: [
            { position: 0, color: { r: 1, g: 0.9137254953384399, b: 0.6196078658103943, a: 1 } },
            { position: 0.5, color: { r: 0.5058823823928833, g: 0.47058823704719543, b: 1, a: 1 } },
            { position: 1, color: { r: 1, g: 0, b: 0.6078431606292725, a: 1 } },
          ],
        },
        gradientBalance: 0,
        material: 0,
        morphSpeed: 3.740000009536743,
        detail: 0.6800000071525574,
        twist: 3.619999885559082,
        zoom: 19,
        gradientMethod: 2,
        warp: 0.5799999833106995,
        rotationSpeed: 27,
      },
      manifest: manifestMovingGradient,
    }),
    [],
  )

  return (
    <div data-node-id="1:582" style={{ position: 'relative', width: 273, height: 151 }}>
      <ShaderFill shader={shader} width={273} height={151} style={{ position: 'absolute', inset: 0 }} />
    </div>
  )
}
