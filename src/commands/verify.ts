import axios from "axios";
import type { CommandInteraction, Message } from "discord.js";
import {
    Discord,
    Slash,
    SlashOption,
} from "discordx";
import { Agent } from "https";

import { postgresConfig } from "../config/typeorm";
import { User } from "../entities";

@Discord()
export class Verify {
    @Slash("verify", { description: "validate two-factor authentication." })
    slashVerify(
        @SlashOption("code", { description: "2FA Authentication Code" })
        code: string,
        command: CommandInteraction): void {
        command.deferReply();
        this.verify(code, command);
    }

    async verify(code: string, command: CommandInteraction): Promise<void> {
        try {
            let response;
            const userRepo = await postgresConfig.getRepository(User);
            const users = await userRepo.find({
                where: {
                    userId: command.user.id
                }
            });
            if (users.length === 0) {
                command.editReply("Account not found");
                return;
            }
            const user = users[0];
            if (!user.cookie) {
                command.editReply("Invaild token info, please login again");
                return;
            }

            const response2fa: any = await send2faCode(user.cookie, code)
                .catch(err => {
                    if (typeof err.response.data === 'undefined')
                        throw new ValReauthScriptError('unknown error', err.response);
                    if (err.response.data.error === 'rate_limited')
                        throw new ValReauthScriptError('too many 2fa requests');
                    throw new ValReauthScriptError('unknown error', err.response.data);
                });

            const asidCookie = response2fa.headers['set-cookie'].find((cookie: string) => /^asid/.test(cookie));

            if (response2fa.data.type === 'response') {
                response = response2fa;
            }
            // check response
            if (typeof response2fa.data.error !== 'undefined') {
                if (response2fa.data.error === 'multifactor_attempt_failed')
                    throw new ValReauthScriptError('too many 2fa requests');
                if (response2fa.data.error === 'rate_limited')
                    throw new ValReauthScriptError('too many 2fa requests');
                throw new ValReauthScriptError('unknown error', response2fa.data);
            }

            // extract ssid cookie
            // const ssidCookie = response.headers['set-cookie'].find((cookie: string) => /^ssid/.test(cookie));

            // extract tokens from the url
            const tokens: any = parseUrl(response.data.response.parameters.uri);

            tokens.entitlementsToken =
                (await fetchEntitlements(tokens.accessToken)).data.entitlements_token;

            // parse access token and extract puuid
            const puuid = JSON.parse(Buffer.from(
                tokens.accessToken.split('.')[1], 'base64').toString()).sub;

            // fetch pas token - not required, instead we only want the region
            // since we already fetched it let's save it, because why not
            const pasTokenResponse = await fetchPas(tokens.accessToken, tokens.idToken);
            tokens.pasToken = pasTokenResponse.data.token;

            // const region = pasTokenResponse.data.affinities.live;

            const clientVersion = (await fetchValorantVersion()).data.data.riotClientVersion;

            command.editReply(`Verify Done`);
            const headers = makeHeaders(tokens, clientVersion, clientPlatform);
            user.headers = JSON.stringify(headers);
            user.puuid = puuid;
            userRepo.save(user);
        } catch (error: any) {
            command.editReply(`There was an error while executing this command!, Please try again later`);
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

async function send2faCode(cookie: string, code: string, rememberDevice = true) {
    return await axios({
        url: 'https://auth.riotgames.com/api/v1/authorization',
        method: 'PUT',
        headers: {
            Cookie: cookie,
            'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
        },
        data: {
            type: 'multifactor',
            code,
            rememberDevice
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
