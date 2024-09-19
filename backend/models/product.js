const { DataTypes } = require('sequelize');
const Brand = require('./brand')
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
    // brand: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    id_brand: {
        type: DataTypes.INTEGER,
        references: {
            model: Brand,
            key: 'id_brand'
        },
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    color: {
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

Product.belongsTo(Brand, { foreignKey: 'id_brand', as: 'brand' });
module.exports = Product;