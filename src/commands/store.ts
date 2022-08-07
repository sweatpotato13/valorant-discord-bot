import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Store {
  @Slash("store", { description: "show your Valorant Daily Store." })
  slashLikeIt(command: CommandInteraction): void {
    this.store(command);
  }

  store(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}