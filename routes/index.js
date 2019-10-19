const Router = require("koa-router");
const router = new Router();

const v1 = require("./v1");

router.use("/v1", v1.routes(), v1.allowedMethods());
router.all("/", async (ctx, next) => {
  ctx.status = 306;
  ctx.body = `${ctx.request.URL} unused`;
});
module.exports = router;
