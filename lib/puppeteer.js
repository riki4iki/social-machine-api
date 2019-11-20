const puppeteer = require("puppeteer");
const events = require("./evenHandlers");

module.exports = {
  runBrowser: async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args:
        process.env.NODE_ENV == "development"
          ? [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--window-size=1000,786"
            ]
          : [
              "--window-size=800,600",
              "--no-sandbox",
              "--disable-setuid-sandbox"
            ]
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
    page.on("close", e => {
      events.pageHandler.emit("page.closed");
    });
    //await page.setRequestInterception(true);

    return page;
  },

  redirect: async (page, path) => {
    await page.goto(path, {
      waitUntil: "networkidle2"
    });
  },
  login: async (page, login, pass) => {
    const ID = {
      login: "input[name=email]",
      pass: "input[name=pass]"
    };
    await page.waitForSelector(ID.login).catch(err => {
      console.log(err.name);
    });

    await page.type(ID.login, login);

    await page.type(ID.pass, pass);
    await page.waitFor(250);
    (await page.$("#loginbutton"))
      ? await page.click("#loginbutton")
      : await page.click("button[type=submit]");
  },
  scroll: async (page, value) => {
    await page.evaluate(_viewportHeight => {
      window.scrollBy(0, _viewportHeight);
    }, value);
  }
};
