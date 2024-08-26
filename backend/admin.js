// const validator = require('validator');
// const readline = require("readline");
const fs = require('fs');
const bcrypt = require('bcrypt');
const pool = require('./connection');


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
        const result = await pool.query(
            'UPDATE products SET product_name = $1, brand = $2, type = $3, price = $4, stock = $5, image = $6 WHERE id_product = $7 RETURNING *',
            [product_name, brand, type, price, stock, image, id]
        );
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


  
module.exports ={
    adminLogin,
    getListStockProducts,
    getProductByCode,
    addStockByCode,
    getListProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getListCustomers

};