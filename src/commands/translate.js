const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const { contextMenuCommandName, roleToLanguage } = require('../config.js');
const cache = require('../utils/cache.js');
const { translateText } = require('../utils/translationService.js');
const { franc } = require('franc');
const { getString } = require('../utils/locales.js');

const langCodeMap = { 'spa': 'es', 'fra': 'fr', 'por': 'pt' };

// --- NUEVO: MAPA DE BLOQUEO EN MEMORIA ---
// Este Map contendrá las promesas de las traducciones que están actualmente en curso.
const ongoingTranslations = new Map();

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName(contextMenuCommandName)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    console.log(`\n--- Nueva Interacción de Traducción de ${interaction.user.tag} ---`);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    console.log('[LOG] Interacción diferida exitosamente.');

    const message = interaction.targetMessage;
    let targetLang = null;

    const userRoles = interaction.member.roles.cache;
    for (const [roleName, langCode] of Object.entries(roleToLanguage)) {
      if (userRoles.some(role => role.name === roleName)) {
        targetLang = langCode;
        break;
      }
    }
    const responseLang = targetLang || 'es';

    if (!message.content || message.content.trim() === '') {
      return interaction.editReply({ content: getString(responseLang, 'emptyMessage') });
    }
    if (!targetLang) {
      return interaction.editReply({ content: getString(responseLang, 'noRole') });
    }

    const sourceLangFranc = franc(message.content);
    const sourceLang = langCodeMap[sourceLangFranc] || 'und';

    if (sourceLang === 'und') {
      return interaction.editReply({ content: getString(responseLang, 'ambiguousMessage') });
    }
    if (sourceLang === targetLang) {
      return interaction.editReply({ content: getString(responseLang, 'sameLanguage') });
    }

    const cacheKey = `${message.id}-${targetLang}`;
    let translation;

    // --- LÓGICA DE TRADUCCIÓN ACTUALIZADA ---

    // 1. Revisar caché persistente (SQLite)
    const cachedTranslation = await cache.get(cacheKey);
    if (cachedTranslation) {
      translation = cachedTranslation;
      console.log(`[CACHE HIT] Traducción encontrada en el caché para la clave: ${cacheKey}`);
    } else {
      // 2. Revisar bloqueo en memoria (traducción en curso)
      if (ongoingTranslations.has(cacheKey)) {
        console.log(`[LOCK HIT] Otra interacción ya está traduciendo esto. Esperando el resultado...`);
        try {
          translation = await ongoingTranslations.get(cacheKey);
          console.log(`[LOCK RESOLVED] La traducción en curso ha finalizado.`);
        } catch (error) {
           console.error('[ERROR] La traducción en curso falló.', error);
           return interaction.editReply({ content: getString(responseLang, 'apiError') });
        }
      } else {
        // 3. Somos los primeros. Iniciar la traducción y establecer el bloqueo.
        console.log(`[CACHE MISS] No se encontró traducción. Procediendo a traducir y estableciendo bloqueo...`);
        const translationPromise = translateText(message.content, targetLang);
        ongoingTranslations.set(cacheKey, translationPromise);

        try {
          translation = await translationPromise;
          await cache.set(cacheKey, translation);
          console.log(`[CACHE SET] Nueva traducción guardada en el caché con la clave: ${cacheKey}`);
        } catch (error) {
          console.error('[ERROR] Falló el proceso de traducción.');
          return interaction.editReply({ content: getString(responseLang, 'apiError') });
        } finally {
          // 4. CRÍTICO: Eliminar el bloqueo siempre, tanto si tiene éxito como si falla.
          ongoingTranslations.delete(cacheKey);
          console.log(`[LOCK RELEASED] Bloqueo para la clave ${cacheKey} liberado.`);
        }
      }
    }
    
    await interaction.editReply({ content: translation });
    console.log('[LOG] Respuesta efímera enviada al usuario.');
    console.log('--- Interacción Completada ---');
  },
};