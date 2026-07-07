import { Config } from '@remotion/cli/config'

// Use the container's pre-installed Playwright chromium headless shell —
// Remotion must not attempt to download its own browser here.
Config.setBrowserExecutable(
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
)
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(90)
Config.setConcurrency(4)
Config.setChromiumOpenGlRenderer('swangle')
