module.exports = (seq, types) => {
  const user = seq.define("user", {
    id: {
      type: types.UUID,
      defaultValue: types.UUIDV1,
      primaryKey: true
    },
    name: {
      type: types.STRING,
      allowNull: false
    },
    picture: {
      type: types.STRING(500),
      allowNull: false
    },
    email: {
      type: types.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          args: true,
          msg: "email property does not follow email template (foo@bar.com)"
        },
        async isUnique(value, next) {
          const user = await seq.models.user.findOne({
            where: {
              email: value
            }
          });
          if (user) {
            const err = {
              message: "email address already exists",
              status: 400
            };
            await next(err);
          }
          await next();
        }
      }
    },
    fb_id: {
      type: types.STRING,
      allowNull: false
    },
    fb_token: {
      type: types.STRING,
      allowNull: false
    }
  });
  return user;
};
