module.exports = (sequelize, dataTypes) => {
  const savedGroups = sequelize.define("savedGroups", {
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
    identifier: {
      type: dataTypes.STRING,
      allowNull: true
    }
  });
  return savedGroups;
};
