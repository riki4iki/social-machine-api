const browser = require("../lib/puppeteer");
const events = require("../lib/evenHandlers");

const _ = require("lodash");
const Browser = require("../lib/browser");

const WebSocket = require("ws");

const sessions = [];

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
  const userData = req.headers["sec-websocket-protocol"].toString().split("^");
  const userId = userData[0];
  console.log(req.headers);
  if (sessions[userId]) {
    const before = sessions[userId];
    before.close();
    sessions[userId] = ws;
  } else {
    sessions[userId] = ws;
    console.log("new user");
  }
  console.log(
    `start websocket connection from ${req.connection.remoteAddress}`
  );
  ws.on("message", function incoming(message) {
    const obj = JSON.parse(message);
    if ("type" in obj) {
      console.log(obj);
      if (obj.type === "next") {
        browser
          .next()
          .then(() => browser.current())
          .then(html => ws.send(html));
      }
      if (obj.type === "prev") {
        browser
          .previous()
          .then(() => browser.current())
          .then(html => ws.send(html));
      }
      if (obj.type === "like") {
        browser.like();
      }
    }
  });

  ws.on("close", () => {
    console.log(`closed connection with ${req.connection.remoteAddress}`);
    browser.dispose();
  });
  ws.send("connect");

  events.pageHandler.on("page.closed", () => {
    ws.terminate();
  });

  const username = userData[1];
  const password = userData[2];
  console.log(username, password);

  const browser = new Browser(userId);
  ws.send("open browser....");
  await browser.runBrowser();
  ws.send("redirect to facebook....");
  await browser.redirect("https://facebook.com");
  ws.send("login....");
  await browser.login(username, password);
  ws.send("redirect to feed...");
  await browser.redirect("https://facebook.com/feed");
  ws.send("parse feed...");
  await browser
    .init()
    .then(() => browser.current())
    .then(html => ws.send(html));
  //connection end
};
