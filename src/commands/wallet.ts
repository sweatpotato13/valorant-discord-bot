import axios from "axios";
import { CommandInteraction, EmbedBuilder, Message } from "discord.js";
import {
  Discord,
  Slash,
  SlashOption,
} from "discordx";

@Discord()
export class Wallet {
  @Slash("wallet", { description: "show your Valorant Wallet." })
  slashWallet(
    @SlashOption("authorization", { description: "Authorization" })
    authorization: string,
    @SlashOption("entitlements", { description: "Entitlements" })
    entitlements: string,
    @SlashOption("region", { description: "account region" })
    region: string,
    @SlashOption("puuid", { description: "puuid" })
    puuid: string,
    interaction: CommandInteraction): void {
    this.wallet(region, puuid, authorization, entitlements, interaction);
  }

  async wallet(region: string, puuid: string, authorization: string, entitlements: string, interaction: CommandInteraction): Promise<void> {
    try {
      const response = await getWallet(region, puuid, authorization, entitlements);
      const data = response.data;
      console.log(data);
      const embed = new EmbedBuilder();
      embed.setColor(0xfa4454)
      // embed.setThumbnail(data.data.images.large)
      embed.addFields(
        { name: `Valorant Points`, value: `${data.Balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]}`, inline: false },
        { name: `Radianite Points`, value: `${data.Balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"]}`, inline: false },
      )
      embed.setTimestamp()

      interaction.channel?.send({ embeds: [embed] });
      interaction.reply(`Balance`);
    } catch (error: any) {
      console.log(error.message);
      interaction.reply(`There was an error while executing this command!, Please try again later`);
    }
  }
}

async function getWallet(region: string, puuid: string, authorization: string, entitlements: string) {
  return await axios({
    url: `https://pd.${region}.a.pvp.net/store/v1/wallet/${puuid}`,
    method: 'GET',
    headers: {
      'X-Riot-Entitlements-JWT': entitlements,
      'Authorization': authorization
    }
  });
}