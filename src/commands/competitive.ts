import axios from "axios";
import { CommandInteraction, EmbedBuilder } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";

@Discord()
export class Competitive {
    @Slash("competitive", { description: "displays the most recent Competitive matches." })
    slashLikeIt(
        @SlashOption("username", { description: "username" })
        username: string,
        @SlashOption("tag", { description: "tag" })
        tag: string,
        @SlashOption("region", { description: "region" })
        region: string,
        interaction: CommandInteraction): void {
        interaction.deferReply();
        this.competitive(region, username, tag, interaction);
    }

    async competitive(region: string, username: string, tag: string, interaction: CommandInteraction): Promise<void> {
        try {
            const regions = ["eu", "ap", "kr", "na"];
            if (!regions.includes(region)) {
                await interaction.editReply(`region must be one of the following: {eu, ap, kr, na}`);
                return;
            }
            const response = await getCompetitive(region, username, tag);
            const data = response.data;
            if (data.data === null || data.data.length === 0) {
                await interaction.editReply(`${username}#${tag} does not have recent matches`);
                return;
            }

            const embeds = [];
            for (const match of data.data) {
                const embed = new EmbedBuilder();
                embed.setColor(0xfa4454)
                let player;
                for (const p of match.players.all_players) {
                    if (p.tag === tag && p.name === username) {
                        player = p;
                    }
                }
                const playerTeam = player.team.toLowerCase();
                const matchResult = match.teams[playerTeam];
                embed.setThumbnail(player.assets.agent.full);
                embed.addFields(
                    { name: `Map`, value: `${match.metadata.map}`, inline: false },
                    { name: `Date`, value: `${match.metadata.game_start_patched}`, inline: true },
                    { name: `Result`, value: `${matchResult.rounds_won}:${matchResult.rounds_lost}`, inline: false },
                )

                embed.addFields(
                    { name: `Level`, value: `${player.level}`, inline: false },
                    { name: `Tier`, value: `${player.currenttier_patched}`, inline: true },
                    { name: `Score`, value: `${player.stats.score}`, inline: true },
                    { name: `Kills`, value: `${player.stats.kills}`, inline: true },
                    { name: `Deaths`, value: `${player.stats.deaths}`, inline: true },
                    { name: `Assists`, value: `${player.stats.assists}`, inline: true },
                    { name: `Headshots`, value: `${player.stats.headshots}`, inline: true },
                    { name: `Damage`, value: `${player.damage_made}`, inline: true },
                )
                embeds.push(embed);
            }

            await interaction.channel?.send({ embeds: embeds });
            await interaction.editReply(`${username}#${tag}'s recent matches infomation`);
        }
        catch (error: any) {
            console.log(error.message);
            await interaction.editReply(`There was an error while executing this command!, Please try again later`);
        }
    }
}

async function getCompetitive(region: string, username: string, tag: string) {
    return await axios({
        url: `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${username}/${tag}?filter=competitive`,
        method: 'GET'
    });
}