const bcrypt = require('bcrypt');
const pool = require('./connection');
const {Transaksi, Member} = require('./models/transaksi');
const sequelize = require('./configdb');


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
        const result = await pool.query('SELECT product_code, brand, type, price FROM products');
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

async function createTransaction({ transaction_code, member_id, cashier, total, payment, change, items }) {
    try {
        const newTransaction = await Transaksi.create({
            transaction_code,
            member_id: member_id !== null ? member_id : 0, // Simpan member_id jika ada, jika tidak null
            cashier,
            transaction_date: new Date(),
            total,
            payment,
            change,
            items,  // Items akan disimpan sebagai JSONB
        });

        return newTransaction;
    } catch (error) {
        throw new Error('Error creating transaction: ' + error.message);
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
    getTransactionReportByCashier
};
