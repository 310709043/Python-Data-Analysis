import { Config } from "@remotion/cli/config";

Config.setBrowserExecutable("/opt/pw-browsers/chromium");
Config.setChromeMode("chrome-for-testing");
Config.setChromiumOpenGlRenderer("swiftshader");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setCrf(20);
Config.setConcurrency(4);
