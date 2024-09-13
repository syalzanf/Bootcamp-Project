const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');

const Brand = sequelize.define('Brand', {
    id_brand: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    brand_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    }
}, {
    tableName: 'brands',
    timestamps: false,
});

module.exports = Brand;
