const Router = require("koa-router");
const router = new Router();

const models = require("../../models");
const jwt = require("../../lib/jwt");

const fb = require("../../lib/facebookAPI");

const user = async (ctx, next) => {
  const access = ctx.headers.accesstoken;
  const payload = await jwt.getPayload(access).catch(err => {
    ctx.throw(err.status, err.message);
  });
  const id = payload.id;

  const user = await models.user.findByPk(id).catch(err => {
    console.log(err);
    ctx.throw(err);
  });
  if (!user) ctx.throw(204);

  ctx.user = user;
  await next();
};

router.get("/", user, async (ctx, next) => {
  //here need return auth user
  ctx.status = 200;
  ctx.body = ctx.user;
});

router.get("/groups", user, async (ctx, next) => {
  const user = ctx.user;
  const groups = await fb.getGroups(user.fb_id, user.fb_token);
  ctx.body = groups;
});

router.get("/groups/:id", user, async (ctx, next) => {
  const user = ctx.user;
  const groupId = ctx.params.id;
  const group = await fb.getGroup(groupId, user.fb_token);
  ctx.body = group;
});

router.get("/savedGroups", user, async (ctx, next) => {
  const user = ctx.user;

  const savedGroups = await models.savedGroups.findAll({
    where: { userId: user.id }
  });

  ctx.body = savedGroups;
});

router.post("/savedGroups/save", user, async (ctx, next) => {
  const url = ctx.request.body.url;
  const user = ctx.user;
  await models.savedGroups
    .create({ userId: user.id, url: url })
    .catch(err => ctx.throw(err));
  ctx.status = 201;
});

router.get("/savedGroups/:id", user, async (ctx, next) => {
  const user = ctx.user;
  const groupId = ctx.params.id;

  const group = await models.savedGroups
    .findAll({ where: { userId: user.id, id: groupId } })
    .catch(err => ctx.throw(err));

  ctx.body = group;
});
module.exports = router;
