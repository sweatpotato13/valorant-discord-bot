import axios from "axios";
import { CommandInteraction, EmbedBuilder, Message } from "discord.js";
import {
  Discord,
  MetadataStorage,
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
    command: CommandInteraction): void {
    this.mmr(region, username, tag, command);
  }

  async mmr(region: string, username: string, tag: string, interaction: CommandInteraction | Message): Promise<void> {
    const response = await getMmr(region, username, tag);
    const data = response.data;
    
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

    interaction.channel?.send({ embeds: [embed] });
    interaction.reply(`${data.data.name}#${data.data.tag}'s MMR Infomation`);
  }
}

async function getMmr(region: string, username: string, tag: string) {
  return await axios({
    url: `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${username}/${tag}`,
    method: 'GET'
  });
}