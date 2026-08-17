// Single source of truth for the orbit camera's azimuth. BOTH the follow-camera
// (Player.jsx) and the movement mapping read this, which is what keeps controls
// camera-relative and consistent: "up" on the stick always means "away from the
// camera", no matter how the view is rotated.
//
// Module-level mutable object (like playerPos) so writing it never triggers a
// React re-render - it's read inside useFrame every frame.
export const cameraRig = {
  azimuth: 0, // radians. 0 = default view (camera due south of the player).
  dist: 11, // horizontal follow distance
  height: 7, // camera height above ground (driven by pitch)
  pitch: 0, // -1 (looking up) .. +1 (looking down); height derives from this
  lastLook: 0, // when the child last steered the camera (auto-follow waits 3s)
}

const TWO_PI = Math.PI * 2

// Nudge the azimuth. SIGN CONVENTION (Round 3, D1): callers pass +delta for a
// rightward drag and the VIEW must rotate RIGHT. The camera orbits the player
// at angle `azimuth`; DECREASING azimuth swings the camera clockwise (viewed
// from above), which pans the view to the right. So +delta -> azimuth -= delta.
export function rotateCamera(delta) {
  cameraRig.lastLook = Date.now()
  let a = cameraRig.azimuth - delta
  if (a > Math.PI) a -= TWO_PI
  else if (a < -Math.PI) a += TWO_PI
  cameraRig.azimuth = a
}

// Vertical look (same-direction: drag up = look up -> camera lowers).
export function pitchCamera(delta) {
  cameraRig.lastLook = Date.now()
  cameraRig.pitch = Math.max(-1, Math.min(1, cameraRig.pitch + delta))
  cameraRig.height = 7 + cameraRig.pitch * 5 // 2 (looking up) .. 12 (looking down)
}

// R10 v8 1.4: kid-safe pinch zoom - clamped so nobody gets lost in a wall.
export function zoomCamera(delta) {
  cameraRig.lastLook = Date.now()
  cameraRig.dist = Math.max(7, Math.min(16, cameraRig.dist + delta))
}