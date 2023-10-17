const { Model, DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

class Post extends Model {}

Post.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Judul post wajib diisi.",
        },
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Deskripsi post wajib diisi.",
        },
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Post",
    underscored: true,
  }
);

module.exports = Post;
