  const express = require('express');
  const validator = require('validator');
  const superadmin = require('./superadmin');
  const admin = require('./admin');
  const cashier = require('./cashier');
  const { createTransaction, getTransactionReportByCashier, getMemberByTelepon } = require('./cashier');
  const { getAllTransactions, getTransactionById } = require('./admin');
  // const AppLog = require('./models/appLog');
  // const loggerMiddleware = require('./middleware/logger');
  const app = express();
  const port = 3000;
  const fs = require('fs');
  const multer = require('multer');
  const path = require('path');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const session = require('express-session'); 
  
  const PDFDocument = require('pdfkit');
  const blobStream = require('blob-stream');

  
  const sequelize = require('./configdb');
  require('dotenv').config(); 
  const jwt = require('jsonwebtoken');
  const User = require('./models/user');
  const Transaksi = require('./models/transaksi');
  const jwtSecret = process.env.ACCESS_TOKEN_SECRET;



  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    console.log('Token received:', token); 

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {

        console.error('Token verification error:', err);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  };
    
  // Sinkronisasi model dengan database
  sequelize.sync()
      .then(() => console.log('Database & tables created!'))
      .catch(err => console.error('Unable to sync database:', err));


  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public/uploads')); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 }, //batas file 1MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/; 
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .jpeg, .jpg and .png files are allowed!'));
        }
    }
});


  app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true, 
    allowedHeaders: ['Authorization', 'Content-Type'],
  }));
  
  
  app.use(express.json());
  app.use(cookieParser());

  app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));


  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));


  //Rute Admin
  // Rute untuk login admin
  // app.post('/api/admin/login', async (req, res) => {
  //   console.log("Login route hit");

  //   const { username, password } = req.body;

  //   try {
  //       const result = await admin.adminLogin(username, password);
  //       res.status(200).json(result);
  //   } catch (error) {
  //       console.error(error);
  //       res.status(401).json({ message: error.message });
  //   }
  // });


  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
    }
  })


  // Endpoint untuk verifikasi token
  app.post('/api/verify-token', async (req, res) => {
    try {
      const { token } = req.body;
  
      if (!token) {
        return res.status(400).json({ message: 'Token is required' });
      }
  
      const result = await superadmin.verifyToken(token);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post('/api/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
  
    try {
      // Verifikasi refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret);
      console.log(decoded);
      const user = await User.findOne({ where: { username: decoded.username } });
  
      if (!user) {
        return res.status(403).json({ message: "invalid token" });
      }
  
      const newToken = jwt.sign(
        { username: user.username, role: user.role },
        jwtSecret,
        { expiresIn: '1h' }
      );
  
      res.json({
        token: newToken,
      });
    } catch (error) {
      console.error('Error refreshing token:', error.message);
      res.status(403).json({ message: 'Invalid refresh token' });
    }
  });  

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Autentikasi pengguna dan hasilkan token di dalam loginUser
      const { user, token, refreshToken } = await superadmin.loginUser(username, password);
  
      if (user && token) {
        // Setel token sebagai cookie
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });


        res.json({
          message: 'Login berhasil',
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            telepon: user.telepon,
            photo:user.photo,
            email:user.email,
            token: token,
            refreshToken: refreshToken
          },
        });
      } else {
        return res.status(401).json({ message: 'login gagal' });
      }
    } catch (error) {
      console.error('Kesalahan login:', error.message);
      return res.status(400).json({ message: error.message });
    }
  });

  // app.post('/api/login', async (req, res) => {
  //   const { username, password } = req.body;
  
  //   try {
  //     // Autentikasi pengguna dan hasilkan token di dalam loginUser
  //     const { user, token } = await superadmin.loginUser(username, password);
  
  //     // if (user && token) {
  //       // Setel token sebagai cookie
  //       res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        
  //       // res.json({
  //       return res.json({
  //         message: 'Login berhasil',
  //         user: {
  //           id: user.id,
  //           username: user.username,
  //           role: user.role,
  //           name: user.name,
  //           telepon: user.telepon,
  //           photo:user.photo,
  //           token: token
  //         },
  //       });
  //     // } else {
  //     //   return res.status(401).json({ message: 'Username atau password salah' });
  //     // }
  //   } catch (error) {
  //     console.error('Kesalahan login:', error);
  //     res.status(401).json({ message: error.message });
  //     // return res.status(500).json({ message: 'Kesalahan server internal' });
  //   }
  // });

  // app.post('/api/token/refresh', async (req, res) => {
  //   const { refreshToken } = req.body;
    
  //   if (!refreshToken) {
  //     return res.status(401).json({ message: 'Refresh token is required' });
  //   }
  
  //   try {
  //     // Verifikasi refresh token
  //     const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
      
  //     // Buat token akses baru
  //     const newAccessToken = jwt.sign(
  //       { username: decoded.username, role: decoded.role },
  //       jwtSecret,
  //       { expiresIn: '1h' } // Access token baru berlaku 1 jam
  //     );
  
  //     return res.json({
  //       message: 'Token refreshed successfully',
  //       accessToken: newAccessToken,
  //     });
  //   } catch (error) {
  //     return res.status(403).json({ message: 'Invalid or expired refresh token' });
  //   }
  // });
  
  
  
  app.get('/api/profile',  authenticateToken, async (req, res) => {
  console.log('Token received:', req.cookies.token); // cek token  

   try {
    const userProfile = await superadmin.verifyToken(req.cookies.token);
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(403).json({ message: 'Failed to authenticate token' });
  }
});

