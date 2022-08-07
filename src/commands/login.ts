import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Login {
  @Slash("login", { description: "login to your Riot account." })
  slashLikeIt(command: CommandInteraction): void {
    this.login(command);
  }

  login(command: CommandInteraction | Message): void {
    command.reply("I like it, Thanks");
  }
}