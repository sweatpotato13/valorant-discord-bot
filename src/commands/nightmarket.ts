import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Nightmarket {
  @Slash("nightmarket", { description: "show your Valorant Night Market." })
  slashLikeIt(command: CommandInteraction): void {
    this.nightmarket(command);
  }

  nightmarket(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}