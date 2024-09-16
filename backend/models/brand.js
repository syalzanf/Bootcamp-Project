const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');
// const Transaksi = require('./transaksi');


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


// Brand.hasMany(Transaksi, { foreignKey: 'id_brand' });

module.exports = Brand;
