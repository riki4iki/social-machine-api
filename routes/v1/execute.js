const Router = require("koa-router");
const router = new Router();

const models = require("../../models");
const jwt = require("../../lib/jwt");

const fb = require("../../lib/facebookAPI");

const puppeteer = require("puppeteer");

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
router.post("/", user, async (ctx, next) => {
  const user = ctx.user;
  const password = ctx.request.body.pass;
  const groupId = ctx.request.body.idGroup;
  const group = await fb.getGroup(groupId, user.fb_token);
  /*console.log(group);
  console.log(user.dataValues);*/
  console.log(user.email, password);
  const browser = await puppeteer.launch({
    headless: false,
    args:
      process.env.NODE_ENV == "development"
        ? ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1366,768"]
        : ["--window-size=800,600"]
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
      login: "#email",
      pass: "#pass"
    };
    // login
    await page.goto("https://facebook.com", {
      waitUntil: "networkidle2"
    });
    await page.waitForSelector(ID.login);

    await page.type(ID.login, user.dataValues.email);

    await page.type(ID.pass, password);

    await page.click("#loginbutton");

    console.log("login done");
    await page.waitForNavigation();
    await page.goto(`https://www.facebook.com/groups/${group.id}`, {
      waitUntil: "networkidle2"
    });
    console.log(`redirected to https://www.facebook.com/groups/${group.id}`);

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
  let html = await page
    .evaluate(() => [...document.querySelectorAll("div")]) //contentArea
    .then(res => {
      console.log(res);
      return res;
    })
    .then(page => (ctx.body = page));
  ctx.body = "success";
  await next();
});

module.exports = router;