// Rute update profile user
app.put('/api/profile/:id', authenticateToken, upload.single('photo'), async (req, res) => {

  const { username, name, telepon, email, password, role } = req.body;
  const userId = req.params.id; 
  const photo = req.file ? `/uploads/${req.file.filename}` : null;
console.log("userId")
  try {
    const updatedUser = await superadmin.updateUser(userId, { username, name, telepon, email, password, role, photo });
    console.log("Updated User Data:", updatedUser.user);
    
    res.status(200).json({
      message: updatedUser.message,
      user: updatedUser.user,
      photo: photo ? `http://localhost:3000${updatedUser.user.photo}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  // Rute yang memerlukan autentikasi
  app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('This is a protected route');
  });

  // Rute yang tidak memerlukan autentikasi
  app.get('/public-route', (req, res) => {
    res.send('This is a public route');
  });


// content dashboad admin
app.get('/api/dashboard-admin', async (req, res) => {
  try {
    const itemsCounter = await admin.getItemsCounter(); // Fungsi untuk mendapatkan jumlah barang
    const minimumStock = await admin.getMinimumStock(); // Fungsi untuk mendapatkan stok minimum
    const latestIncomingItems = await admin.getLatestIncomingItems(); // Fungsi untuk mendapatkan barang masuk terbaru
    const latestSales = await admin.getLatestSales(); // Fungsi untuk mendapatkan penjualan terbaru
    const salesTraffic = await admin.getSalesTraffic();
    //const getMonthlyTransactions = await admin.getMonthlyTransactions(year);// fungsi untuk mendapatkan total transaksi 
    const getTotalUsers = await superadmin.getTotalUsers();// fungsi untuk mendapatkan total user
    const totalIncomePerMonth = await admin.getTotalIncomePerMonth();
    const totalIncomePerYear = await admin. getTotalIncomeForLatestYear();



    res.json({
      itemsCounter,
      minimumStock,
      latestIncomingItems,
      latestSales,
      salesTraffic,
      //getMonthlyTransactions,
      getTotalUsers,
      totalIncomePerMonth,
      totalIncomePerYear,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

app.get('/api/dashboard-admin/transactions/:year', async (req, res) => {
  const year = req.params.year; // Ambil tahun dari URL
  try {
    const transactions = await admin.getMonthlyTransactions(year); // Panggil fungsi dengan parameter tahun
    res.json({transactions}); // Kembalikan hasil sebagai JSON
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions data' });
  }
});

app.get('/api/stock/total',authenticateToken, async (req, res) => {
  try {
    const totalStock  = await admin.getTotalStock();
    const amount  = await admin.getTotalStockValue();

    res.json({
    totalStock,
    amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
});

  // Rute untuk membaca list stok produk
  app.get('/api/admin/products/stock', authenticateToken, async (req, res) => {
    try {
        const stockProducts = await admin.getListStockProducts();
        res.status(200).json(
          stockProducts,
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk mendapatkan data produk berdasarkan kode produk
  app.get('/api/admin/products/:product_code', authenticateToken, async (req, res) => {
    const { product_code } = req.params;

    try {
        if (!product_code) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        const product = await admin.getProductByCode(product_code);
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk menambah stok produk berdasarkan kode produk
  app.post('/api/admin/products/stock/:product_code', authenticateToken, async (req, res) => {
    const { product_code } = req.params;
    const { stock } = req.body;

    try {
        // Validasi bahwa product_code diberikan dan additionalStock adalah tipe number
        // if (!product_code || typeof stock !== 'number') {
            // return res.status(400).json({ message: 'Kode produk dan stok tambahan yang valid diperlukan' });
        // }

        // Menambahkan stok menggunakan kode produk
        const updatedProduct = await admin.addStockByCode(product_code, stock);

        // Mengembalikan informasi produk yang telah diperbarui
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk membaca semua brand
  app.get('/api/admin/brands', authenticateToken, async (req, res) => {
    try {
        const products = await admin.getListBrand();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk membaca semua produk
  app.get('/api/admin/products', authenticateToken, async (req, res) => {
    try {
        const products = await admin.getListProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk menambahkan produk baru
  app.post('/api/admin/products/add', upload.single('image'), authenticateToken, async (req, res) => {
    console.log(req.file); 
    const { product_code, product_name, id_brand, type, color, price, stock } = req.body;
    const image = req.file ? `uploads/${req.file.filename}`: null;

     // Validasi input
      if (validator.isEmpty(product_name)) {
          return res.status(400).json({ message: 'Product name is required' });
      }
      if (!validator.isNumeric(price.toString()) || price <= 0) {
          return res.status(400).json({ message: 'Invalid price' });
      }
      if (!validator.isInt(stock.toString(), { min: 0 })) {
          return res.status(400).json({ message: 'Invalid stock' });
      }

    try {

       // Cek apakah produk sudah ada
       const productExists = await admin.checkProductExists(product_code, product_name);
        
       if (productExists) {
           return res.status(400).json({ message: 'Product already exists' });
       }

        // Tambah produk ke database
        const product = await admin.addProduct({ product_code, product_name, id_brand, type, price, stock, color, image});
        res.status(201).json({ 
          message: 'Product added successfully',
          product,
          image_url: `http://localhost:3000/${image}` 
        });
    } catch (error) {
          if (error instanceof multer.MulterError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Error adding product: ' + error.message });
    }
  });

  // Rute untuk membaca produk berdasarkan id
  app.get('/api/admin/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await admin.getProductById(id);
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
  });

  // Rute untuk mengupdate produk berdasarkan id
  app.put('/api/admin/products/:id', upload.single('image'), authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { product_name, id_brand, type, color, price } = req.body;
    
    const image = req.file ? `uploads/${req.file.filename}` : null;
    console.log('Image:', image); // Cek apakah image tidak null
    
    try {
        const updatedProduct = await admin.updateProduct(id, {
          product_name,
          id_brand,
          type,
          color,
          price,
          image
        });

        res.status(200).json({
          message: 'Product updated successfully',
          product: updatedProduct,
          image_url: image ? `http://localhost:3000/${updatedProduct.image}` : null
        });
    } catch (error) { 
        console.log('Error updating product:', error);
        res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk menghapus produk berdasarkan id
  app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await admin.deleteProduct(id);
        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk membaca semua customer
  app.get('/api/admin/customers', authenticateToken, async (req, res) => {
    try {
        const customers = await admin.getListCustomers();
        res.status(200).json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk menampilkan detail transaksi berdasarkan id
  app.get('/api/detailTransaction/:id', async (req, res) => {
      const {id} = req.params;
  
      try {
          const transactionData = await cashier.getTransactionById(id);
          res.status(200).json(transactionData);
        } catch (error) {
            console.error(error);
            res.status(404).json({ message: error.message });
        }
      });

  app.get('/api/admin/reportTransactions', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query; 

        const transactions = await getAllTransactions(startDate, endDate);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/transactions-month', authenticateToken, async (req, res) => {
    try {
        const transactions = await admin.getAllTransactionsMonth();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });



  //Rute Cashier
  // Rute untuk login kasir
  app.post('/api/cashier/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await cashier.cashierLogin(username, password);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: error.message });
    }
  });

  // Rute untuk membaca semua brand
  app.get('/api/cashier/brands', authenticateToken, async (req, res) => {
    try {
        const products = await cashier.getListBrand();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

    // Rute untuk membaca semua brand
    app.get('/api/brands', authenticateToken, async (req, res) => {
      try {
          const products = await admin.getListBrand();
          res.status(200).json(products);
      } catch (error) {
          console.error(error);
          res.status(500).json({ message: error.message });
      }
    });

    // Rute untuk menambah brand
    app.post('/api/brands/add', authenticateToken, async (req, res) => {
      const { brand_name } = req.body;
  
      try {
          const newBrand = await admin.addBrand(brand_name);
          res.status(201).json(newBrand);
      } catch (error) {
          res.status(400).json({ error: error.message });
      }
  });
  

  // Rute untuk mengupdate brand
  app.put('/api/brands/edit/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { brand_name } = req.body;

    if (!brand_name) {
      return res.status(400).json({ error: 'Nama brand diperlukan' });
    }

    try {
        const updatedBrand = await admin.updateBrand(id, brand_name);
        res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/brands/delete/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBrand = await admin.deleteBrand(id);
        res.status(200).json({ message: 'Brand deleted successfully (soft delete)', deletedBrand });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  // Rute untuk membaca semua produk
  app.get('/api/cashier/products', authenticateToken, async (req, res) => {
    try {
        const products = await cashier.getListProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk membaca produk berdasarkan id
  app.get('/api/cashier/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const product = await cashier.getProductById(id);
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
  });

  // Rute untuk membaca semua customer
  app.get('/api/cashier/customers', authenticateToken, async (req, res) => {
    try {
        const customers = await cashier.getListCustomers();
        res.status(200).json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  //Rute untuk menambah customer
  app.post('/api/cashier/customers/add', authenticateToken, async (req, res) => {
    const { nama, telepon, alamat } = req.body;

    try {
        const newCustomer = await cashier.addCustomer({ nama, telepon, alamat });
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk mengupdate customer berdasarkan id
  app.put('/api/cashier/customers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { nama, telepon, alamat } = req.body;

    try {
      const result = await cashier.updateCustomer(id, { nama, telepon, alamat });
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk menghapus customer berdasarkan id
  app.delete('/api/cashier/customers/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
      const result = await cashier.deleteCustomer(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/cashier/next-transaction-code', async (req, res) => {
      try {
          const lastTransaction = await Transaksi.findOne({
              order: [['id', 'DESC']],
              attributes: ['transaction_code']

          });

          let nextTransactionCode = 'TRX10001';

          if (lastTransaction) {
            const lastTransactionCode = lastTransaction.transaction_code;
            const lastNumber = parseInt(lastTransactionCode.replace('TRX', ''), 10);
            nextTransactionCode = 'TRX' + (lastNumber + 1).toString().padStart(5, '0');
        }
        
        res.json({ nextCode: nextTransactionCode });
      } catch (error) {
        console.error('Error fetching next transaction code:', error);
        res.status(500).json({ error: 'Internal server error' });;
      }
  });

  app.get('/api/cashier/member/:telepon', authenticateToken, async (req, res) => {
    const telepon = req.params.telepon;

    try {
        const member = await getMemberByTelepon(telepon);
        res.json(member);
    } catch (error) {
        if (error.message === 'Member not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

  app.post('/api/cashier/transaksi', authenticateToken, async (req, res) => {
    try {
      const { 
        id,
        transaction_code,
        member_id, 
        id_cashier, 
        cashier, 
        total, 
        payment_method, 
        debit_card_code, 
        payment, 
        change, 
        items 
      } = req.body;
  
      const newTransaction = await createTransaction({
        id,
        transaction_code,
        member_id,
        id_cashier,
        cashier,
        total,
        payment_method,
        debit: payment_method === 'debit' && debit_card_code ? debit_card_code : null,
        payment,
        change,
        items
      });
  
      res.status(201).json({
        message: 'Transaksi berhasil dibuat',
        id: newTransaction.id, 
        data: newTransaction,
        transaction_code: newTransaction.transaction_code,
         
      });
    } catch (error) {
      res.status(500).json({
         message: error.message
      });
    }
  });


  // app.post('/api/cashier/transaksi', async (req, res) => {
  //   try {
  //     const { 
  //       id,
  //       transaction_code, 
  //       member_id, 
  //       id_cashier, 
  //       cashier, 
  //       total, 
  //       payment_method, 
  //       debit_card_code, 
  //       payment, 
  //       change, 
  //       items 
  //     } = req.body;
  
  //     // const member = await getMemberByTelepon(telepon);
      
  //     // const member_id = member.member_id;
      
  //     const newTransaction = await createTransaction({
  //         id,
  //         transaction_code,
  //         member_id,
  //         id_cashier,
  //         cashier,
  //         total,
  //         payment_method,
  //         debit: payment_method === 'debit' && debit_card_code ? debit_card_code : null,
  //         payment,
  //         change,
  //         items
  //     });

  //     const receipt = {
  //       id: newTransaction.id,
  //       transaction_code: newTransaction.transaction_code,
  //       member_id: newTransaction.member_id,
  //       cashier: newTransaction.cashier,
  //       total: newTransaction.total,
  //       payment_method: newTransaction.payment_method,
  //       debit_card_code: newTransaction.debit_card_code,
  //       payment: newTransaction.payment,
  //       change: newTransaction.change,
  //       items: newTransaction.items
  //     };

  //     res.status(201).json({
  //         message: 'Transaksi berhasil dibuat',
  //         id: newTransaction.id, 
  //         data: newTransaction,
  //         transaction_code: newTransaction.transaction_code,
  //         receipt 
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  //   }
  // });

  




  // Rute untuk menghasilkan PDF receipt berdasarkan id transaksi
  app.get('/api/generate-receipt/:id', authenticateToken, async (req, res) => {
    try {
      const transactionId = req.params.id;
      const transaction = await cashier.getTransactionById(transactionId);
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      const doc = new PDFDocument({ margin: 30, size: [300, 500] });
  
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64PDF = pdfBuffer.toString('base64');
        res.json({ base64: base64PDF });
      });
  
      // Header - Store Name and Address
      doc.fontSize(12).font('Helvetica-Bold').text('LuxTime', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Jl.Raya Banjaran No.2, Bandung', { align: 'center' });
      doc.moveDown();
  
      // Divider Line
      doc.moveTo(10, doc.y).lineTo(290, doc.y).stroke();
      doc.moveDown(0.5);
  
      // Transaction Details
      const formattedDate = new Date(transaction.transaction_date).toLocaleDateString();
      doc.fontSize(10).font('Helvetica')
        .text(`Date: ${formattedDate}`, { align: 'left' })
        .text(`Transaction Code: ${transaction.transaction_code}`, { align: 'left' })
        .text(`Cashier: ${transaction.cashier}`, { align: 'left' });
  
      // Divider Line
      doc.moveDown(0.5);
      doc.moveTo(10, doc.y).lineTo(290, doc.y).stroke();
      doc.moveDown(0.5);
  
      // Item Table Header
      doc.fontSize(10).font('Helvetica-Bold')
        .text('Item', 10, doc.y, { continued: true })
        .text('Qty', 150, doc.y, { continued: true })
        .text('Price', 200, doc.y);
      doc.moveDown(0.5);
  
      // Item Table Divider Line
      doc.moveTo(10, doc.y).lineTo(290, doc.y).stroke();
      doc.moveDown(0.5);
  
      // Items List
      transaction.items.forEach(item => {
        doc.font('Helvetica').fontSize(9)
          .text(`${item.product_name}`, 10, doc.y, { continued: true })
          .text(`${item.qty}`, 150, doc.y, { continued: true })
          .text(`Rp.${item.price}`, 200, doc.y);
        doc.moveDown(0.5);
      });
  
      // Divider Line
      doc.moveTo(10, doc.y).lineTo(290, doc.y).stroke();
      doc.moveDown(0.5);
  
      // Payment Total
      doc.font('Helvetica-Bold').fontSize(10).text('Total', 10, doc.y, { continued: true });
      doc.text(`Rp.${transaction.total}`, 200, doc.y, { align: 'right' });
  
      // Payment Method
      doc.font('Helvetica').fontSize(10)
        .text('Payment Method:', 10, doc.y, { align: 'left' })
        .text(`${transaction.payment_method}`, 150, doc.y, { align: 'right' });
  
      // Debit Card Code (if present)
      if (transaction.debit_card_code) {
        doc.text(`Debit Card Code: ${transaction.debit_card_code}`, 10, doc.y, { align: 'left' });
      }
  
      // Payment and Change
      doc.text(`Paid: Rp.${transaction.payment}`, 10, doc.y, { align: 'left' });
      doc.text(`Change: Rp.${transaction.change}`, 10, doc.y, { align: 'left' });
  
      // Divider Line before footer
      doc.moveDown(0.5);
      doc.moveTo(10, doc.y).lineTo(290, doc.y).stroke();
      doc.moveDown(0.5);
  
      // Footer
      doc.font('Helvetica').fontSize(10).text('Thank You!', { align: 'center' });
      doc.text('Items purchased cannot be returned.', { align: 'center' });
  
      doc.end();
    } catch (error) {
      console.error('Error generating receipt:', error);
      res.status(500).json({ message: 'An error occurred while generating the receipt.' });
    }
  });
//   app.get('/api/generate-receipt/:id', authenticateToken, async (req, res) => {
//   try {
//     const transactionId = req.params.id;
//     const transaction = await cashier.getTransactionById(transactionId);

//     if (!transaction) {
//       return res.status(404).json({ message: 'Transaction not found' });
//     }

//     const doc = new PDFDocument();
//       // const stream = doc.pipe(blobStream());


//     // res.setHeader('Content-Type', 'application/pdf');
//     // res.setHeader('Content-Disposition', `attachment; filename=receipt-${transaction.transaction_code}.pdf`);

//     // Output PDF langsung ke response
//     const chunks = [];
//     doc.on('data', chunk => chunks.push(chunk));
//     doc.on('end', () => {
//         // Combine all chunks into a single buffer
//         const pdfBuffer = Buffer.concat(chunks);
        
//         // Convert buffer to Base64
//         const base64PDF = pdfBuffer.toString('base64');
        
//         // Output the Base64 string
//         console.log(base64PDF);
        
//         res.json({ base64: base64PDF });

//       });
    
//     // doc.pipe(res);

//     // Konten PDF
//     doc.fontSize(20).text('Receipt', { align: 'center' });
//     doc.moveDown();
//     const formattedDate = new Date(transaction.transaction_date).toDateString();
//     doc.fontSize(14).text(`Transaction Date: ${formattedDate}`);
//     doc.fontSize(14).text(`Transaction Code: ${transaction.transaction_code}`);
//     // doc.text(`Member ID: ${transaction.member_id}`);
//     doc.text(`Cashier: ${transaction.cashier}`);
//     doc.text(`Total: Rp.${transaction.total}`);
//     doc.text(`Payment Method: ${transaction.payment_method}`);
//     if (transaction.debit_card_code) {
//       doc.text(`Debit Card Code: ${transaction.debit_card_code}`);
//     }
//     doc.text(`Payment: Rp.${transaction.payment}`); 
//     doc.text(`Change: Rp.${transaction.change}`);
//     doc.moveDown();

//     // Items ke PDF
//     doc.fontSize(12).text('Items:');
//     transaction.items.forEach(item => {
//       doc.text(`${item.product_name} - ${item.brand_name} - ${item.type} - ${item.price} - ${item.qty}`);
//     });

//     doc.end();

//     // stream.on('finish', function () {
//     //   const blob = stream.toBlob('application/pdf');
//     //   const url = stream.toBlobURL('application/pdf');
//     //   res.status(200).send(url);
//     // });

//   } catch (error) {
//     console.error('Error generating receipt:', error);
//     res.status(500).json({ message: 'An error occurred while generating the receipt.' });
//   }
// });

  
  
  // Rute untuk membaca semua member
  
  
  app.get('/api/cashier/members', authenticateToken, async (req, res) => {
    try {
        const users = await cashier.getAllMember();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });


  // Mendapatkan laporan penjualan berdasarkan cashier
  app.get('/api/cashier/laporanTransaksi/:cashierName',authenticateToken, async (req, res) => {
    try {
        const { cashierName } = req.params;
        const { startDate, endDate } = req.query; // Ambil tanggal dari parameter query

        const report = await getTransactionReportByCashier(cashierName, startDate, endDate);
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

  //Rute Superadmin
  // Rute untuk login superadmin
  app.post('/api/superadmin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await superadmin.superadminLogin(username, password);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: error.message });
    }
  });

  // Rute untuk membaca semua users
  app.get('/api/superadmin/users', authenticateToken, async (req, res) => {
    try {
        const users = await superadmin.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk mendapatkan user berdasarkan ID
  app.get('/api/superadmin/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
      const user = await superadmin.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk menambahkan user baru
  app.post('/api/superadmin/users/add', authenticateToken, upload.single('photo'), async (req, res) => { 
    const { username, name, telepon, email, role} = req.body;

    const photo = req.file ?  `/uploads/${req.file.filename}` : null;

    try {
      const result = await superadmin.addUser(username,name, telepon, email, role, photo);
      res.status(201).json({
        message: result.message,
        user: result.user
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  });

  // Rute untuk mengupdate user
  app.put('/api/superadmin/users/:id', authenticateToken, upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const { username, name, telepon, email, password, role } = req.body;

    try {

      const user = await superadmin.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let photo = user.photo;
    if (req.file) {
      // Path baru untuk foto yang diunggah
      photo = `/uploads/${req.file.filename}`;

      if (user.photo) {
        const oldPhotoPath = path.join(__dirname, 'public', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    // Update data user dengan data yang baru
    const updatedUser = await superadmin.updateUser(id, {
      username,
      name,
      telepon,
      email,
      password, 
      role,
      photo
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk mengupdate user role
  app.put('/api/superadmin/users/:id/role', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try { 
      if (!role) {
        return res.status(400).json({ message: 'Role is required' });
      }
  
      const result = await superadmin.updateUserRole(id, role);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk menghapus user
  app.delete('/api/superadmin/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
      const result = await superadmin.deleteUser(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

    // // Rute untuk menghapus user
    // app.put('/api/superadmin/users/:id', authenticateToken, async (req, res) => {
    //   const { id } = req.params;
  
    //   console.log("Received ID:", id); 
    //   try {
    //     const result = await superadmin.deleteUser(id);
    //     res.status(200).json(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: error.message });
    //   }
    // });

app.put('/api/user/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' atau 'inactive'

  console.log('Request received: ', { id, status });
  try {
    const updatedUser = await superadmin.updateUserStatus(id, status);
    console.log('User updated: ', updatedUser);

    res.json({ message: 'Status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
