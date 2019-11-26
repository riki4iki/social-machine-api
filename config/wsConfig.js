const events = require("../lib/evenHandlers");

const Browser = require("../lib/browser");

const WebSocket = require("ws");

const sessions = [];

module.exports = {
  create: http => {
    const wss = new WebSocket.Server({ server: http, path: "/ws" });

    wss.on("listening", onListening);
    wss.on("connection", onConnection);
    wss.on("error", () => console.log("need method for wss.onerror"));
    wss.on("headers", headers => console.log(headers));
    wss.addListener("page.closed", () => {
      console.log("page closssssssssssssssss");
    });
    return wss;
  }
};

const onListening = () => {
  console.log("wss start listen");
};
const onConnection = async (ws, req) => {
  const userId = req.headers["sec-websocket-protocol"];

  const url = require("url").parse(req.url, true).query;
  const username = url.username;
  const password = url.password;

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
          .then(() => browser.like())
          .then(() => browser.current())
          .then(html => ws.send(html));
      }
      if (obj.type === "prev") {
        browser
          .previous()
          .then(() => browser.like())
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
  await send(ws, { type: "connection", data: "connect" });

  events.pageHandler.on("page.closed", () => {
    ws.terminate();
  });

  const browser = new Browser(userId);
  await send(ws, { type: "connection", data: "open browser...." });
  await browser.runBrowser();
  await send(ws, { type: "connection", data: "redirect to facebook..." });
  await browser.redirect("https://facebook.com");
  await send(ws, { type: "connection", data: "login...." });
  await browser.login(username, password);
  await send(ws, { type: "connection", data: "redirect to feed..." });
  await browser.redirect("https://facebook.com/feed");
  await send(ws, { type: "connection", data: "parse feed..." });
  await browser
    .init()
    .then(() => browser.like())
    .then(() => browser.current())
    .then(html => ws.send(html));
  //connection end
};
const send = async (ws, message) => {
  const str = JSON.stringify(message);

  return ws.send(str);
};
