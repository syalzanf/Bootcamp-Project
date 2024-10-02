const validator = require('validator');
// const readline = require("readline");
const fs = require('fs');
const bcrypt = require('bcrypt');
const pool = require('./connection');
const sequelize = require('./configdb');
const {Transaksi, Member} = require('./models/transaksi');
const Brand = require('./models/brand')
const Product = require('./models/product')
const { fn, col } = require('sequelize');
const { Op } = require('sequelize');

// Fungsi async untuk mendapatkan trafik penjualan
async function getSalesTraffic() {
    try {
        // Mendapatkan data penjualan per bulan
        const salesData = await Transaksi.findAll({
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('transaction_date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total_revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_sales']
            ],
            group: ['month'],
            order: [['month', 'ASC']]
        });


        const topSellingProducts = await Transaksi.sequelize.query(`
        SELECT 
            (item->>'product_code') AS product_code, 
            SUM(CAST(item->>'qty' AS INTEGER)) AS total_sold
        FROM 
            (SELECT jsonb_array_elements(items) AS item FROM transaksi) AS subquery
        GROUP BY 
            product_code
        ORDER BY 
            total_sold DESC
        LIMIT 5;
    `, {
        type: sequelize.QueryTypes.SELECT,
    });

        return {
            salesPerMonth: salesData,
            topSellingProducts: topSellingProducts,
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



// untuk memformat angka dalam bentuk rupiah
const formatNumber = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        // maximumFractionDigits: 0,
        // useGrouping: true
    }).format(number);
};


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
        // Query untuk mengambil semua data produk dari database beserta nama brand
        const result = await pool.query(`
        SELECT 
        p.product_code, 
        p.product_name, 
        b.brand_name,  -- Mengambil nama brand dari tabel brands
        p.type,
        p.color, 
        p.stock, 
        p.minimum_stock,
        p.price,
        CASE
            WHEN p.stock <= p.minimum_stock THEN true
            ELSE false
        END AS is_below_minimum_stock
        FROM 
            products p
        JOIN 
            brands b ON p.id_brand = b.id_brand  -- Menggabungkan tabel products dengan brands
        ORDER BY 
            p.updated_at DESC;
        
        `);

        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}


// async function getListStockProducts() {
//     try {
//         // Query untuk mengambil semua data produk dari database
//         const productsResult = await pool.query(
//             'SELECT product_code, product_name, brand, type, stock, price FROM products ORDER BY updated_at DESC'
//         );

//         // Query untuk mendapatkan total stok dan amount
//         const totalsResult = await pool.query(
//             'SELECT SUM(stock) AS total_stock, SUM(price) AS total_price FROM products'
//         );

//         // Menggabungkan hasil query produk dengan total stok dan amount
//         return {
//             products: productsResult.rows,
//             totals: totalsResult.rows[0]
//         };
//     } catch (error) {
//         throw new Error('Error fetching products and totals: ' + error.message);
//     }
// }


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

// Fungsi untuk memeriksa apakah produk sudah ada
async function checkProductExists(product_code, product_name) {
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE product_code = $1 OR product_name = $2',
            [product_code, product_name]
        );
        return result.rows.length > 0;
    } catch (error) {
        throw new Error('Error checking product existence: ' + error.message);
    }
}

// Fungsi untuk menambahkan produk
async function addProduct({ product_code, product_name, id_brand, type, color, price, stock, image }) {
    try {

        if (validator.isEmpty(product_name)) {
            return res.status(400).json({ message: 'Product name is required' });
        }
        if (!validator.isNumeric(price.toString()) || price <= 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }
        if (!validator.isInt(stock.toString(), { min: 0 })) {
            return res.status(400).json({ message: 'Invalid stock' });
        }

        // Cek apakah produk sudah ada
        const productExists = await checkProductExists(product_code, product_name);

        if (productExists) {
            return res.status(400).json({ message: 'Product already exists' });
        }

        // Query untuk memasukkan data produk ke database
        const result = await pool.query(
            'INSERT INTO products (product_code, product_name, id_brand, type, color, price, stock, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [product_code, product_name, id_brand, type, color, price, stock, image]
        );        
        return result.rows[0];
    } catch (error) {
        throw new Error('Error adding product: ' + error.message);
    }
}

async function getListBrand() {
    try {
        const result = await pool.query(
            'SELECT * FROM brands WHERE status = $1 ORDER BY updated_at DESC',
            ['active']
        );
        return result.rows;
    } catch (error) {
        console.error('Error fetching brand list:', error);
        throw new Error('Failed to fetch brand list');
    }
}

