import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";

const TWITCH_USERNAME = "derpmonster83";
const STATUS_CACHE_SECONDS = 30;

let accessToken: string | null = null;
let accessTokenExpiresAt = 0;

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
	if (accessToken != null && Date.now() < accessTokenExpiresAt) {
		return accessToken;
	}

	const tokenUrl = new URL("https://id.twitch.tv/oauth2/token");
	tokenUrl.searchParams.set("client_id", clientId);
	tokenUrl.searchParams.set("client_secret", clientSecret);
	tokenUrl.searchParams.set("grant_type", "client_credentials");

	const response = await fetch(tokenUrl, { method: "POST" });

	if (response.ok === false) {
		throw new Error(`Twitch token request failed with ${response.status}`);
	}

	const tokenData = (await response.json()) as { access_token: string; expires_in: number };
	accessToken = tokenData.access_token;
	accessTokenExpiresAt = Date.now() + Math.max(0, tokenData.expires_in - 60) * 1000;

	return accessToken;
}

export async function GET() {
	const clientId = env.TWITCH_CLIENT_ID;
	const clientSecret = env.TWITCH_CLIENT_SECRET;

	if (clientId == null || clientSecret == null) {
		return json({ isLive: false, configured: false });
	}

	try {
		const token = await getAccessToken(clientId, clientSecret);
		const streamsUrl = new URL("https://api.twitch.tv/helix/streams");
		streamsUrl.searchParams.set("user_login", TWITCH_USERNAME);

		const response = await fetch(streamsUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				"Client-Id": clientId
			}
		});

		if (response.ok === false) {
			throw new Error(`Twitch streams request failed with ${response.status}`);
		}

		const streams = (await response.json()) as { data: unknown[] };

		return json(
			{ isLive: streams.data.length > 0, configured: true },
			{
				headers: {
					"Cache-Control": `public, max-age=${STATUS_CACHE_SECONDS}, s-maxage=${STATUS_CACHE_SECONDS}, stale-while-revalidate=${STATUS_CACHE_SECONDS}`
				}
			}
		);
	} catch (error) {
		console.error("unable to check Twitch live status", error);
		return json({ isLive: false, configured: true }, { status: 502 });
	}
}
