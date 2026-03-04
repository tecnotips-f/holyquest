/**
 * Service Worker para HolyQuest
 * Gestiona el almacenamiento en caché y la actualización de versiones
 */

const CACHE_NAME = 'holyquest-v5'; // Incrementa este número para forzar la actualización de archivos
const CACHE_VERSION = '5.0.0';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Poppins:wght@300;400;600;800&display=swap'
];

// Evento de instalación: Almacena los recursos iniciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abriendo caché y almacenando recursos');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Fuerza al Service Worker a activarse inmediatamente sin esperar a que se cierren las pestañas
  self.skipWaiting();
});

// Evento de activación: Limpia cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Si el nombre de la caché actual no coincide con la versión definida, se elimina
          if (cache !== CACHE_NAME) {
            console.log('Limpiando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Toma el control de las pestañas abiertas inmediatamente
      return self.clients.claim();
    })
  );
});

// Estrategia de respuesta: Cache First, Fallback to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve el recurso de la caché o realiza la petición a la red
      return response || fetch(event.request);
    })
  );
});