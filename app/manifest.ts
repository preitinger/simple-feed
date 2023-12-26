import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
    return {
        "id": "any_id",
        "theme_color": "#f69435",
        "background_color": "#f69435",
        "display": "standalone",
        "scope": ".",
        "start_url": "/",
        "name": "simple-feed",
        "short_name": "simple-feed",
        "description": "Simplistic feed for handicapped people",
        "orientation": "portrait",
        "icons": [
            {
                "src": "/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/icon-256x256.png",
                "sizes": "256x256",
                "type": "image/png"
            },
            {
                "src": "/icon-384x384.png",
                "sizes": "384x384",
                "type": "image/png"
            },
            {
                "src": "/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    }
//   return {
//     name: 'Next.js App',
//     short_name: 'Next.js App',
//     description: 'Next.js App',
//     start_url: '/',
//     display: 'standalone',
//     background_color: '#fff',
//     theme_color: '#fff',
//     icons: [
//       {
//         src: '/icon.png',
//         sizes: '144x144',
//         type: 'image/png',
//       },
//     ],
//   }
}
