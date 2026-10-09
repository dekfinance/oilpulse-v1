# Oil Pulse Worker V2

Cloudflare Worker with a mobile UI and live oil-news aggregation from Google News RSS searches across 10 monitored sources. No KV and no API key.

## GitHub / Cloudflare Workers Builds

Use these settings:

- Build command: `npm install`
- Deploy command: `npx wrangler deploy`
- Version command: leave blank (or use `npx wrangler versions upload` only if your Cloudflare workflow requires it)
- Root directory: `/`

The Worker name in `wrangler.jsonc` is `oilpulse-mvp-beta`. Change it only if your Cloudflare project has a different expected name.

## Endpoints

- `/` mobile dashboard
- `/api/news` live JSON
- `/health` deployment check

## Important

Article links are item-specific Google News links from the RSS feed. Google may redirect through its own news page before reaching a publisher. Publisher availability and paywalls are outside the app's control. Headline tone is a simple keyword screen and is not investment advice.
