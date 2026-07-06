/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["mongoose", "mongodb", "bson"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/mongoose/**/*", "./node_modules/mongodb/**/*", "./node_modules/bson/**/*"],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    }
    return config
  },
  turbopack: (config, { isServer }) => {
    // Exclude MongoDB from client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        dns: false,
        'fs/promises': false,
        os: false,
        'os-browserify': false,
        path: false,
        'path-browserify': false,
        crypto: false,
        stream: false,
        'stream-browserify': false,
        util: false,
        'util-deprecate': false,
        zlib: false,
        'zlib-browserify': false,
        http: false,
        https: false,
        assert: false,
        buffer: false,
        constants: false,
        events: false,
        url: false,
        vm: false,
        querystring: false,
      };
      
      // Mark mongodb and mongoose as external for client-side
      config.externals = [
        ...config.externals,
        'mongodb',
        'mongoose',
        // Add any other server-only packages
      ];
    }
    
    return config;
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  compiler: {
    styledComponents: true
  },
}

export default nextConfig
