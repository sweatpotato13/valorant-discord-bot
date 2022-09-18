import axios from "axios";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";

@Discord()
export class MMR {
    @Slash("mmr", { description: "show your Valorant Matchmaking MMR." })
    slashMmr(
        @SlashOption("username", { description: "username" })
        username: string,
        @SlashOption("tag", { description: "tag" })
        tag: string,
        @SlashOption("region", { description: "region" })
        region: string,
        interaction: CommandInteraction): void {
        this.mmr(region, username, tag, interaction);
    }

    async mmr(region: string, username: string, tag: string, interaction: CommandInteraction): Promise<void> {
        try {
            const regions = ["eu", "ap", "kr", "na"];
            if (!regions.includes(region)) {
                await interaction.reply({ content: `region must be one of the following: {eu, ap, kr, na}`, ephemeral: true });
                return;
            }
            const response = await getMmr(region, username, tag);
            const data = response.data;
            if (data.name === null) {
                await interaction.reply({ content: `${username}#${tag} does not have MMR Data`, ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder();
            embed.setTitle(`**${data.data.name}#${data.data.tag}'s MMR Infomation**`)
            embed.setColor(0xfa4454)
            embed.setThumbnail(data.data.images.large)
            embed.addFields(
                { name: `Current Tier`, value: `${data.data.currenttierpatched}`, inline: false },
                { name: `RP`, value: `${data.data.ranking_in_tier}`, inline: false },
                { name: `ELO`, value: `${data.data.elo}`, inline: false },
            )
            embed.setTimestamp()

            await interaction.reply({ embeds: [embed], content: `${data.data.name}#${data.data.tag}'s MMR Infomation` });
        }
        catch (error: any) {
            await interaction.reply({ content: `There was an error while executing this command!, Please try again later`, ephemeral: true });
        }
    }
}

async function getMmr(region: string, username: string, tag: string) {
    return await axios({
        url: `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${username}/${tag}`,
        method: 'GET'
    });
}