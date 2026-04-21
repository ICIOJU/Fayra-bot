require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events, Collection, MessageFlags } = require('discord.js');
const { cooldownDuration, roleToLanguage } = require('./src/config.js');
const { getString } = require('./src/utils/locales.js'); // <-- IMPORTAR GETSTRING

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error('¡Error! No se encontró el DISCORD_BOT_TOKEN en el archivo .env.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`[INFO] Comando '${command.data.name}' cargado exitosamente.`);
  } else {
    console.log(`[ADVERTENCIA] El comando en ${filePath} no tiene las propiedades "data" o "execute".`);
  }
}

client.cooldowns = new Collection();

// --- NUEVA FUNCIÓN AUXILIAR ---
function getUserLanguage(interaction) {
  const userRoles = interaction.member.roles.cache;
  for (const [roleName, langCode] of Object.entries(roleToLanguage)) {
    if (userRoles.some(role => role.name === roleName)) {
      return langCode;
    }
  }
  return 'es'; // Idioma por defecto si no se encuentra rol.
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No se encontró un comando correspondiente a "${interaction.commandName}".`);
    return;
  }

  const userLang = getUserLanguage(interaction); // <-- OBTENER IDIOMA DEL USUARIO
  const { cooldowns } = client;
  const commandName = command.data.name;

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = cooldownDuration * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        // --- USAR GETSTRING PARA EL MENSAJE DE COOLDOWN ---
        content: getString(userLang, 'cooldown', { timestamp: expiredTimestamp }),
        flags: MessageFlags.Ephemeral
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error ejecutando el comando "${command.data.name}":`, error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: getString(userLang, 'genericError'), ephemeral: true });
    } else {
      await interaction.reply({ content: getString(userLang, 'genericError'), flags: MessageFlags.Ephemeral });
    }
  }
});

client.once(Events.ClientReady, readyClient => {
  console.log('-------------------------------------------');
  console.log(`✨ ¡Fayra está en línea y susurrando magia como ${readyClient.user.tag}!`);
  console.log('-------------------------------------------');
});

client.login(token);