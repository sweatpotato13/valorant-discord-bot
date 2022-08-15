import axios from "axios";
import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
  SlashOption,
} from "discordx";

@Discord()
export class Nightmarket {
  @Slash("nightmarket", { description: "show your Valorant Night Market." })
  slashNightmarket(
    @SlashOption("authorization", { description: "Authorization" })
    authorization: string,
    @SlashOption("entitlements", { description: "Entitlements" })
    entitlements: string,
    @SlashOption("region", { description: "account region" })
    region: string,
    @SlashOption("puuid", { description: "puuid" })
    puuid: string,
    interaction: CommandInteraction): void {
    this.nightmarket(region, puuid, authorization, entitlements, interaction);
  }

  async nightmarket(region: string, puuid: string, authorization: string, entitlements: string, interaction: CommandInteraction): Promise<void> {
    const response = await getNightmarket(region, puuid, authorization, entitlements);
    const data = response.data;
    console.log(data);
    interaction.reply("I like it, Thanks");
  }
}

async function getNightmarket(region: string, puuid: string, authorization: string, entitlements: string) {
  return await axios({
    url: `https://pd.${region}.a.pvp.net/store/v2/storefront/${puuid}`,
    method: 'GET',
    headers: {
      'X-Riot-Entitlements-JWT': entitlements,
      'Authorization': authorization
    }
  });
}