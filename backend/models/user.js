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
  },
  email: {
      type: DataTypes.STRING,
      allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,  // Menggunakan snake_case untuk kolom database
});



module.exports = User;


// Hook untuk meng-hash password sebelum menyimpannya ke database
// User.beforeCreate(async (user) => {
//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   user.password = hashedPassword;
// });


























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