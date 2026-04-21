// deploy-commands.js

const { REST, Routes, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
require('dotenv').config();
const { contextMenuCommandName } = require('./src/config.js');

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('Error: DISCORD_BOT_TOKEN y DISCORD_CLIENT_ID deben estar definidos en .env');
  process.exit(1);
}

const commands = [
  new ContextMenuCommandBuilder()
    .setName(contextMenuCommandName)
    .setType(ApplicationCommandType.Message)
    .toJSON() // <-- Elimina .setDescription()
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`Iniciando el registro de ${commands.length} comando(s) de menú contextual...`);
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    console.log(`¡Se registraron correctamente ${data.length} comando(s)!`);
    console.log('El comando de menú contextual debería estar disponible en unos minutos.');
  } catch (error) {
    console.error('Error al registrar los comandos:', error);
  }
})();