import axios from "axios";
import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
} from "discordx";

@Discord()
export class Wallet {
  @Slash("wallet", { description: "show your Valorant Wallet." })
  slashLikeIt(command: CommandInteraction): void {
    this.wallet(command);
  }

  wallet(command: CommandInteraction | Message): void {
    getWallet("AP", "");
  }
}

async function getWallet(region: string, puuid: string) {
  return await axios({
    url: `https://pd.${region}.a.pvp.net/store/v1/wallet/${puuid}`,
    method: 'GET',
    headers: {
      'X-Riot-Entitlements-JWT': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)',
      'Authorization': 'Authorization'
    }
  });
}