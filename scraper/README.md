 # Running instructions

There are 2 ways to run

"Bare metal"

1) `docker compose up -d redis`
2) `yarn`
3) `node scraper.js -R redis://127.0.0.1`
4) `node scrapeStream.js -R redis://127.0.0.1` (N times based on rate limits)
5) `cp .env.dist .env`
6) Modify TRIEVE_KEY and TRIEVE_DATASET to your api key and dataset id
7) `yarn build` (Runs upload-steam-games.ts)

"All Docker"

1) `cp .env.dist .env`
2) Modify TRIEVE_KEY and TRIEVE_DATASET to your api key and dataset id
3) `docker compose up -d --build --scale scrapeSteam=3` # Increase based on rate limits
4) `docker compose logs -f` to monitor


