const Router = require("koa-router");
const router = new Router();

const _ = require("lodash");

const models = require("../../models");
const fb = require("../../lib/facebookAPI");
const jwt = require("../../lib/jwt");

router.post("/login", async (ctx, next) => {
  //here need login from previous api
  //input data: token from ux(facebook)
  const token = ctx.request.body.token;
  if (!token) {
    ctx.throw(401, "token requered");
  }
  const fbUser = await fb.getUser(token);
  let status = 200;
  console.log(token);
  if (!fbUser || fbUser.error) {
    ctx.throw(400, fbUser.error || "error with FACEBOOK api, something wrong");
  }

  let user = await models.user
    .findOne({
      where: {
        fb_id: fbUser.id
        //email: fbUser.email ? fbUser.email : ""
      }
    })
    .catch(err => ctx.throw(err));
  console.log(user.dataValues);
  if (!user) {
    const obj = {
      name: fbUser.name,
      picture: fbUser.picture.data.url,
      email: fbUser.email ? fbUser.email : null,
      fb_id: fbUser.id,
      fb_token: token
    };
    user = await models.user.create(obj).catch(err => ctx.throw(err));
    status = 201;
  }
  const longToken = await fb
    .generateLongLiveUserAccessToken(token)
    .catch(err => console.log(123123213));
  console.log(longToken);
  user = await user
    .update({ fb_token: longToken.access_token })
    .catch(err => ctx.throw(err));
  const pair = await jwt.createPair(user.id);

  user = _.omit(user.dataValues, "fb_token");
  ctx.status = status;
  ctx.body = { jwt: pair, user: user };

  await next();
});

router.post("/refresh", async (ctx, next) => {
  console.log(ctx.headers);
  const inputToken = ctx.headers.refreshtoken;
  const inputPayload = await jwt.getPayload(inputToken).catch(err => {
    ctx.throw(err.status, err.message);
  });

  const dbToken = (
    await models.refreshToken.findOne({
      where: { userId: inputPayload.id }
    })
  ).dataValues.refreshToken;

  const dbPayload = await jwt.getPayload(dbToken).catch(err => {
    ctx.throw(err.status, err.message);
  });
  if (!(inputToken == dbToken)) {
    ctx.throw(400, "invalid refresh token");
  }
  const pair = await jwt.createPair(inputPayload.id);
  console.log(
    `getting new jwt pair: old ${inputToken}, new ${pair.accessToken}`
  );
  ctx.status = 201;
  ctx.body = pair;

  await next();
});
module.exports = router;
