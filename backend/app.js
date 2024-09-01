  const express = require('express');
  const superadmin = require('./superadmin');
  const admin = require('./admin');
  const cashier = require('./cashier');
  const { createTransaction, getTransactionReportByCashier } = require('./cashier');
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
   
  const sequelize = require('./configdb');
  require('dotenv').config(); 
  const jwt = require('jsonwebtoken');
  const User = require('./models/user');
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


  // Membuat path absolut ke folder 'uploads'
  const uploadDir = path.join(__dirname, 'uploads');

  // Membuat folder 'uploads' jika belum ada
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Setup Multer for file handling
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Upload folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // File name 
    }
  });


  // File filter untuk memastikan hanya gambar yang bisa diunggah
  const fileFilter = (req, file, cb) => {
    // Mencari ekstensi file yang diperbolehkan
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {  
      cb(new Error('Only images are allowed'), false);
    }
  };

  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
  });


  // app.use(cors({
  //   origin: function (origin, callback) {
  //     if (!origin) return callback(null, true);
  //     if (allowedOrigins.indexOf(origin) !== -1) {
  //       callback(null, true);
  //     } else {
  //       callback(new Error('Not allowed by CORS'));
  //     }
  //   }
  // }));

  app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
  }));
  


  app.use('/uploads', express.static(uploadDir));
    
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


  //Rute Admin
  // Rute untuk login admin
  app.post('/api/admin/login', async (req, res) => {
    console.log("Login route hit");

    const { username, password } = req.body;

    try {
        const result = await admin.adminLogin(username, password);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: error.message });
    }
  });


  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
    }
  })

  // app.post('/api/login', async (req, res) => {
  //   const { username, password } = req.body;

  //   try {
  
  //     if (!username || !password) {
  //       return res.status(400).json({ message: 'Username and password are required' });
  //     }
  
  //     const result = await superadmin.loginUser(username, password);  

  //     // Simpan token ke cookies
  //     res.cookie('token', result.token, {
  //        httpOnly: true,
  //        secure: process.env.NODE_ENV === 'production', 
  //       maxAge: 3600000 // Cookie valid selama 1 jam
  //      });

  //      res.json({
  //       message: result.message,
  //       user: result.user,
  //     });
  //   } catch (error) {
  //     res.status(401).json({ message: error.message });
  //   }
  // });



  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Autentikasi pengguna dan hasilkan token di dalam loginUser
      const { user, token } = await superadmin.loginUser(username, password);
  
      if (user && token) {
        // Setel token sebagai cookie
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        
        res.json({
          message: 'Login berhasil',
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            token: token
          },
        });
      } else {
        return res.status(401).json({ message: 'Username atau password salah' });
      }
    } catch (error) {
      console.error('Kesalahan login:', error);
      return res.status(500).json({ message: 'Kesalahan server internal' });
    }
  });
  
  
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


  // // Rute yang memerlukan autentikasi
  // app.get('/protected-route', authenticateToken, (req, res) => {
  //   res.send('This is a protected route');
  // });

  // // Rute yang tidak memerlukan autentikasi
  // app.get('/public-route', (req, res) => {
  //   res.send('This is a public route');
  // });


  // Rute untuk membaca list stok produk
  app.get('/api/admin/products/stock', authenticateToken, async (req, res) => {
    try {
        const stockProducts = await admin.getListStockProducts();
        res.status(200).json(stockProducts);
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
    const { product_code, product_name, brand, type, price, stock } = req.body;
    const image = req.file ? `uploads/${req.file.filename}`: null;

    try {
        const product = await admin.addProduct({ product_code, product_name, brand, type, price, stock, image});
        res.status(201).json({ 
          message: 'Product added successfully',
          product,
          image_url: `http://localhost:3000/${image}` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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
    const { product_name, brand, type, price, stock, } = req.body;
    
    const image = req.file ? `uploads/${req.file.filename}` : null;
    console.log('Image:', image); // Cek apakah image tidak null
    
    try {
        const updatedProduct = await admin.updateProduct(id, {
          product_name,
          brand,
          type,
          price,
          stock,
          image
        });

        res.status(200).json({
          message: 'Product updated successfully',
          product: updatedProduct,
          image_url: image ? `http://localhost:3000/${updatedProduct.image}` : null
        });
    } catch (error) { 
        console.error('Error updating product:', error);
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
  app.get('/api/admin/customers', authenticateToken,async (req, res) => {
    try {
        const customers = await admin.getListCustomers();
        res.status(200).json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk menampilkan transaksi berdasarkan id
  app.get('/api/admin/reportTransaction/:id', authenticateToken, async (req, res) => {
      const transactionId = req.params.id;
  
      console.log('Received Transaction ID:', transactionId); // Debugging
  
      try {
          const transactionData = await getTransactionById(transactionId);
          if (!transactionData) {
              return res.status(404).json({ error: 'Transaction not found' });
          }
          res.status(200).json(transactionData);
      } catch (error) {
          console.error('Error fetching transaction:', error); // Debugging
          res.status(500).json({ error: 'Internal server error' });
      }
  });

  app.get('/api/admin/reportTransactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await getAllTransactions();
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

  // Rute untuk membaca semua produk
  app.get('/api/cashier/products', async (req, res) => {
    try {
        const products = await cashier.getListProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk membaca produk berdasarkan id
  app.get('/api/cashier/products/:id', async (req, res) => {
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
  app.get('/api/cashier/customers', async (req, res) => {
    try {
        const customers = await cashier.getListCustomers();
        res.status(200).json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  //Rute untuk menambah customer
  app.post('/api/cashier/customers/add', async (req, res) => {
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
  app.put('/api/cashier/customers/:id', async (req, res) => {
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
  app.delete('/api/cashier/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const result = await cashier.deleteCustomer(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk membuat transaksi
  app.post('/api/cashier/transaksi', async (req, res) => {
    try {
      const { transaction_code, member_id, cashier, total, payment, change, items } = req.body;

      // Memanggil fungsi createTransaction untuk menyimpan transaksi ke database
      const newTransaction = await createTransaction({
          transaction_code,
          member_id,
          cashier,
          total,
          payment,
          change,
          items
      });

      // Mengembalikan response dengan data transaksi baru
      res.status(201).json({
          message: 'Transaksi berhasil dibuat',
          data: newTransaction
      });
  } catch (error) {
      res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
  });

  // Mendapatkan laporan penjualan berdasarkan cashier
  app.get('/api/cashier/laporanTransaksi/:cashierName', async (req, res) => {
    try {
        const { cashier } = req.params;
        const report = await getTransactionReportByCashier(cashier);
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
  app.get('/api/superadmin/users', async (req, res) => {
    try {
        const users = await superadmin.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk mendapatkan user berdasarkan ID
  app.get('/api/superadmin/users/:id', async (req, res) => {
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
  app.post('/api/superadmin/users/add', async (req, res) => { 
    const { username, name, telepon, role, password} = req.body;

    try {
      const result = await superadmin.addUser(username,name, telepon, role, password);
      res.status(201).json({
        message: result.message,
        user: result.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rute untuk mengupdate user
  app.put('/api/superadmin/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, name, telepon, password, role } = req.body;

    try {
      const result = await superadmin.updateUser(id, { username, name, telepon, password, role });
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });


  // Rute untuk menghapus user
  app.delete('/api/superadmin/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const result = await superadmin.deleteUser(id);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });




  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
