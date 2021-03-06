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
  const savedGroups = await models.savedGroups
    .findAll({
      where: { userId: user.id }
    })
    .catch(err => ctx.throw(err));
  if (!savedGroups) {
    ctx.status = 204;
  } else {
    ctx.body = savedGroups;
  }
  await next();
});

router.post("/savedGroups/save", user, async (ctx, next) => {
  const identifier = ctx.request.body.identifier;
  const user = ctx.user;
  await models.savedGroups
    .findOrCreate({
      where: { userId: user.id, identifier: identifier }
    })
    .catch(err => ctx.throw(err, 400));
  ctx.status = 201;
  await next();
});

router.get("/savedGroups/:id", user, async (ctx, next) => {
  const user = ctx.user;
  const groupId = ctx.params.id;

  const group = await models.savedGroups
    .findAll({ where: { userId: user.id, id: groupId } })
    .catch(err => ctx.throw(err));

  ctx.body = group;
  await next();
});

router.delete("/savedGroups/:id/delete", user, async (ctx, next) => {
  const user = ctx.user;
  const groupId = ctx.params.id;

  const group = await models.savedGroups.findOne({
    where: { userId: user.id, id: groupId }
  });
  group && (await group.destroy().catch(err => ctx.throw(err)));
  ctx.status = 204;
  await next();
});
module.exports = router;
