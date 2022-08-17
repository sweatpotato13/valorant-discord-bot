import type { CommandInteraction } from "discord.js";
import {
    Discord,
    Slash,
} from "discordx";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";

@Discord()
export class Logout {
    @Slash("logout", { description: "logout to your Riot account." })
    slashLogout(command: CommandInteraction): void {
        this.logout(command);
    }

    async logout(command: CommandInteraction): Promise<void> {
        command.reply("Logout Complete");
        const userRepo = await postgresConfig.getRepository(User);
        const users = await userRepo.find({
            where: {
                userId: command.user.id
            }
        });
        for (const user of users) {
            user.headers = "";
            user.cookie = "";
            userRepo.save(user);
        }
    }
}