// Fungsi untuk memeriksa apakah brand sudah ada
async function checkBrandExists(brandName) {
    try {
        const result = await pool.query(
            'SELECT * FROM brands WHERE brand_name = $1',
            [brandName]
        );
        return result.rows.length > 0;
    } catch (error) {
        throw new Error('Error checking product existence: ' + error.message);
    }
}

async function addBrand(brandName) {
    try {
        const brandExists = await checkBrandExists(brandName);

        if (brandExists) {
            throw new Error('Brand already exists');
        }

        const result = await pool.query(
            'INSERT INTO brands (brand_name) VALUES ($1) RETURNING *',
            [brandName]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(error.message || 'Failed to add brand');
    }
}

  

// async function updateBrand(brandId, brand_name) {
//     try {
//         const result = await pool.query('UPDATE brands SET brand_name = $1 WHERE id_brand = $2 RETURNING *', [newBrandName, brandId]);
//         if (result.rowCount === 0) {
//             throw new Error('Brand not found');
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error editing brand:', error);
//         throw new Error('Failed to edit brand');
//     }
// }

async function updateBrand(id, brand_name) {
    const query = 'UPDATE brands SET brand_name = $1 WHERE id_brand = $2 RETURNING *';
    const values = [brand_name, id];
  
    try {
      const result = await pool.query(query, values);
      return result.rows[0]; 
    } catch (error) {
      throw new Error('Gagal mengupdate brand');
    }
  }
 

// async function deleteBrand(brandId) {
//     try {
//         const result = await pool.query('DELETE FROM brands WHERE id_brand = $1 RETURNING *', [brandId]);
//         if (result.rowCount === 0) {
//             throw new Error('Brand not found');
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error deleting brand:', error);
//         throw new Error('Failed to delete brand');
//     }
// }

async function deleteBrand(brandId) {
    try {
        const result = await pool.query(
            'UPDATE brands SET status = $1 WHERE id_brand = $2 RETURNING *',
            ['inactive', brandId]
        );
        if (result.rowCount === 0) {
            throw new Error('Brand not found');
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting brand:', error);
        throw new Error('Failed to delete brand');
    }
}


// Fungsi untuk mendapatkan semua produk
async function getListProducts() {
    try {
        // Query untuk mengambil semua data produk dari database
        const result = await pool.query(`
        SELECT 
            p.id_product, 
            p.product_code, 
            p.product_name, 
            p.price, 
            p.type,
            p.color,
            p.stock,
            p.image,
            p.minimum_stock,
            p.updated_at,
            p.id_brand, 
            b.brand_name  -- Mengambil nama brand dari tabel brands
        FROM 
            products p 
        JOIN 
            brands b ON p.id_brand = b.id_brand  -- Menggabungkan tabel products dengan brands
        ORDER BY 
            p.updated_at DESC
    `);

        // result.rows.forEach(product => {
        //     product.price = formatNumber(product.price); // Memanggil fungsi formatNumber untuk harga
        // });

        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}

// Fungsi untuk mendapatkan produk berdasarkan ID
async function getProductById(id) {
    try {
        const result = await pool.query('SELECT product_code, id_brand, type, color, price, stock, image FROM products WHERE id_products = $1', [id]);
        if (result.rows.length === 0) {
            throw new Error('Product not found');
        }
        return result.rows[0];
    } catch (error) {
        throw new Error('Error fetching product: ' + error.message);
    }
}

// Fungsi untuk memperbarui produk
async function updateProduct(id, { product_name, id_brand, type, color, price, image }) {
    try {
        // Validasi input
        if (!validator.isNumeric(price.toString()) || price <= 0) {
            return { status: 400, message: 'Invalid price' };
        }

        // Cek apakah ada produk dengan nama yang sama di database
        const queryCheck = `
            SELECT * FROM products 
            WHERE product_name = $1 AND id_product <> $2;
        `;
        const valuesCheck = [product_name, id ];
        const resultCheck = await pool.query(queryCheck, valuesCheck);

        if (resultCheck.rows.length > 0) {
            return { status: 400, message: 'Product name already exists' };
        }

        // Define the query and parameters based on whether the image is provided or not
        let query;
        let values;

        if (image === undefined || image === null) {
            query = `
                UPDATE products 
                SET product_name = $1, id_brand = $2, type = $3, price = $4, color = $5
                WHERE id_product = $6
                RETURNING *;
            `;
            values = [product_name, id_brand, type, price, color, id];
        } else {
            query = `
                UPDATE products 
                SET product_name = $1, id_brand = $2, type = $3, price = $4, color = $5, image = $6
                WHERE id_product = $7
                RETURNING *;
            `;
            values = [product_name, id_brand, type, price, color, image, id];
        }

        // Execute the query
        const result = await pool.query(query, values);

        // Check if the product was found and updated
        if (result.rows.length === 0) {
            return { status: 404, message: 'Product not found' };
        }

        return { status: 200, data: result.rows[0] };
    } catch (error) {
        return { status: 500, message: 'Error updating product: ' + error.message };
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
        const result = await pool.query('SELECT * FROM members ORDER BY updated_at DESC');
        return result.rows;
    } catch (error) {
        throw new Error('Error fetching products: ' + error.message);
    }
}

async function getAllTransactions(startDate, endDate) {
    try {

        const whereConditions = {
        };
        if (startDate && endDate) {
            whereConditions.transaction_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        const transactions = await Transaksi.findAll({
            include: [{
                model: Member,
                attributes: ['nama'], // Ambil hanya nama dari tabel members
                required: false // `false` memungkinkan transaksi tanpa member (guest)
            }],
            order: [['transaction_date', 'DESC']],
            where: whereConditions
        });

        // Hitung total penjualan
        const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);

        // Map data transaksi
        const transactionsData = transactions.map(transaction => ({
            transaction_code: transaction.transaction_code,
            member: transaction.Member ? transaction.Member.nama : 'Guest',
            cashier: transaction.cashier,
            transaction_date: transaction.transaction_date,
            total: formatNumber(transaction.total),
            payment_method: transaction.payment_method,
            payment: formatNumber(transaction.payment),
            debit: transaction.debit,
            change: formatNumber(transaction.change),
            items: transaction.items.map(item => ({
                ...item,
                price: formatNumber(item.price),
                totalItems: formatNumber(item.qty * item.price)
            }))
        }));

        return {
            transactions: transactionsData,
            totalSales: formatNumber(totalSales)
        };
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
                attributes: ['nama'], // mengambil hanya nama dari tabel member
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


async function getItemsCounter() {
    const query = 'SELECT COUNT(*) AS count FROM products';
    try {
      const result = await pool.query(query);
      return result.rows[0].count;
    } catch (error) {
      console.error('Error fetching items count:', error);
      throw error;
    }
  }

  async function getMinimumStock() {
    const query = `
      SELECT COUNT(*) AS product_count
      FROM products
      WHERE stock <= minimum_stock`;
    try {
      const result = await pool.query(query);
      return result.rows[0].product_count;
    } catch (error) {
      console.error('Error fetching minimum stock items:', error);
      throw error;
    }
  }

  // Fungsi untuk mendapatkan jumlah barang pada bulan terakhir
async function getLatestIncomingItems() {
    const query = `
      SELECT COUNT(*) AS item_count
      FROM products
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)`;
    try {
        const result = await pool.query(query);
        return result.rows[0].item_count;
    } catch (error) {
      console.error('Error fetching items count for latest month:', error);
      throw error;
    }
  }
  
  // Fungsi untuk mendapatkan jumlah transaksi pada bulan terakhir
async function getLatestSales() {
    const query = `
      SELECT COUNT(*) AS transaction_count
      FROM transaksi
      WHERE DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)`;
    try {
      const result = await pool.query(query);
      return result.rows[0].transaction_count;
    } catch (error) {
      console.error('Error fetching transaction count for latest month:', error);
      throw error;
    }
  }
  
  async function getAllTransactionsMonth() {
    try {
      // Menjalankan query untuk mengambil data transaksi
      const result = await pool.query(`
        SELECT
          TO_CHAR(transaction_date, 'YYYY-MM') AS month,
          COUNT(*) AS transaction_count,
          SUM(total_amount) AS total_nominal
        FROM transaksi
        GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
        ORDER BY month;
      `);
  
      // Mengembalikan hasil query sebagai array objek
      return result.rows;
    } catch (error) {
      // Menangani error jika ada
      throw new Error('Error fetching transactions: ' + error.message);
    }
  };

  async function getTotalStock() {
    const query = `
      SELECT SUM(stock) AS total_stock
      FROM products`;
    try {
      const result = await pool.query(query);
      return result.rows[0].total_stock;
    } catch (error) {
      console.error('Error fetching total stock:', error);
      throw error;
    }
  }

  async function getTotalStockValue() {
    const query = `
      SELECT SUM(stock * price) AS total_stock_value
      FROM products`;
    try {
      const result = await pool.query(query);
      const totalStockValue = result.rows[0].total_stock_value;
  
      return totalStockValue;
    } catch (error) {
      console.error('Error fetching total stock value:', error);
      throw error;
    }
  }



//   const getMonthlyTransactions = async () => {
//     const query = `
//       SELECT 
//         DATE_TRUNC('month', created_at) AS month,
//         SUM(total) AS total_transactions
//       FROM 
//         transaksi
//       GROUP BY 
//         month
//       ORDER BY 
//         month DESC;
//     `;
    
//     const result = await pool.query(query);
//     return result.rows;
//   };

// const getMonthlyTransactions = async () => {
//     const months = `
//         SELECT 
//             generate_series(1, 12) AS month
//     `;

//     const query = `
//         SELECT 
//             m.month,
//             COALESCE(COUNT(t.id), 0) AS total_transactions,
//             COALESCE(SUM((item->>'qty')::int), 0) AS total_products_sold
//         FROM 
//             (${months}) AS m
//         LEFT JOIN 
//             transaksi AS t 
//             ON EXTRACT(MONTH FROM t.created_at) = m.month
//         LEFT JOIN 
//             LATERAL jsonb_array_elements(t.items) AS item ON TRUE
//         GROUP BY 
//             m.month
//         ORDER BY 
//             m.month;    
//     `;
    
//     const result = await pool.query(query);
//     return result.rows;
// };

const getMonthlyTransactions = async (year) => {
    const months = `
      SELECT 
        generate_series(1, 12) AS month
    `;
  
    const query = `
      SELECT 
        m.month,
        COALESCE(COUNT(t.id), 0) AS total_transactions,
        COALESCE(SUM((item->>'qty')::int), 0) AS total_products_sold
      FROM 
        (${months}) AS m
      LEFT JOIN 
        transaksi AS t 
        ON EXTRACT(MONTH FROM t.created_at) = m.month
        AND EXTRACT(YEAR FROM t.created_at) = $1
      LEFT JOIN 
        LATERAL jsonb_array_elements(t.items) AS item ON TRUE
      GROUP BY 
        m.month
      ORDER BY 
        m.month;
    `;
  
    try {
      const result = await pool.query(query, [year]);  // Query dengan parameter tahun
      return result.rows;  // Kembalikan data hasil query
    } catch (err) {
      console.error('Error fetching monthly transactions:', err);
      throw err;
    }
  };
  
// Fungsi untuk mendapatkan total pendapatan per bulan
async function getTotalIncomePerMonth() {
    const query = `
      SELECT SUM(total) AS total_perbulan
      FROM public.transaksi
      WHERE EXTRACT(MONTH FROM transaction_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE);`;
    try {
        const result = await pool.query(query);
        const totalPerBulan = result.rows[0].total_perbulan || 0; // ambil total pendapatan per bulan
        return formatNumber(totalPerBulan); // kembalikan total pendapatan yang telah diformat
    } catch (error) {
        console.error('Error fetching total income for current month:', error);
        throw error;
    }
}


// Fungsi untuk mendapatkan tahun terbaru dari transaksi
async function getLatestTransactionYear() {
    const query = `
      SELECT EXTRACT(YEAR FROM MAX(transaction_date)) AS latest_year
      FROM public.transaksi;`;
    try {
        const result = await pool.query(query);
        return result.rows[0].latest_year || null; // Mengembalikan null jika tidak ada tahun
    } catch (error) {
        console.error('Error fetching latest transaction year:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan total pendapatan per tahun
async function getTotalIncomePerYear(year) {
    const query = `
      SELECT SUM(total) AS total_pertahun
      FROM public.transaksi
      WHERE EXTRACT(YEAR FROM transaction_date) = $1;`;
    try {
        const result = await pool.query(query, [year]);
        return result.rows[0].total_pertahun || 0;
    } catch (error) {
        console.error('Error fetching total income for year:', error);
        throw error;
    }
}

// Fungsi untuk mendapatkan total pendapatan untuk tahun terbaru
async function getTotalIncomeForLatestYear() {
    try {
        const latestYear = await getLatestTransactionYear();
        if (latestYear) {
            const totalIncome = await getTotalIncomePerYear(latestYear);
            const formattedIncome = formatNumber(totalIncome); // Memformat total pendapatan
            console.log(`Total income for ${latestYear}:`, formattedIncome);
            return formattedIncome; // Mengembalikan pendapatan yang telah diformat
        } else {
            console.log('No transactions found.');
            return formatNumber(0); // Mengembalikan 0 dalam format rupiah
        }
    } catch (error) {
        console.error('Error fetching total income for latest year:', error);
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
    checkProductExists,
    addProduct,
    updateProduct,
    deleteProduct,
    getListCustomers,
    getAllTransactions,
    getTransactionById,
    getItemsCounter,
    getMinimumStock,
    getLatestSales,
    getLatestIncomingItems,
    getAllTransactionsMonth,
    getTotalStock,
    getTotalStockValue,
    getListBrand,
    checkBrandExists,
    addBrand,
    updateBrand,
    deleteBrand,
    getSalesTraffic,
    getMonthlyTransactions,
    getTotalIncomePerMonth,
    getTotalIncomeForLatestYear,


};