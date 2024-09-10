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
            name: user.name,
            telepon: user.telepon,
            photo:user.photo,
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

// Rute update profile user
// app.put('/api/profile', authenticateToken, upload.single('photo'), async (req, res) => {
app.patch('/api/profile', authenticateToken, upload.single('photo'), async (req, res) => {

  const { username, name, telepon, password, role } = req.body;
  const userId = req.user.id; 
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const updatedUser = await superadmin.updateUser(userId, { username, name, telepon, password, role, photo });

    res.status(200).json({
      message: updatedUser.message,
      user: updatedUser.user,
      photo_url: photo ? `http://localhost:3000${updatedUser.user.photo}` : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        const product = await admin.addProduct({ product_code, product_name, brand, type, price, stock, image});
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
  app.get('/api/admin/customers', authenticateToken, async (req, res) => {
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

  app.get('/api/cashier/member/:telepon', async (req, res) => {
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

  app.post('/api/cashier/transaksi', async (req, res) => {
    try {
      const { 
        id,
        transaction_code,
        member_id, 
        // telepon, 
        id_cashier, 
        cashier, 
        total, 
        payment_method, 
        debit_card_code, 
        payment, 
        change, 
        items 
      } = req.body;
  
      // const member = await getMemberByTelepon(telepon);

      // if (!member) {
      //   return res.status(404).json({ message: 'Member tidak ditemukan' });
      // }

      // const member_id = member.member_id;
  
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
      res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
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
  app.get('/api/generate-receipt/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await cashier.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const doc = new PDFDocument();
      // const stream = doc.pipe(blobStream());


    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=receipt-${transaction.transaction_code}.pdf`);

    // Output PDF langsung ke response
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {
        // Combine all chunks into a single buffer
        const pdfBuffer = Buffer.concat(chunks);
        
        // Convert buffer to Base64
        const base64PDF = pdfBuffer.toString('base64');
        
        // Output the Base64 string
        console.log(base64PDF);
        
        res.json({ base64: base64PDF });

      });
    
    // doc.pipe(res);

    // Konten PDF
    doc.fontSize(20).text('Receipt', { align: 'center' });
    doc.moveDown();
    const formattedDate = new Date(transaction.transaction_date).toDateString();
    doc.fontSize(14).text(`Transaction Date: ${formattedDate}`);
    doc.fontSize(14).text(`Transaction Code: ${transaction.transaction_code}`);
    // doc.text(`Member ID: ${transaction.member_id}`);
    doc.text(`Cashier: ${transaction.cashier}`);
    doc.text(`Total: Rp.${transaction.total}`);
    doc.text(`Payment Method: ${transaction.payment_method}`);
    if (transaction.debit_card_code) {
      doc.text(`Debit Card Code: ${transaction.debit_card_code}`);
    }
    doc.text(`Payment: Rp.${transaction.payment}`); 
    doc.text(`Change: Rp.${transaction.change}`);
    doc.moveDown();

    // Items ke PDF
    doc.fontSize(12).text('Items:');
    transaction.items.forEach(item => {
      doc.text(`${item.product_name} - ${item.brand} - ${item.type} - ${item.price} - ${item.qty}`);
    });

    doc.end();

    // stream.on('finish', function () {
    //   const blob = stream.toBlob('application/pdf');
    //   const url = stream.toBlobURL('application/pdf');
    //   res.status(200).send(url);
    // });

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'An error occurred while generating the receipt.' });
  }
});

  
  // app.post('/api/cashier/transaksi', async (req, res) => {
  //   try {
  //     const { 
  //       transaction_code, 
  //       kode_member, 
  //       id_cashier, 
  //       cashier, 
  //       total, 
  //       payment_method, 
  //       debit_card_code, 
  //       payment, 
  //       change, 
  //       items 
  //     } = req.body;
  
  //     console.log('Received data:', {
  //       transaction_code,
  //       kode_member,
  //       id_cashier,
  //       cashier,
  //       total,
  //       payment_method,
  //       debit_card_code,
  //       payment,
  //       change,
  //       items
  //     });
  
  //     // Validasi input
  //     if (!transaction_code || !id_cashier || !cashier || !total || !payment_method || !payment || !change || !items || items.length === 0) {
  //       return res.status(400).json({ message: 'Input tidak lengkap atau tidak valid.' });
  //     }
  
  //     // Pastikan kode_member valid jika ada
  //     let debit = payment_method === 'debit' && debit_card_code ? debit_card_code : null;
  
  //     const newTransaction = await createTransaction({
  //       transaction_code,
  //       kode_member,
  //       id_cashier,
  //       cashier,
  //       total,
  //       payment_method,
  //       debit,
  //       payment,
  //       change,
  //       items
  //     });
  
  //     res.status(201).json({
  //       message: 'Transaksi berhasil dibuat',
  //       data: newTransaction,
  //       transaction_code: newTransaction.transaction_code
  //     });
  //   } catch (error) {
  //     console.error('Error occurred while creating transaction:', error);
  //     res.status(500).json({ message: 'Terjadi kesalahan saat membuat transaksi.', error: error.message });
  //   }
  // });
  
  // Rute untuk membaca semua member
  
  
  app.get('/api/cashier/members', async (req, res) => {
    try {
        const users = await cashier.getAllMember();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
  });


  // Mendapatkan laporan penjualan berdasarkan cashier
  app.get('/api/cashier/laporanTransaksi/:cashierName', async (req, res) => {
    try {
        const { cashierName } = req.params;
        const report = await getTransactionReportByCashier(cashierName);
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
  app.post('/api/superadmin/users/add', upload.single('photo'), async (req, res) => { 
    const { username, name, telepon, role, password} = req.body;

    const photo = req.file ?  `/uploads/${req.file.filename}` : null;

    try {
      const result = await superadmin.addUser(username,name, telepon, role, password, photo);
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
  app.put('/api/superadmin/users/:id', upload.single('photo'), async (req, res) => {
    const { id } = req.params;
    const { username, name, telepon, password, role } = req.body;

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
  app.put('/api/superadmin/users/:id/role', async (req, res) => {
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



app.put('/api/user/:id/status', async (req, res) => {
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
