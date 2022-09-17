import axios from "axios";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    Discord,
    Slash,
} from "discordx";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";

@Discord()
export class Wallet {
    @Slash("wallet", { description: "show your Valorant Wallet." })
    slashWallet(
        interaction: CommandInteraction): void {
        this.wallet(interaction);
    }

    async wallet(interaction: CommandInteraction): Promise<void> {
        try {
            const userRepo = await postgresConfig.getRepository(User);
            const users = await userRepo.find({
                where: {
                    userId: interaction.user.id
                }
            });
            if (users.length === 0) {
                interaction.reply({ content: "Account not found", ephemeral: true });
                return;
            }
            const user = users[0];
            if (!user.headers || !user.puuid) {
                interaction.reply({ content: "Invaild token info, please login again", ephemeral: true });
                return;
            }
            const headers = JSON.parse(user.headers);
            const response = await getWallet(user.region, user.puuid, headers);
            const data = response.data;
            const embed = new EmbedBuilder();
            embed.setColor(0xfa4454)
            // embed.setThumbnail(data.data.images.large)
            embed.addFields(
                { name: `Valorant Points`, value: `${data.Balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]}`, inline: false },
                { name: `Radianite Points`, value: `${data.Balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"]}`, inline: false },
            )
            embed.setTimestamp()

            await interaction.reply({ embeds: [embed], content: "Balance" });
        } catch (error: any) {
            console.log(error.message);
            await interaction.reply({ content: `There was an error while executing this command!, Please try again later`, ephemeral: true });
        }
    }
}

async function getWallet(region: string, puuid: string, headers: any) {
    return await axios({
        url: `https://pd.${region}.a.pvp.net/store/v1/wallet/${puuid}`,
        method: 'GET',
        headers: headers
    });
}