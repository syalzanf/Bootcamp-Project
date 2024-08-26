const express = require('express');
const superadmin = require('./superadmin');
const admin = require('./admin');
const cashier = require('./cashier');
const app = express();
const port = 3000;
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session'); 

// Membuat path absolut ke folder 'uploads'
const uploadDir = path.join(__dirname, 'uploads');

// Membuat folder 'uploads' jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// // Konfigurasi penyimpanan file untuk multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const timestamp = Date.now();
//     const filename = `${timestamp}${ext}`;
    
//     cb(null, filename);
//   }
// });

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


const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
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

// Rute untuk membaca list stok produk
app.get('/api/admin/products/stock', async (req, res) => {
  try {
      const stockProducts = await admin.getListStockProducts();
      res.status(200).json(stockProducts);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});

// Rute untuk mendapatkan data produk berdasarkan kode produk
app.get('/api/admin/products/:product_code', async (req, res) => {
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
app.post('/api/admin/products/stock/:product_code', async (req, res) => {
  const { product_code } = req.params;
  const { stock } = req.body;

  try {
      // Validasi bahwa product_code diberikan dan additionalStock adalah tipe number
      if (!product_code || typeof stock !== 'number') {
          return res.status(400).json({ message: 'Kode produk dan stok tambahan yang valid diperlukan' });
      }

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
app.get('/api/admin/products', async (req, res) => {
  try {
      const products = await admin.getListProducts();
      res.status(200).json(products);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});


// Rute untuk menambahkan produk baru
app.post('/api/admin/products/add', upload.single('image'), async (req, res) => {
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
app.get('/api/admin/products/:id', async (req, res) => {
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
app.put('/api/admin/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { product_name, brand, type, price, stock } = req.body;
  
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
        image_url: image ? `http://localhost:3000/${image}` : null
      });
  } catch (error) { 
      console.error('Error updating product:', error);
      res.status(500).json({ message: error.message });
  }
});


// Rute untuk menghapus produk berdasarkan id
app.delete('/api/admin/products/:id', async (req, res) => {
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
app.get('/api/admin/customers', async (req, res) => {
  try {
      const customers = await admin.getListCustomers();
      res.status(200).json(customers);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
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
// app.post('/api/cashier/customers/add', async (req, res) => {
//   const customers = req.body;

//   // Log the data received in the request
//   console.log('Request body:', req.body);

//   if (!Array.isArray(customers)) {
//     return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
//   }

//   for (const customer of customers) {
//     const { nama, telepon, alamat } = customer;
//     if (!nama || !telepon || !alamat) {
//       return res.status(400).json({ message: 'All fields (nama, telepon, alamat) are required for each customer.' });
//     }
//   }

//   try {
//     const addedCustomers = [];
//     for (const customer of customers) {
//       const newCustomer = await cashier.addCustomer(customer);
//       addedCustomers.push(newCustomer);
//     }
//     res.status(201).json(addedCustomers);
//   } catch (error) {
//     console.error('Error adding customers:', error);
//     res.status(500).json({ message: 'Error adding customers: ' + error.message });
//   }
// });



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


// Rute untuk menambahkan item ke keranjang
app.post('/api/cart/add', (req, res) => {
  const { product_code, brand, type, price, quantity } = req.body;

  try {
      const item = { product_code, brand, type, price, quantity };
      cashier.addToCart(item);
      res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});

// Rute untuk mengosongkan keranjang
app.post('/api/cart/clear', (req, res) => {
  try {
      cashier.clearCart();
      res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});

// Rute untuk membuat transaksi
app.post('/api/cashier/transactions', async (req, res) => {
  const { paymentAmount, changeAmount, customerId } = req.body;

  try {
      const result = await cashier.createTransaction({ paymentAmount, changeAmount, customerId });
      res.status(201).json(result);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
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
  const { username, name, telepon, role} = req.body;

  try {
    const result = await superadmin.addUser(username,name, telepon, role);
    res.status(201).json({
      message: result.message,
      user: result.user,
      default_password: result.default_password, // Mengirim kembali password default ke superadmin
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
