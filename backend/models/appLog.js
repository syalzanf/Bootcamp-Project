const { DataTypes } = require('sequelize');
const sequelize = require('../configdb'); // Pastikan ini mengarah ke konfigurasi Sequelize Anda

const AppLog = sequelize.define('AppLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  details: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appLogs', // Nama tabel di database
  timestamps: false // Karena tabel tidak memiliki kolom createdAt dan updatedAt
});

module.exports = AppLog;
