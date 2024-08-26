const bcrypt = require('bcrypt');
const pool = require('./connection');

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
            'UPDATE members SET nama = $1, telepon = $2, alamat = $3 WHERE id = $4 RETURNING *',
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
        `DELETE FROM members WHERE id = $1 RETURNING *`,
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


let cart = [];
// Fungsi untuk menambahkan item ke keranjang
function addToCart(item) {
    // Cek apakah item sudah ada di keranjang
    const existingItemIndex = cart.findIndex(i => i.product_code === item.product_code);
    if (existingItemIndex !== -1) {
        // Update jumlah jika item sudah ada
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Tambah item baru ke keranjang
        cart.push(item);
    }
}

// Fungsi untuk menghapus item dari keranjang
function removeFromCart(product_code) {
    cart = cart.filter(item => item.product_code !== product_code);
}

// Fungsi untuk mengosongkan keranjang
function clearCart() {
    cart = [];
}

// Fungsi untuk mendapatkan item keranjang
function getCart() {
    return cart;
}


async function createTransaction(transactionData) {
    const { paymentAmount, changeAmount, customerId} = transactionData;

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Memulai transaksi

        // Ambil data dari keranjang
        const cartItems = getCart();

        // Hitung total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // Insert ke tabel transactions
        const result = await client.query(
            `INSERT INTO transactions (transaction_code, total, bayar, kembalian, customer_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [await generateTransactionCode(), totalAmount, paymentAmount, changeAmount, customerId]
        );
        const transactionId = result.rows[0].id;

        // Insert ke tabel transaction_items
        for (let item of cartItems) {
            await client.query(
                `INSERT INTO transaction_items (transaction_id, product_code, brand, type, harga,)
                 VALUES ($1, $2, $3, $4, $5)`,
                [transactionId, item.product_code, item.brand, item.type, item.price]
            );
        }

        await client.query('COMMIT');
        clearCart(); // Kosongkan keranjang

        return { message: 'Transaction created successfully', transactionCode: result.rows[0].transaction_code };
    } catch (error) {
        await client.query('ROLLBACK'); 
        throw new Error('Failed to create transaction');
    } finally {
        client.release(); // Kembalikan koneksi ke pool
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
    addToCart,
    removeFromCart,
    getCart,
    createTransaction,  
};
