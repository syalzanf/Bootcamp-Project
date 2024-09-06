const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');

const Product = sequelize.define('Product', {
    id_product: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_code: {
        type: DataTypes.STRING,
        unique: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    images: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'products',
    timestamps: false,
});

module.exports = Product;