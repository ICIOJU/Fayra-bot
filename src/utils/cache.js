const { Keyv } = require('keyv');
const path = require('node:path');
const { cacheExpiry } = require('../config.js');

// Creamos la ruta al archivo de la base de datos SQLite.
const dbPath = path.join(__dirname, '..', 'db', 'cache.sqlite');
console.log(`[Cache] Usando la base de datos SQLite en: ${dbPath}`);

// Inicializamos Keyv con el adaptador de SQLite.
// 'translations' será el nombre de la tabla dentro del archivo sqlite.
const translationsCache = new Keyv(`sqlite://${dbPath}`, {
  namespace: 'translations',
  ttl: cacheExpiry, // Tiempo de vida por defecto para las entradas del caché.
});

translationsCache.on('error', err => console.error('[Cache] Error de Keyv:', err));

module.exports = translationsCache;