module.exports = (sequelize, dataTypes) => {
  const refreshToken = sequelize.define("refreshToken", {
    id: {
      type: dataTypes.UUID,
      primaryKey: true,
      defaultValue: dataTypes.UUIDV1
    },
    userId: {
      type: dataTypes.UUID,
      references: {
        model: "users",
        key: "id"
      }
    },
    refreshToken: {
      type: dataTypes.TEXT,
      allowNull: false
    }
  });
  return refreshToken;
};
