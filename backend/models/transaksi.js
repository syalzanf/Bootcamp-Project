const { DataTypes } = require('sequelize');
const sequelize = require('../configdb');

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
    }
}, {
    tableName: 'transaksi',
    timestamps: false,
    hooks: {
        // Hook beforeCreate untuk mengenerate transaction_code
        beforeCreate: async (transaction) => {
            // Ambil transaksi terakhir berdasarkan ID
            const lastTransaction = await Transaksi.findOne({
                order: [['id', 'DESC']]
            });

            let nextTransactionCode = 'TRX10001'; // Kode default untuk transaksi pertama

            if (lastTransaction) {
                // Ambil bagian angka dari kode transaksi terakhir dan increment
                const lastTransactionCode = lastTransaction.transaction_code;
                const lastNumber = parseInt(lastTransactionCode.replace('TRX', ''), 10);
                nextTransactionCode = 'TRX' + (lastNumber + 1).toString().padStart(5, '0');
            }

            transaction.transaction_code = nextTransactionCode; // Set kode transaksi baru
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
Member.hasMany(Transaksi, { foreignKey: 'member_id' });

module.exports = {Transaksi, Member};
