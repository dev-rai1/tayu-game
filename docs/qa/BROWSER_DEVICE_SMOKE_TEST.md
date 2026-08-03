# TAYU Browser and Device Smoke Test

Use this checklist before claiming broad browser compatibility or merging browser-specific UI changes.

## Required environments

- iPad Safari in portrait and landscape
- iPhone Safari
- Desktop Safari on macOS
- Chrome on Windows or macOS
- Microsoft Edge on Windows
- Firefox on Windows or macOS
- Android Chrome

Record the device, operating-system version, browser version, tester, date, and result for every run.

## Account and entry flow

- Open the home page with cleared site data.
- Confirm the cookie/browser-storage prompt is readable and does not cover the main call to action.
- Select necessary storage only and confirm the choice persists after refresh.
- Create or sign into a student account.
- Complete the pre-assessment and reach avatar creation.

## Avatar creation

- Change each visible avatar category and confirm the preview refreshes immediately.
- Make several rapid changes and confirm there is no stale avatar, black canvas, flashing loop, or crash.
- Rotate an iPad between portrait and landscape and confirm the preview remains visible.
- Confirm the page scrolls and all customization and entry buttons remain reachable.
- Confirm touch gestures inside the preview do not accidentally scroll or zoom the page.
- Confirm the fallback experience works when WebGL is disabled or unavailable.

## World navigation

- Enter the world and confirm the scene fills the usable viewport without a blank half-screen.
- Test movement, interaction, and camera controls.
- Rotate the device and confirm controls, instructions, and the world remain aligned.
- Confirm no fixed control is hidden behind Safari browser chrome or a device safe area.
- Confirm navigation still works after putting the browser in the background and returning.

## Instructions and overlays

- Confirm only one blocking lesson, decision, or dialog appears at a time.
- Confirm objectives, money statistics, and controls do not cover the active decision.
- Open Menu, then Learning & instructions, and verify the help content is readable and dismissible.
- Open and close every major overlay using touch, mouse, keyboard, and Escape where applicable.
- Confirm the cookie/browser-storage prompt never appears over avatar creation or gameplay.

## Restart, replay, and persistence

- Start each module and use Start this module over.
- Confirm only the current module resets and earlier badges remain saved.
- Exit to the module map and resume an unfinished module.
- Complete a module and use Play again.
- Refresh during each module and confirm progress restores without corruption.
- Clear browser storage and confirm the app handles the missing progress safely.

## Accessibility and readability

- Use browser zoom at 200 percent on desktop.
- Test keyboard-only navigation and visible focus.
- Test VoiceOver on Safari and a screen reader on Windows when available.
- Confirm buttons have understandable labels and at least a practical touch target.
- Confirm Read aloud, mute, and reading-level settings remain accessible.

## Performance and failure checks

- Watch for excessive heat, lag, memory reloads, black WebGL canvases, and delayed avatar updates on older iPads.
- Test a slow connection and confirm loading screens do not trap the user.
- Test offline or interrupted network behavior during login and progress saving.
- Check the browser console for uncaught errors.

## Result table

| Environment | Date | Tester | Entry | Avatar | Navigation | Overlays | Restart/Resume | Accessibility | Result/Notes |
|---|---|---|---|---|---|---|---|---|---|
| iPad Safari portrait | | | | | | | | | |
| iPad Safari landscape | | | | | | | | | |
| iPhone Safari | | | | | | | | | |
| macOS Safari | | | | | | | | | |
| Chrome desktop | | | | | | | | | |
| Edge desktop | | | | | | | | | |
| Firefox desktop | | | | | | | | | |
| Android Chrome | | | | | | | | | |

Compatibility should be described as verified only for environments that have a completed passing row.