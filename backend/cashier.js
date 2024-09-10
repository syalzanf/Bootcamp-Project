const bcrypt = require('bcrypt');
const pool = require('./connection');
const {Transaksi, Member} = require('./models/transaksi');
const sequelize = require('./configdb');
const Product = require ('./models/product')
// const Member = require ('./models/member')



// Fungsi untuk login kasir
async function cashierLogin(username, password) {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            throw new Error('Username atau password salah');
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new Error('Username atau password salah');
        }

        if (user.role === 'cashier') {
            return { message: 'Login berhasil', role: user.role };
        } else {
            throw new Error('Akses ditolak');
        }
    } catch (error) {
        throw new Error('Terjadi kesalahan server: ' + error.message);
    }
}

// Fungsi untuk mendapatkan semua produk
async function getListProducts() {
    try {
        // Query untuk mengambil semua data produk dari database
        const result = await pool.query('SELECT product_code, product_name, brand, type, price, stock FROM products');
        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}

// Fungsi untuk mendapatkan produk berdasarkan ID
async function getProductById(id) {
    try {
        const result = await pool.query('SELECT product_code, brand, type, price, stock, image FROM products WHERE id_products = $1', [id]);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
    }
}

// Fungsi untuk menambahkan customer
async function addCustomer({ nama, telepon, alamat }) {
    
    try {
        const result = await pool.query(
            'INSERT INTO members (nama, telepon, alamat) VALUES ($1, $2, $3) RETURNING *',
            [nama, telepon, alamat]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Error adding customers: ' + error.message);
    }
}

// Fungsi untuk mendapatkan semua data customer
async function getListCustomers() {
    try {
        const result = await pool.query('SELECT * FROM members');
        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}

// Fungsi untuk mengupdate customer
async function updateCustomer(id, { nama, telepon, alamat }) {
    try {
        const result = await pool.query(
            'UPDATE members SET nama = $1, telepon = $2, alamat = $3 WHERE member_id = $4 RETURNING *',
            [nama, telepon, alamat, id]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error('Error adding customers: ' + error.message);
    }
}

async function deleteCustomer(id) {
    try {
      const result = await pool.query(
        `DELETE FROM members WHERE member_id = $1 RETURNING *`,
        [id]
      );
  
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
  
      return {
        message: 'Customer deleted successfully',
        user: result.rows[0],
      };
    } catch (error) {
      throw error;
    }
}

// async function createTransaction({ transaction_code, member_id, id_cashier, cashier, total, payment_method, debit, payment, change, items }) {
//     try {
//         console.log('Menerima data transaksi:', { transaction_code, member_id, id_cashier, cashier, total, payment_method, debit, payment, change, items });

//         // // Variabel member_id
//         // let member_id = null;

//         // if (kode_member) {
//         //     const member = await Member.findOne({ where: { kode_member } });
//         //     if (member) {
//         //         member_id = member.id;
//         //     } else {
//         //         throw new Error('Member not found');
//         //     }
//         // }

//         // Simpan transaksi dengan items sebagai JSON
//         const newTransaction = await Transaksi.create({
//             transaction_code,
//             member_id: member_id !== null ? member_id : 0,
//             id_cashier,
//             cashier,
//             transaction_date: new Date(),
//             total,
//             payment_method,
//             debit,
//             payment,
//             change,
//             items // Simpan items sebagai JSON
//         });

//         console.log('Transaksi berhasil dibuat:', newTransaction);

//         // Simpan item transaksi dan perbarui stok produk
//         for (const item of items) {
//             const product = await Product.findOne({ where: { product_code: item.product_code } });
//             if (!product) {
//                 throw new Error(`Product with code ${item.product_code} not found.`);
//             }

//             if (product.stock < item.qty) {
//                 throw new Error(`Insufficient stock for product ${item.product_code}.`);
//             }

//             const newStock = product.stock - item.qty;
//             await Product.update({ stock: newStock }, { where: { product_code: item.product_code } });

//             // Simpan item transaksi jika perlu, atau lakukan tindakan lain yang diperlukan
//             // await TransaksiItems.create({
//             //     transaction_code: newTransaction.transaction_code,
//             //     product_code: item.product_code,
//             //     quantity: item.qty,
//             //     price: item.price,
//             //     brand: item.brand,
//             //     type: item.type
//             // });
//         }

//         return newTransaction;
//     } catch (error) {
//         console.error('Error creating transaction:', error);
//         throw new Error('Error creating transaction: ' + error.message);
//     }
// }

async function createTransaction({ transaction_code, member_id, id_cashier,  cashier, total, payment_method, debit, payment, change, items }) {

    try {

        const newTransaction = await Transaksi.create({
            transaction_code,
            member_id: member_id !== null ? member_id : 0, // Simpan member_id jika ada, jika tidak null
            id_cashier,
            cashier,
            transaction_date: new Date(),
            total,
            payment_method,
            debit,
            payment,
            change,
            items,
        });

        console.log(items);
        
          for (const item of items) {
            const result = await pool.query('SELECT * FROM products WHERE product_code = $1', [item.product_code]);
            if (result.rows.length === 0) {
                throw new Error('Product not found');
            }
            console.log(result.rows[0]);
            const stok = result.rows[0].stock - item.qty;
        
            if (stok < 0) {
                throw new Error(`Insufficient stock for product ${product.product_code}. Available stock: ${product.stock}, requested: ${item.qty}`);
            }

            await pool.query('update products SET stock = $1  WHERE product_code = $2', 
            [stok,
                item.product_code]);

        }

        return newTransaction;
    } catch (error) {
        throw new Error('Error creating transaction: ' + error.message);
    }
}

async function getTransactionById(transaction_id) {
    try {
        const transaction = await Transaksi.findOne({
            where: { id: transaction_id }
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    } catch (error) {
        throw new Error('Error fetching transaction: ' + error.message);
    }
}

const getMemberByTelepon = async (telepon) => {
    try {
      const query = 'SELECT * FROM members WHERE telepon = $1';
      const result = await pool.query(query, [telepon]);
      
      if (result.rows.length === 0) {
        throw new Error('Member not found');
      }
  
      return result.rows[0];
    } catch (error) {
      console.error('Error getting member by telepon:', err);
      throw err;
    }
  };
  

async function getAllMember() {
    try {
      const member = await Member.findAll({
        // order: [['createdAt', 'DESC']],
      });
      console.log(member);  
      return member; 
    } catch (error) {
      throw error;
    }
  }


// Mengambil laporan penjualan berdasarkan kasir
async function getTransactionReportByCashier(cashierName) {
    try {
        const transactions = await Transaksi.findAll({
            include: [{
                model: Member,
                attributes: ['nama'], // nama dari tabel members
                required: false // `false` untuk transaksi tanpa member (guest)
            }],
            where: {
                cashier: cashierName
            }
        });

        // Memeriksa apakah transaksi ditemukan
        if (transactions.length === 0) {
            return { message: 'No transactions found for this cashier' };
        }

        const transactionsData = transactions.map(transaction => ({
            transaction_code: transaction.transaction_code,
            member: transaction.Member ? transaction.Member.nama : 'Guest',
            cashier: transaction.cashier,
            transaction_date: transaction.transaction_date,
            total: transaction.total,
            payment: transaction.payment,
            change: transaction.change,
            items: transaction.items
        }));

        if (transactions.length === 0) {
            return { message: 'No transactions found for this cashier' };
        }

        return transactionsData;
    } catch (error) {
        throw new Error('Error retrieving sales report: ' + error.message);
    }
}




module.exports ={
    cashierLogin,
    getListProducts,
    getProductById,
    getListCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    createTransaction,
    getTransactionReportByCashier,
    getAllMember,
    getTransactionById,
    getMemberByTelepon,
};
