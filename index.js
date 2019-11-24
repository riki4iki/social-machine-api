const http = require("http");

require("dotenv").config();

const koa = require("koa");

const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("@koa/cors");
const Router = require("koa-router");

const api = require("./routes");
const db = require("./models");
const wsConfig = require("./config/wsConfig");

const router = new Router();
router.use("/api", api.routes(), api.allowedMethods());

const corsOpt = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  exposedHeaders: ["x-auth-token"]
};

const app = new koa();

const server = http.createServer(app.callback());

const wss = wsConfig.create(server);
server.on("upgrade", (req, socket, head) => {
  console.log("upgrade");
});
app
  .use(logger())
  .use(cors())
  .use(bodyParser())
  .use(router.routes());

const port = process.env.PORT || 3000;

app.on("error", (err, ctx) => {
  console.log(err);
  ctx.writable = false;
  let message = "";
  let status = err.status || 500;
  //if (!ctx || ctx.headerSend || !ctx.writable) return;
  switch (err.name) {
    case "SequelizeValidationError": {
      err.errors.forEach(element => {
        message += `${element.message}\n`;
      });
      status = 400;
    }
    default: {
      message = err.message;
    }
  }
  /*
  ctx.status = status;
  ctx.res.end(message);*/
});

db.sequelize
  .sync()
  .then(() => {
    server.listen(port, () => {
      console.log(`server listening on ${port} port, ${process.pid} pid`);
    });
  })
  .catch(err => {
    console.log("catched with server starting....");
    console.log(err);
  });
