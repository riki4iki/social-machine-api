const browser = require("../lib/puppeteer");
const events = require("../lib/evenHandlers");

const _ = require("lodash");
const Content = require("../lib/content");

const WebSocket = require("ws");

module.exports = {
  create: http => {
    const wss = new WebSocket.Server({ server: http, path: "/ws" });

    wss.on("listening", onListening);
    wss.on("connection", onConnection);
    wss.on("error", () => console.log("need method for wss.onerror"));
    wss.on("headers", () => console.log("need method for wss.onheadres"));
    wss.addListener("event", () => {
      console.log("added event");
    });
    return wss;
  }
};

const onListening = () => {
  console.log("wss start listen");
};
const onConnection = async (ws, req) => {
  console.log(
    `start websocket connection from ${req.connection.remoteAddress}`
  );

  ws.on("message", function incoming(message) {
    console.log(`received: ${message} from ${req.connection.remoteAddress}`);

    content.content ? content.next() : ws.send("NETU ETOI HUINI");
  });

  ws.on("close", () => {
    console.log(`closed connection with ${req.connection.remoteAddress}`);
  });
  ws.send("connect");

  events.pageHandler.on("page.closed", () => {
    ws.terminate();
  });

  const username = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASS;
  console.log(username, password);
  const page = await browser.runBrowser();

  ws.send("open browser");
  //need to redirect to facebook for login
  await browser.redirect(page, "https://facebook.com");
  ws.send("redirect to facebook, try to login...");
  await browser.login(page, username, password);
  ws.send("login done, redirect to feed...");
  await browser.redirect(page, "https://facebook.com/feed");
  await page.waitFor(1000);

  const content = new Content(page);

  const feed = await page.$("div[id^='more_pager_pagelet_']"); //more_pager_pagelet_5dd32c80442a01762977731
  content
    .update()
    .then(arr => arr.length)
    .then(l => ws.send(l));

  /* const blocks = await feed.$$("._4ikz");
  blocks.map(item => {
    item
      .boundingBox()
      .then(box => box)
      .then(h => {
        console.log(`block:`);
        console.log(h);
      });

    item.$$("div[id^='hyperfeed_story_id_']").then(elementHandle => {
      //console.log(elementHandle);
      elementHandle.map(item => {
        item
          .boundingBox()
          .then(box => box)
          .then(h => {
            console.log(`div:`);
            console.log(h);
          });
        //item.evaluate(ele => ele.outerHTML).then(console.log);
      });
    }); //hyperfeed_story_id_5dd32e4a4a1e42f55879970
  });*/
  console.log("ready");
  ws.send("feed ready");
};
