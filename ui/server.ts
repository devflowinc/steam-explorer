const BASE_PATH = "./dist";
const cors = {
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT",
  },
};
Bun.serve({
  port: 5173,
  async fetch(req) {
    const pathname = new URL(req.url).pathname;

    if (pathname.startsWith("/api/games")) {
      const steamId = new URL(req.url).searchParams.get("user");

      try {
        const data = await fetch(
          `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${Bun.env.STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true`
        ).then((rsp) => rsp.json());
        if (!data.response?.games) {
          return Response.json(
            { error: "Private account" },
            {
              status: 500,
              ...cors,
            }
          );
        }
        const games = data.response.games.map((game) => ({
          ...game,
          img_icon_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
        }));

        return Response.json(
          {
            ...data.response,
            games,
          },
          cors
        );
      } catch (e) {
        return Response.json(
          { error: e },
          {
            status: 500,
            ...cors,
          }
        );
      }
    }

    const filePath =
      new URL(req.url).pathname !== "/"
        ? BASE_PATH + new URL(req.url).pathname
        : BASE_PATH + "/index.html";
    const file = Bun.file(filePath);

    return new Response(file);
  },
});
