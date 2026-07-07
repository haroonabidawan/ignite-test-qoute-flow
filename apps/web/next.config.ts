import { withGluestackUI } from "@gluestack/ui-next-adapter";
import type { NextConfig } from "next";

const gluestackTranspile = [
  "@repo/api",
  "@repo/types",
  "@repo/ui",
  "@gluestack-ui/core",
  "@gluestack-ui/utils",
  "@legendapp/motion",
  "nativewind",
  "react-native-css-interop",
  "react-native",
  "react-native-web",
  "react-native-svg",
  "react-native-safe-area-context",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: gluestackTranspile,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withGluestackUI(nextConfig);
