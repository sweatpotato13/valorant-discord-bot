import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Competitive {
  @Slash("competitive", { description: "displays the most recent Competitive matches." })
  slashLikeIt(command: CommandInteraction): void {
    this.competitive(command);
  }

  competitive(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}