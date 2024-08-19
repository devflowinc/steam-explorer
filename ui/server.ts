const BASE_PATH = "./dist";

Bun.serve({
  port: 5173,
  async fetch(req) {
    const pathname = new URL(req.url).pathname;

    if (pathname.startsWith("/api/games")) {
      const steamId = new URL(req.url).searchParams.get("user");

      const data = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=17DF2A0DA467DC161B5ECDDBCBF976FF&steamid=${steamId}&format=json&include_appinfo=true`
      ).then((rsp) => rsp.json());

      const games = data.response.games.map((game) => ({
        ...game,
        img_icon_url: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
      }));
      const res = Response.json({
        ...data.response,
        games,
      });

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      return res;
    }
    const filePath =
      new URL(req.url).pathname !== "/"
        ? BASE_PATH + new URL(req.url).pathname
        : BASE_PATH + "/index.html";
    const file = Bun.file(filePath);

    return new Response(file);
  },
});
