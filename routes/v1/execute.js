const Router = require("koa-router");
const router = new Router();
const WebSocket = require("ws");
const models = require("../../models");
const jwt = require("../../lib/jwt");

const fb = require("../../lib/facebookAPI");

const puppeteer = require("puppeteer");
/*const wss = new WebSocket.Server({ port: 8080 });
wss.on("listening", () => {
  console.log("ws start");
});
wss.on("connection", function connection(ws) {
  console.log("12313");
  ws.on("message", message => {
    console.log("received: ", message);
    ws.send(message);
  });

  ws.send("something");
  ws.on("close", message => {
    console.log("CLOSEd");
  });
});
*/
const user = async (ctx, next) => {
  const access = ctx.headers.accesstoken;
  const payload = await jwt
    .getPayload(access)
    .catch(err => ctx.throw(err.status, err.message));
  const id = payload.id;

  const user = await models.user.findByPk(id).catch(err => ctx.throw(err));
  if (!user) ctx.throw(204);

  ctx.user = user;
  await next();
};
router.get("/openws", async (ctx, next) => {
  console.log("can i open ws?");

  ctx.body = "+";
});
router.get("/clients", async (ctx, next) => {
  console.log(wss.clients);
  ctx.body = wss.clients.size;
});

router.post("/", user, async (ctx, next) => {
  const user = ctx.user;
  const username = user.email ? user.email : ctx.request.body.login;
  const password = ctx.request.body.password;
  /*console.log(group);
  console.log(user.dataValues);*/
  console.log(user.email, password);
  const browser = await puppeteer.launch({
    headless: false,
    args:
      process.env.NODE_ENV == "development"
        ? ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1366,768"]
        : ["--window-size=800,600", "--no-sandbox", "--disable-setuid-sandbox"]
  });
  const context = browser.defaultBrowserContext();
  //        URL                  An array of permissions
  context.overridePermissions("https://www.facebook.com", [
    "geolocation",
    "notifications"
  ]);
  const page = await browser.newPage();
  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 2
  });
  let login = async () => {
    const ID = {
      login: "input[name=email]",
      pass: "input[name=pass]"
    };
    // login
    await page.goto("https://facebook.com", {
      waitUntil: "networkidle2"
    });

    const element = await page.$("#name");
    console.log(await element);

    await page.waitForSelector(ID.login).catch(err => {
      console.log(err.name);
    });

    await page.type(ID.login, username);

    await page.type(ID.pass, password);
    if (await page.$("#loginbutton")) {
      await page.click("#loginbutton");
    } else {
      await page.click("button[type=submit]");
    }

    console.log("login done");
    await page.waitForNavigation();
    await page.goto(`https://www.facebook.com/feed`, {
      waitUntil: "networkidle2"
    });
    console.log(
      `redirected to https://www.facebook.com/groups/HOPEmusicproject`
    );

    /*const bodyHandle = await page.$("#pagelet_group_");

    let height = 100000;
    console.log(height);
    function wait(ms) {
      return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    const viewportHeight = page.viewport().height;
    console.log(viewportHeight);
    let viewportIncr = 0;
    while (viewportIncr + viewportHeight < height + 5000) {
      console.log(viewportIncr + viewportHeight, height);
      await page.evaluate(_viewportHeight => {
        window.scrollBy(0, _viewportHeight);
      }, viewportHeight);
      await wait(200);
      viewportIncr = viewportIncr + viewportHeight;
      console.log(height);
    }*/

    // Some extra delay to let images load
    //await wait(100);
    /*
    await page.screenshot({
      path: "facebook.png"
    });*/
    const res = await page.$$("._8c74");
    await res.map(async item => {
      await item.$eval("a", ele => ele.click());
      //console.log(item);
      //console.log(await item.evaluate(ele => ele.after("::")));
    });
    await res.map(async item => {
      const local = await item.$("a");
      console.log(await local.evaluate(ele => ele.outerHTML));
    });
  };
  await login().catch(err => ctx.throw(err));
  //await browser.close();

  ctx.body = "success";
  await next();
});

module.exports = router;
