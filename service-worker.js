const CACHE_NAME = "mass-register-v1";

const urlsToCache = [

    "/",
    "/index.html",
    "/dashboard.html",

    "/css/dashboard.css",
    "/css/modal.css",

    "/js/firebase.js",
    "/js/dashboard.js",
    "/js/modal.js",
    "/js/pdf.js",
    "/js/toast.js",

    "/manifest.json",

    "/icons/icon-192.png",
    "/icons/icon-512.png"

];

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME).then((cache) => {

            return cache.addAll(urlsToCache);

        })

    );

});

self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request).then((response) => {

            return response || fetch(event.request);

        })

    );

});