const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');

const Member = sequelize.define('Member', {
  member_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  kode_member: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telepon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'members',
  timestamps: false
});

module.exports = Member;
