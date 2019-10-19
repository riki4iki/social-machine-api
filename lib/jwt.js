const jwt = require("jsonwebtoken");
const config = require("../config/jwtConfig");

const models = require("../models");

module.exports = {
  async generateAccessToken(id) {
    const payLoad = {
      id: id,
      jti: config.jti,
      iss: config.issuer,
      sub: config.sub,
      alg: "HS256"
    };
    return jwt.sign(payLoad, config.secret, {
      expiresIn: config.token_life
    });
  },
  async generateRefreshToken(id) {
    const payLoad = {
      id: id,
      jti: config.jti,
      iss: config.issuer,
      sub: config.sub,
      alg: "HS256"
    };
    return jwt.sign(payLoad, config.secret, {
      expiresIn: config.refresh_token_life
    });
  },
  async getPayload(token) {
    try {
      const payLoad = await jwt.verify(token, config.secret);
      return payLoad;
    } catch (err) {
      return Promise.reject({ ...err, ...{ status: 401 } });
    }
  },
  async createPair(id) {
    //before giving new token pairs need to check old refresh token in db for this user
    // if hasn't need create a new row in db with this userId
    // if has need update row

    const access = await this.generateAccessToken(id);
    const refresh = await this.generateRefreshToken(id);
    const exp = (await this.getPayload(access)).exp;

    const oldRefToken = await models.refreshToken.findOne({
      where: { userId: id }
    });
    const obj = {
      userId: id,
      refreshToken: refresh
    };
    if (!oldRefToken) {
      await models.refreshToken.create(obj).catch(err => next(err));
    } else {
      oldRefToken.update(obj).catch(err => next(err));
    }
    return {
      accessToken: access,
      refreshToken: refresh,
      expiresIn: exp
    };
  }
};
