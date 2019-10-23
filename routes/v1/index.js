const Rotuer = require("koa-router");
const router = new Rotuer();

router.all("/", async (ctx, next) => {
  ctx.status = 306;
  ctx.body = `${ctx.request.URL} unused`;
});

const auth = require("./auth");
const user = require("./user");
const exec = require("./execute");

router.use("/auth", auth.routes());
router.use("/user", user.routes());
router.use("/execute", exec.routes());

module.exports = router;
