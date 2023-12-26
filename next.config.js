
// const withPWA = require('next-pwa')({
//     dest: "public",
//     register: true,
//     skipWaiting: true,
// })

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = withPWA(nextConfig);

// module.exports = nextConfig

// module.exports = process.env.NODE_ENV === 'development' ? nextConfig : withPWA(nextConfig)
// module.exports = withPWA(nextConfig)
// module.exports = nextConfig;
