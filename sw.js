
const staticChacheName = 'site-static-v3';
const dynamicCache = 'site-dynamic-v6'

const assets = [
	'/',
	'/index.html',
	'/js/app.js',
	'/js/ui.js',
	'/css/styles.css',
	'/img/dish.png',
	'/pages/fallback.html',
	'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
	'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
]

//cache size limit 
function limitCacheSize(name,size) {
	caches.open(name).then((cache)=>{
		cache.keys().then((keys)=>{
			if(keys.length > size){
				cache.delete(keys[0]).then(limitCacheSize(name,size));
			}
		})
	})
}

self.addEventListener('install',(e)=>{
	//these will not be change like css and images
	// console.log('service worker has been installed');
	e.waitUntil(
		caches.open(staticChacheName)
		.then((cache)=>{
			console.log('caching things');
			cache.addAll(assets);
		})		
	)
})

// active service Worker event
self.addEventListener('activate',(e)=>{
	// console.log('service worker is activated');
	e.waitUntil(
		caches.keys().then((keys)=>{
			// console.log(keys);
			return Promise.all(keys
				.filter(key => key!== staticChacheName && key!==dynamicCache)
				.map(key => caches.delete(key))
			)
		})
	)
})

//fetch events
self.addEventListener('fetch',(e)=>{
	// console.log('fetch event',e);
	if(e.request.url.indexOf('firestore.googleapis.com') === -1){
		e.respondWith(
			caches.match(e.request).then((cacheres)=>{
				return cacheres || fetch(e.request).then((fetchres)=>{
					return caches.open(dynamicCache).then((cache)=>{
						cache.put(e.request.url,fetchres.clone());
						// limitCacheSize(dynamicCache,15);
						return fetchres;
					})
				}).catch(()=>{
					if(e.request.url.indexOf('.html'))
					return caches.match('/pages/fallback.html')
				})
			})
		)
	}
})