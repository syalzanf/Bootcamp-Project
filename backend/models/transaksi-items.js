const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');

const TransaksiItems = sequelize.define('TransaksiItems', {
    transaction_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'transaksi',
            key: 'id',
        },
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'products',
            key: 'id_product',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'transaksi_items',
    timestamps: false,
});

module.exports = TransaksiItems;
