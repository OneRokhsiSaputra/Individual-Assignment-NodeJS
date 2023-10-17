const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("./sequelize");

class User extends Model {}

User.init(
  {
    username: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Nama pengguna diperlukan.",
        },
        len: {
          args: [4, 15],
          msg: "Panjang nama pengguna harus antara 4 dan 15 karakter.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password pengguna diperlukan.",
        },
        validate(value) {
          if (value.length < 8) {
            throw new Error("Password panjangnya harus lebih dari 8 karakter!");
          }
        },
      },
      set(value) {
        if (value.length < 8) throw { error: { message: "Password panjangnya harus lebih dari 8 karakter!" } };
        this.setDataValue("password", bcrypt.hashSync(value, 10));
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Masukkan alamat email yang valid!",
        },
        notNull: {
          msg: "Email diperlukan.",
        },
      },
    },
    roles: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    sequelize,
    modelName: "User",
    underscored: true,
  }
);

module.exports = User;
