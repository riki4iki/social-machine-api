const Rotuer = require("koa-router");
const router = new Rotuer();

router.all("/", async (ctx, next) => {
  ctx.status = 306;
  ctx.body = `${ctx.request.URL} unused`;
});

const auth = require("./auth");

router.use("/auth", auth.routes());

module.exports = router;
