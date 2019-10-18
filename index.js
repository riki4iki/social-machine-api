const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
require("dotenv").config();

const router = require("./routes");
const db = require("./models");

const app = new koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async (ctx, next) => {
    console.log(ctx.URL);
    await next();
  });

const port = process.env.PORT || 3000;

db.sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`server listening on ${port} port, ${process.pid} pid`);
    });
  })
  .catch(console.log);
