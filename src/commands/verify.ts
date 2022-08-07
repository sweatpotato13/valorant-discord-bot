import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Verify {
  @Slash("verify", { description: "validate two-factor authentication." })
  slashLikeIt(command: CommandInteraction): void {
    this.verify(command);
  }

  verify(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}