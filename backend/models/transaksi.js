const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');
// const Brand = require('./brand')


const Transaksi = sequelize.define('Transaksi', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,   
    },
    transaction_code: {
        type: DataTypes.STRING,
        unique: true,
        },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cashier: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_cashier: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transaction_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    total: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    payment: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    change: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    items: {
        type: DataTypes.JSONB,  
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('debit', 'cash', 'gopay', 'ovo', 'dana'),
        allowNull: false,
    },  
    debit: {
        type: DataTypes.STRING(50),
        allowNull: true,
    }
}, {
    tableName: 'transaksi',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        // Hook beforeCreate untuk mengenerate transaction_code
        beforeCreate: async (transaction) => {
            // Ambil transaksi terakhir berdasarkan ID
            const lastTransaction = await Transaksi.findOne({
                order: [['id', 'DESC']],
                attributes: ['transaction_code']

            });
 
            let nextTransactionCode = 'TRX10001'; // Kode default untuk transaksi pertama

            if (lastTransaction) {
                // Ambil bagian angka dari kode transaksi terakhir dan increment
                const lastTransactionCode = lastTransaction.transaction_code;
                const lastNumber = parseInt(lastTransactionCode.replace('TRX', ''), 10);
                nextTransactionCode = 'TRX' + (lastNumber + 1).toString().padStart(5, '0');
            }

            transaction.transaction_code = nextTransactionCode;


            // if (transaction.items && Array.isArray(transaction.items)) {
            //     for (let item of transaction.items) {
            //         const product = await Product.findByPk(item.id_product);
            //         if (product) {
            //             if (product.stock >= item.qty) {
            //                 product.stock -= item.qty;
            //                 await product.save();  // Pastikan save() dipanggil untuk menyimpan perubahan
            //             } else {
            //                 throw new Error(`Not enough stock for product ${product.product_name}`);
            //             }
            //         } else {
            //             throw new Error(`Product with ID ${item.id_product} not found`);
            //         }
            //     }
            // }
        }
    }
});

const Member = sequelize.define('Member', {
    member_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    kode_member: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telepon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'members',
    timestamps: false,    
});


  
Transaksi.belongsTo(Member, { foreignKey: 'member_id' });
// Transaksi.belongsTo(Brand, { foreignKey: 'id_brand' });

Member.hasMany(Transaksi, { foreignKey: 'member_id' });

module.exports = {Transaksi, Member};
