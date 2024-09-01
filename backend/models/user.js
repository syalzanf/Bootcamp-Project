const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');
const bcrypt = require('bcrypt');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  role: {
      type: DataTypes.STRING, // `character varying` in PostgreSQL corresponds to `STRING` in Sequelize
      allowNull: false
  },
  name: {
      type: DataTypes.STRING,
      allowNull: false
  },
  telepon: {
      type: DataTypes.STRING,
      allowNull: true
  },
  username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
  },
  password: {
      type: DataTypes.STRING,
      allowNull: false
  }
}, {
  timestamps: true,
});

// Hook untuk meng-hash password sebelum menyimpannya ke database
// User.beforeCreate(async (user) => {
//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   user.password = hashedPassword;
// });

module.exports = User;


























// const { DataTypes } = require('sequelize');
// const sequelize = require('../configdb');

// const User = sequelize.define('User', {
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true
//     },
//     password: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     role: {
//         type: DataTypes.ENUM('admin', 'cashier'),
//         allowNull: false
//     }
// }, {
//     tableName: 'users'
// });

// const Superadmin = sequelize.define('Superadmin', {
//     username: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true
//     },
//     password: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }
// }, {
//     tableName: 'superadmin'
// });

// module.exports = {User, Superadmin} ;