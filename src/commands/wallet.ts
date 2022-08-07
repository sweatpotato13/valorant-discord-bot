import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Wallet {
  @Slash("wallet", { description: "show your Valorant Wallet." })
  slashLikeIt(command: CommandInteraction): void {
    this.wallet(command);
  }

  wallet(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}