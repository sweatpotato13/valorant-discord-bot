import type { CommandInteraction, Message } from "discord.js";
import {
  Discord,
  Slash,
  SlashOption,
} from "discordx";
import axios from "axios";
import { Agent } from "https";
@Discord()
export class Login {
  @Slash("login", { description: "login to your Riot account." })
  slashLogin(
    @SlashOption("name", { description: "account name" })
    name: string,
    @SlashOption("password", { description: "account password" })
    password: string,
    @SlashOption("region", { description: "account region" })
    region: string,
    @SlashOption("relogin", { description: "relogin flag" })
    relogin: boolean,
    command: CommandInteraction
  ): void {
    this.login(name, password, region, relogin, command);
  }

  async login(name: string, password: string, region: string, relogin: boolean, command: CommandInteraction | Message): Promise<any> {
    try {
      const session: any = await createSession();
      let asidCookie = session.headers['set-cookie'].find((cookie: string) => /^asid/.test(cookie));
      // attempt to exchange username and password for an access token
      const loginResponse: any = await login(asidCookie, name, password)
        .catch(err => {
          if (typeof err.response.data === 'undefined')
            throw new ValReauthScriptError('unknown error', err.response);
          if (err.response.data.error === 'rate_limited')
            throw new ValReauthScriptError('too many login attempts');
          throw new ValReauthScriptError('unknown error', err.response.data);
        });

      // auth failed - most likely incorrect login info
      if (typeof loginResponse.data.error !== 'undefined') {
        console.dir(loginResponse.data)
        if (loginResponse.data.error === 'auth_failure')
          throw new ValReauthScriptError('invalid login credentials');
        throw new ValReauthScriptError('unknown error', loginResponse.data);
      }

      asidCookie = loginResponse.headers['set-cookie'].find((cookie: string) => /^asid/.test(cookie));

      if (loginResponse.data.type === 'response') {
        // extract ssid cookie
        const ssidCookie = loginResponse.headers['set-cookie'].find((cookie: string) => /^ssid/.test(cookie));

        // extract tokens from the url
        const tokens: any = parseUrl(loginResponse.data.response.parameters.uri);

        tokens.entitlementsToken =
          (await fetchEntitlements(tokens.accessToken)).data.entitlements_token;

        // parse access token and extract puuid
        const puuid = JSON.parse(Buffer.from(
          tokens.accessToken.split('.')[1], 'base64').toString()).sub;

        // fetch pas token - not required, instead we only want the region
        // since we already fetched it let's save it, because why not
        const pasTokenResponse = await fetchPas(tokens.accessToken, tokens.idToken);
        tokens.pasToken = pasTokenResponse.data.token;

        region = pasTokenResponse.data.affinities.live;

        const clientVersion = (await fetchValorantVersion()).data.data.riotClientVersion;

        command.reply(`Login Done`);
        const headers = makeHeaders(tokens, clientVersion, clientPlatform);
        console.log(`${puuid}, ${region}`);
        console.log(headers);
      }
      else {
        command.reply(`You need to verify your account first, Please input your 2fa code using /verify command ${asidCookie}`);
      }

    } catch (error: any) {
      console.error(error);
    }
  }
}
const clientPlatform = {
  platformType: "PC",
  platformOS: "Windows",
  platformOSVersion: "10.0.19043.1.256.64bit",
  platformChipset: "Unknown"
};

function makeHeaders(tokens: any, clientVersion: any, clientPlatform: any) {
  return {
    Authorization: `Bearer ${tokens.accessToken}`,
    'X-Riot-Entitlements-JWT': tokens.entitlementsToken,
    'X-Riot-ClientVersion': clientVersion,
    'X-Riot-ClientPlatform': Buffer.from(
      JSON.stringify(clientPlatform)).toString('base64'),
  }
}

const ciphers = [
  'TLS_CHACHA20_POLY1305_SHA256',
  'TLS_AES_128_GCM_SHA256',
  'TLS_AES_256_GCM_SHA384',
  'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256'
];

const agent = new Agent({
  ciphers: ciphers.join(':'),
  honorCipherOrder: true,
  minVersion: 'TLSv1.2'
});

async function createSession(ssidCookie?: string) {
  return await axios({
    url: 'https://auth.riotgames.com/api/v1/authorization',
    method: 'POST',
    headers: {
      ...typeof ssidCookie === 'undefined' ? '' : { Cookie: ssidCookie },
      'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
    },
    data: {
      client_id: "play-valorant-web-prod",
      nonce: 1,
      redirect_uri: "https://playvalorant.com/opt_in",
      response_type: "token id_token",
      response_mode: "query",
      scope: "account openid"
    },
    httpsAgent: agent
  });
}

async function login(cookie: string, username: string, password: string) {
  return await axios({
    url: 'https://auth.riotgames.com/api/v1/authorization',
    method: 'PUT',
    headers: {
      Cookie: cookie,
      'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
    },
    data: {
      type: 'auth',
      username,
      password
    },
    httpsAgent: agent
  });
}

// parses the response url and returns the values we want
function parseUrl(uri: string) {
  const loginResponseURI: any = new URL(uri);
  const accessToken = loginResponseURI.searchParams.get('access_token');
  const idToken = loginResponseURI.searchParams.get('id_token')
  const expiresIn = parseInt(
    loginResponseURI.searchParams.get('expires_in'));

  return { accessToken, idToken, expiresIn };
}

// pas token can be used for getting the account
// region automatically
async function fetchPas(accessToken: string, idToken: string) {
  return await axios({
    url: 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant',
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    data: {
      id_token: idToken
    }
  });
}

async function fetchEntitlements(accessToken: string) {
  return await axios({
    url: 'https://entitlements.auth.riotgames.com/api/token/v1',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    data: {}
  });
}

async function fetchValorantVersion() {
  return await axios({
    url: 'https://valorant-api.com/v1/version',
    method: 'GET'
  });
}

class ValReauthScriptError extends Error {
  data;

  constructor(message: string, data?: any) {
    super(message);
    this.data = data;
  }
}
