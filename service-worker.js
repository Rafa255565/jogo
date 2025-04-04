// Nome do cache
const CACHE_NAME = 'treasure-hunt-v1';

// Arquivos para cache
const filesToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/game.js',
  '/manifest.json',
  '/images/treasure-chest.png',
  '/images/gold-coins.png',
  '/images/diamond.png',
  '/images/ruby.png',
  '/images/crown.png',
  '/images/jewel.png',
  '/images/x-mark.png',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png',
  '/sounds/treasure.mp3',
  '/sounds/wrong.mp3',
  '/sounds/game-over.mp3',
  '/sounds/win.mp3',
  '/sounds/click.mp3'
];

// Instalação do service worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando arquivos');
        return cache.addAll(filesToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do service worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  console.log('Service Worker: Buscando recurso ' + event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna o recurso do cache se encontrado
        if (response) {
          return response;
        }
        
        // Caso contrário, busca na rede
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para o cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // Fallback para quando não há conexão
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('/index.html');
        }
      })
  );
});
