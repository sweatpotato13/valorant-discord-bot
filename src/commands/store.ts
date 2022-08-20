import axios from "axios";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    Discord,
    Slash,
} from "discordx";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";

@Discord()
export class Store {
    @Slash("store", { description: "show your Valorant Daily Store." })
    slashStore(interaction: CommandInteraction): void {
        // interaction.deferReply();
        this.store(interaction);
    }

    async store(interaction: CommandInteraction): Promise<void> {
        try {
            const userRepo = await postgresConfig.getRepository(User);
            const users = await userRepo.find({
                where: {
                    userId: interaction.user.id
                }
            });
            if (users.length === 0) {
                interaction.reply("Account not found");
                return;
            }
            const user = users[0];
            if (!user.headers || !user.puuid) {
                interaction.reply("Invaild token info, please login again");
                return;
            }
            const headers = JSON.parse(user.headers);
            const response = await getStore(user.region, user.puuid, headers);
            const data = await response.data;
            const itemOffers = data.SkinsPanelLayout.SingleItemOffers;
            const remainingTime = data.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds;
            const result = new Date(remainingTime * 1000).toISOString().slice(11, 19);
            const skinsInfo = await getSkinsInfo(itemOffers);
            const embeds = [];
            const embed = new EmbedBuilder();
            embed.setColor(0xfa4454)
            embed.addFields(
                { name: `Valorant Daily Store`, value: `${result} remaining`, inline: false },
            )
            embeds.push(embed);
            for (const skinInfo of skinsInfo) {
                const embed = new EmbedBuilder();
                embed.setColor(0xfa4454)
                embed.setThumbnail(skinInfo.data.displayIcon);
                embed.addFields(
                    { name: `Name`, value: skinInfo.data.displayName, inline: false },
                )
                embeds.push(embed);
            }
            await interaction.channel?.send({ embeds: embeds });
            await interaction.reply("Store Offer");
        } catch (error: any) {
            console.log(error.message);
            await interaction.reply(`There was an error while executing this command!, Please try again later`);
        }
    }
}

async function getStore(region: string, puuid: string, headers: any) {
    return await axios({
        url: `https://pd.${region}.a.pvp.net/store/v2/storefront/${puuid}`,
        method: 'GET',
        headers: headers
    });
}

async function getSkinsInfo(skinsId: any[]) {
    const skinsInfo: any[] = [];
    for (const skinId of skinsId) {
        const data = await axios({
            url: `https://valorant-api.com/v1/weapons/skinlevels/${skinId}`,
            method: 'GET',
        });
        skinsInfo.push(data.data);
    }
    return skinsInfo;
}