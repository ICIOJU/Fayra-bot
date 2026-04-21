const fetch = require('node-fetch');

const { LLAMA_API_URL, LLAMA_API_KEY } = process.env;

// Mapeo de códigos de idioma a nombres completos para el prompt.
const languageMap = {
  es: 'Español',
  fr: 'Francés',
  pt: 'Portugués',
};

async function translateText(text, targetLangCode) {
  const targetLanguageName = languageMap[targetLangCode] || targetLangCode;
  console.log(`[Translation Service] Iniciando traducción de texto a ${targetLanguageName}.`);

  if (!LLAMA_API_URL || !LLAMA_API_KEY) {
    console.error('[Translation Service] Error: La URL o la API Key de Llama no están configuradas en .env');
    throw new Error('El servicio de traducción no está configurado correctamente.');
  }

  // --- El Prompt de Precisión ---
  // Usamos el rol "system" para darle al LLM su personalidad y sus reglas.
  // Esto es crucial para obtener una respuesta limpia y sin texto extra.
  const promptMessages = [
    {
      role: 'system',
      content: `Eres un traductor experto y multilingüe. Tu única tarea es traducir el texto del usuario al idioma solicitado de la manera más precisa y natural posible. No añadas comentarios, explicaciones, saludos ni disculpas. Responde únicamente con el texto traducido.`,
    },
    {
      role: 'user',
      content: `Traduce el siguiente texto al ${targetLanguageName}:\n\n"${text}"`,
    },
  ];

  const body = {
    model: 'llama3-8b-instruct',
    messages: promptMessages,
  };

  try {
    console.log('[Translation Service] Llamando a la API de Llama...');
    const response = await fetch(LLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLAMA_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Translation Service] Error de la API: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`La API de traducción devolvió un error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extraemos el texto traducido de la estructura de la respuesta de la API.
    const translatedContent = data.choices[0]?.message?.content;

    if (!translatedContent) {
      console.error('[Translation Service] La respuesta de la API no tiene el formato esperado.', data);
      throw new Error('No se pudo extraer la traducción de la respuesta de la API.');
    }
    
    console.log('[Translation Service] Traducción recibida exitosamente.');
    return translatedContent.trim();

  } catch (error) {
    console.error('[Translation Service] Falló la petición a la API de Llama:', error);
    // Re-lanzamos el error para que el manejador de comandos pueda atraparlo.
    throw error;
  }
}

module.exports = { translateText };