// Este objeto contiene todas las cadenas de texto de Fayra, organizadas por idioma.
const locales = {
  es: {
    // Personalidad: Mágica, susurrante.
    sameLanguage: 'Fayra susurra: ¡Este mensaje ya está en tu idioma, no necesita de mi magia! ✨',
    emptyMessage: 'Fayra ladea la cabeza... No puedo traducir un mensaje vacío.',
    noRole: 'Para que mi magia funcione, necesito saber qué idioma hablas. ¡Por favor, elige tu rol de idioma en el canal de bienvenida!',
    ambiguousMessage: 'Fayra frunce el ceño. El mensaje es demasiado corto o ambiguo para que mis susurros lo entiendan.',
    apiError: 'La magia de Fayra se desvaneció por un momento... No pude contactar con el oráculo de los idiomas. Por favor, inténtalo de nuevo.',
    cooldown: 'Mi magia necesita recargarse tras tanto esfuerzo. Podrás intentarlo de nuevo <t:${timestamp}:R>.',
    genericError: '¡Ups! La magia de Fayra falló por un momento. Inténtalo de nuevo.',
  },
  fr: {
    // Personalité: Magique, chuchotante.
    sameLanguage: 'Fayra murmure : Ce message est déjà dans ta langue, il n\'a pas besoin de ma magie ! ✨',
    emptyMessage: 'Fayra penche la tête... Je не peux pas traduire un message vide.',
    noRole: 'Pour que ma magie opère, j\'ai besoin de savoir quelle langue tu parles. S\'il te plaît, choisis ton rôle de langue dans le canal de bienvenue !',
    ambiguousMessage: 'Fayra fronce les sourcils. Le message est trop court ou ambigu pour que mes murmures le comprennent.',
    apiError: 'La magie de Fayra s\'est estompée un instant... Je n\'ai pas pu contacter l\'oracle des langues. Réessaye, s\'il te plaît.',
    cooldown: 'Ma magie a besoin de se recharger après un tel effort. Tu pourras réessayer <t:${timestamp}:R>.',
    genericError: 'Oups ! La magie de Fayra a échoué un instant. Réessaye.',
  },
  pt: {
    // Personalidade: Mágica, sussurrante.
    sameLanguage: 'Fayra sussurra: Esta mensagem já está no seu idioma, não precisa da minha magia! ✨',
    emptyMessage: 'Fayra inclina a cabeça... Não consigo traduzir uma mensagem vazia.',
    noRole: 'Para que minha magia funcione, preciso saber que idioma você fala. Por favor, escolha seu cargo de idioma no canal de boas-vindas!',
    ambiguousMessage: 'Fayra franze a testa. A mensagem é muito curta ou ambígua para que meus sussurros a entendam.',
    apiError: 'A magia de Fayra desvaneceu-se por um momento... Não consegui contactar o oráculo das línguas. Por favor, tente novamente.',
    cooldown: 'Minha magia precisa recarregar depois de tanto esforço. Por favor, espere antes de pedir outra tradução. Você poderá tentar novamente <t:${timestamp}:R>.',
    genericError: 'Opa! A magia de Fayra falhou por um momento. Tente novamente.',
  },
};

/**
 * Obtiene una cadena de texto en el idioma especificado.
 * @param {string} lang El código del idioma (ej: 'es', 'fr').
 * @param {string} key La clave de la cadena de texto a obtener.
 * @param {Object} [replacements={}] Un objeto con valores para reemplazar placeholders.
 * @returns {string} La cadena de texto localizada.
 */
function getString(lang, key, replacements = {}) {
  const languageStrings = locales[lang] || locales.es; // Si el idioma no existe, usa español como fallback.
  let text = languageStrings[key] || locales.es[key]; // Si la clave no existe, usa la de español.

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(`\${${placeholder}}`, value);
  }

  return text;
}

module.exports = { getString };