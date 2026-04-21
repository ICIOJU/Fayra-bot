// Usamos module.exports para que sea compatible con require() en todos los archivos.
module.exports = {
  // Mapeo de roles a idiomas. IMPORTANTE: Los nombres deben ser EXACTOS a los de Discord.
  roleToLanguage: {
    'Español-Latino': 'es',
    'Francophone': 'fr',
    'Portugués': 'pt',
  },

  // Nombre del comando de menú contextual. Debe coincidir en el registro y en la ejecución.
  contextMenuCommandName: 'Magic Translation',

  // Configuración del cooldown (anti-spam) en segundos.
  cooldownDuration: 5, // 5 segundos de espera entre usos por usuario.

  // Configuración del caché (SQLite) en milisegundos.
  // 30 días * 24 horas * 60 minutos * 60 segundos * 1000 milisegundos
  cacheExpiry: 30 * 24 * 60 * 60 * 1000,
};

console.log('Módulo de configuración cargado.');