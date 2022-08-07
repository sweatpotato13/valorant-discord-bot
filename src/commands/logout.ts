import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Logout {
  @Slash("logout", { description: "logout to your Riot account." })
  slashLikeIt(command: CommandInteraction): void {
    this.logout(command);
  }

  logout(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}