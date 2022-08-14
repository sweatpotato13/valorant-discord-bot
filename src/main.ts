import "reflect-metadata";
import 'dotenv/config';

import { dirname, importx } from "@discordx/importer";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField } from "discord.js";
import { Client } from "discordx";
// import { postgresConfig } from "./config/typeorm/index";

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export const bot = new Client({
    botGuilds: [client => client.guilds.cache.map(guild => guild.id)],

    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
    ],

    silent: false,

    simpleCommand: {
        prefix: "!",
    },
});

bot.once("ready", async () => {
    await bot.guilds.fetch();
    await bot.initApplicationCommands();
    console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
    bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
    bot.executeCommand(message);
});

async function run() {
    await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");

    // Let's start the bot
    if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
    }

    // Set database
    // await postgresConfig.initialize()

    // Log in with your bot token
    await bot.login(process.env.BOT_TOKEN);
}

run();
