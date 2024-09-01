// const validator = require('validator');
// const readline = require("readline");
const fs = require('fs');
const bcrypt = require('bcrypt');
const pool = require('./connection');
const sequelize = require('./configdb');
const {Transaksi, Member} = require('./models/transaksi');



// Fungsi untuk login admin
async function adminLogin(username, password) {
    try {
      // Ambil data pengguna dari database
      const result = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
  
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
  
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        throw new Error('Invalid password');
      }
  
      // Periksa apakah pengguna adalah admin
      if (user.role !== 'admin') {
        throw new Error('Access denied. Only admins can log in.');
      }
  
      return { message: 'Login successful', user };
    } catch (error) {
      throw error;
    }
  }
  
  

// Fungsi untuk mendapatkan data stok produk
async function getListStockProducts() {
    
    try {
        // Query untuk mengambil semua data produk dari database
        const result = await pool.query('SELECT product_code, product_name, brand, type, stock FROM products  ORDER BY updated_at DESC');
        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}

// Fungsi untuk mendapatkan data produk berdasarkan kode produk pada from
async function getProductByCode(product_code) {
    try {
        const result = await pool.query('SELECT * FROM products WHERE product_code = $1', [product_code]);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
    }
}

async function addStockByCode(product_code, additionalStock) {
    try {
        // Dapatkan data produk berdasarkan kode produk
        const product = await getProductByCode(product_code);

        if (!product) {
            throw new Error('Product not found');
        }

        // Tambahkan stok baru ke stok saat ini
        const newStock = product.stock + additionalStock;

        // Perbarui stok di database
        const result = await pool.query(
            'UPDATE products SET stock = $1 WHERE product_code = $2 RETURNING *',
            [newStock, product_code]
        );

        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error('Error updating stock: ' + error.message);
    }
}


// Fungsi untuk menambahkan produk
async function addProduct({ product_code, product_name, brand, type, price, stock, image }) {
    try {
         // Cek apakah produk dengan product_code yang sama sudah ada
         const existingProduct = await pool.query(
            'SELECT * FROM products WHERE product_code = $1',
            [product_code]
        );

        if (existingProduct.rows.length > 0) {
            // Jika produk sudah ada, beri pesan
            return res.status(400).json({ message: 'Product with the same product code already exists' });
        }

        // Query untuk memasukkan data produk ke database
        const result = await pool.query(
            'INSERT INTO products (product_code, product_name, brand, type, price, stock, image) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [product_code, product_name, brand, type, price, stock, image]
        );        
        return result.rows[0];
    } catch (error) {
        throw new Error('Error adding product: ' + error.message);
    }
}


// Fungsi untuk mendapatkan semua produk
async function getListProducts() {
    try {
        // Query untuk mengambil semua data produk dari database
        const result = await pool.query('SELECT * FROM products ORDER BY updated_at DESC');
        
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

// Fungsi untuk memperbarui produk
async function updateProduct(id, { product_name, brand, type, price, stock, image }) {
    try {
        // Define the query and parameters based on whether the image is provided or not
        let query;
        let values;

        if (image === undefined || image === null) {
            query = `
                UPDATE products 
                SET product_name = $1, brand = $2, type = $3, price = $4, stock = $5
                WHERE id_product = $6
                RETURNING *;
            `;
            values = [product_name, brand, type, price, stock, id];
        } else {
            query = `
                UPDATE products 
                SET product_name = $1, brand = $2, type = $3, price = $4, stock = $5, image = $6
                WHERE id_product = $7
                RETURNING *;
            `;
            values = [product_name, brand, type, price, stock, image, id];
        }

        // Execute the query
        const result = await pool.query(query, values);

        // Check if the product was found and updated
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }

        return result.rows[0];
    } catch (error) {
        throw new Error('Error updating product: ' + error.message);
    }
}


// Fungsi untuk menghapus produk
async function deleteProduct(id) {
    try {
        const result = await pool.query('DELETE FROM products WHERE id_product = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }

        // Optionally delete the image file if it exists
        if (result.rows[0].image_url) {
            fs.unlink(result.rows[0].image_url, (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
        }
        console.log('Product successfully deleted:', result.rows[0]);

        return result.rows[0];
    } catch (error) {
        throw new Error('Error deleting product: ' + error.message);
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

async function getAllTransactions() {
    try {
        const transactions = await Transaksi.findAll({
            include: [{
                model: Member,
                attributes: ['nama'], // Ambil hanya nama dari tabel members
                required: false // `false` memungkinkan untuk transaksi tanpa member (guest)
            }]
        });

        const transactionsData = transactions.map(transaction => ({
            transaction_code: transaction.transaction_code,
            member: transaction.Member ? transaction.Member.nama : 'Guest',
            cashier: transaction.cashier,
            transaction_date: transaction.transaction_date,
            total: transaction.total,
            payment: transaction.payment,
            change: transaction.change,
            items: transaction.items // Items disimpan dalam format JSONB
        }));

        return transactionsData;
    } catch (error) {
        throw new Error('Error retrieving transactions: ' + error.message);
    }
}

async function getTransactionById(transactionId) {
    try {
        const transaction = await Transaksi.findOne({
            where: { id: transactionId },
            include: [{
                model: Member,
                attributes: ['nama'], // Mengambil hanya nama dari tabel member
                required: false // `false` memungkinkan untuk transaksi tanpa member (guest)
            }]
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const transactionData = {
            transaction_code: transaction.transaction_code,
            member: transaction.Member ? transaction.Member.nama : 'Guest',
            cashier: transaction.cashier,
            transaction_date: transaction.transaction_date,
            total: transaction.total,
            payment: transaction.payment,
            change: transaction.change,
            items: transaction.items // Items disimpan dalam format JSONB
        };

        return transactionData;
    } catch (error) {
        throw new Error('Error retrieving transaction: ' + error.message);
    }
}
  
module.exports ={
    // loginUser,
    adminLogin,
    getListStockProducts,
    getProductByCode,
    addStockByCode,
    getListProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getListCustomers,
    getAllTransactions,
    getTransactionById


};