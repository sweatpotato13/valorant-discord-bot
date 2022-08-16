import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Store {
  @Slash("store", { description: "show your Valorant Daily Store." })
  slashLikeIt(interaction: CommandInteraction): void {
    this.store(interaction);
  }

  store(interaction: CommandInteraction): void {
    console.log(interaction.user.id);
    interaction.reply("I like it, Thanks");
  }
}