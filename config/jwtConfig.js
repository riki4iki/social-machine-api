const genJti = range => {
  let jti = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < range; i++) {
    jti += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return jti;
};
module.exports = {
  secret: process.env.JWT_TOKEN_SECRET,
  refresh_token_life: process.env.NODE_ENV == "development" ? 86400 : 3888000,
  token_life: process.env.NODE_ENV == "development" ? 86400 : 1800,
  issuer: process.env.JWT_ISSUER,
  sub: process.env.JWT_SUB,
  jti: genJti(15)
};
