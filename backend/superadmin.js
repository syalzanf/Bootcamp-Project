const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./connection');
const User = require('./models/user');
const sequelize = require('./configdb');
const validator = require('validator');
require('dotenv').config();

// const secretKey = 'secret_key'; 
const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

console.log('Access Token Secret:', jwtSecret);
console.log('Refresh Token Secret:', jwtRefreshSecret);

// async function loginUser(username, password) {
//   try {
//     // Mengambil user dari database
//     const user = await User.findOne({ where: { username } });
//     console.log('User:', user); 
    
//     if (!user) {
//       throw new Error('User tidak ada');
//     }

//     if (user.status !== 'active') {
//       throw new Error('Account is not active')  ;
//     }

//     // Memeriksa apakah password cocok
//     const isMatch = await bcrypt.compare(password, user.password);
//     console.log('Password match:', isMatch); 

//     if (!isMatch) {
//       throw new Error('Invalid username or password');
//     }

//     // Menghasilkan token JWT
//     const token = jwt.sign(
//       { username: user.username, role: user.role },
//       jwtSecret,
//       { expiresIn: '1h' }
//     );
//     console.log('Generated Token:', token);

//     // Mengembalikan hasil login
//     return {
//       message: 'Login successful',
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         name: user.name, 
//         role: user.role,
//         telepon: user.telepon,
//         photo: user.photo,
//       }
//     };
//   } catch (error) {
//     console.error('Login error:', error.message); 
//     // return {
//     //   status: 400,
//     //   message: error.message
//     // };
//     throw error;
//   }
// }


async function loginUser(username, password) {
  try {
    // Mengambil user dari database
    const user = await User.findOne({ where: { username } });
    console.log('User:', user); 
    
    if (!user) {
      throw new Error('User tidak ada');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Memeriksa apakah password cocok
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); 

    if (!isMatch) {
      throw new Error('Invalid username or password');
    }

    // Menghasilkan token JWT
    const token = jwt.sign(
      { username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '1h' } // access token berlaku selama 1 jam
    );

    // Menghasilkan refresh token
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role },
      jwtRefreshSecret,
      { expiresIn: '7d' } // refresh token berlaku selama 7 hari
    );

    console.log('Generated Access Token:', token);
    console.log('Generated Refresh Token:', refreshToken);

    // Mengembalikan hasil login
    return {
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name, 
        role: user.role,
        telepon: user.telepon,
        photo: user.photo,
      }
    };
  } catch (error) {
    console.error('Login error:', error.message); 
    throw error;
  }
}



// Fungsi untuk verifikasi token
async function verifyToken(token) {
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Ambil username dan role dari token
    const { username, role } = decoded;
    
    // Cari pengguna berdasarkan username
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      console.error('User not found:', username);
      throw new Error('User not found');
    }

    // Verifikasi role jika diperlukan
    if (role && user.role !== role) {
      console.error('Role mismatch:', { tokenRole: role, userRole: user.role }); 
      throw new Error('Role mismatch');
    }
    
    // Kembalikan informasi profil pengguna
    return {
      message: 'Token is valid',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        telepon: user.telepon,
        role: user.role,
        photo: user.photo,
      }
    };
  } catch (error) {
    console.error('Error verifying token:', error.message); // Log error
    throw error;
  }
}

async function addUser(username, name, telepon, role, password, photo) {
  try {

    if (!username || !name || !telepon || !role || !password || !photo) {
      throw new Error('All fields are required');
    }

    if (!validator.isMobilePhone(telepon, 'id-ID')) {
      throw new Error('Invalid phone number format');
    }

    // Cek apakah username sudah ada di database
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Cek apakah phoneNumber sudah ada di database
    const existingPhoneNumber = await User.findOne({ where: { telepon } });

    if (existingPhoneNumber) {
      throw new Error('Phone number already exists');
    }

    // Hash password sebelum menyimpannya ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user ke database
    const newUser = await User.create({
      username,
      name,
      telepon,
      password: hashedPassword,
      role,
      photo,
      status: 'active'
    });

    return {
      message: 'User created successfully',
      user: newUser
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function superadminLogin(username, password) {
    try {
      // Cek apakah username ada di database
      const result = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
      );
  
      if (result.rows.length === 0) {
        throw new Error('Username not found');
      }
  
      const superadmin = result.rows[0];
  
      // Cek password yang diinput dengan password yang di-hash di database
      const isValidPassword = await bcrypt.compare(password, superadmin.password);
  
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
  
      // Jika login berhasil, kembalikan informasi yang diperlukan
      return {
        message: 'Login successful',
        superadminId: superadmin.id,
        username: superadmin.username,
      };
    } catch (error) {
      throw error;
    }
  }
  
// async function addUser(username, name, telepon, role) {
//   try {
//     // Cek apakah username sudah ada di database
//     const checkUser = await pool.query(
//       `SELECT * FROM users WHERE username = $1`,
//       [username]
//     );

//     if (checkUser.rows.length > 0) {
//       throw new Error('Username already exists');
//     }

//     // Generate random default password
//     const defaultpassword = crypto.randomBytes(6).toString('hex'); // menghasilkan string hex 12 karakter

//     // Hash password sebelum menyimpannya ke database
//     const hashedPassword = await bcrypt.hash(defaultpassword, 10);

//     // Insert user ke database
//     const result = await pool.query(
//       `INSERT INTO users (username, name, telepon, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//       [username, name, telepon, hashedPassword, role]
//     );

//     return {
//       message: 'User created successfully',
//       user: result.rows[0],
//       default_password: defaultpassword, // Password default yang dihasilkan
//     };
//   } catch (error) {
//     throw error;
//   }
// }


  // async function getAllUsers() {
  //   try {
  //     const result = await pool.query(`SELECT * FROM users`);
  //     return result.rows;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async function getAllUsers() {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
      });
      console.log(users);  
      return users; 
    } catch (error) {
      throw error;
    }
  }

  
async function updateUserStatus(userId, newStatus) {
    try {
      const validStatuses = ['active', 'inactive'];
      console.log(`Updating status for user ${userId} to ${newStatus}`);


      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status value. Allowed values are "active" or "inactive".');
      }
  
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
  
      user.status = newStatus;
      await user.save();
  
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  
  
  async function getUserById(id) {
    try {
      const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      return result.rows[0];
    } catch (error) {
      throw error;
    } 
  }

  async function updateUser(id, { username, name, telepon, password, role, photo }) {
    try {
      console.log("id", id);
      
      // Cek apakah pengguna dengan ID yang diberikan ada di database
      const checkUser = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [id]
      );
  
      if (checkUser.rows.length === 0) {
        throw new Error('User not found');
      }
  
      // Siapkan query update
      let updateQuery = `UPDATE users SET `;
      let values = [];
      let index = 1;
  
      // Hanya tambahkan kolom yang memiliki nilai baru
      if (username) {
        updateQuery += `username = $${index++}, `;
        values.push(username);
      }
      if (name) {
        updateQuery += `name = $${index++}, `;
        values.push(name);
      }
      if (telepon) {
        updateQuery += `telepon = $${index++}, `;
        values.push(telepon);
      }
      if (password) {
        // Hash password baru sebelum menyimpan
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += `password = $${index++}, `;
        values.push(hashedPassword);
      }
      if (role) {
        updateQuery += `role = $${index++}, `;
        values.push(role);
      }
      if (photo) {
        // Update kolom foto jika ada foto baru
        updateQuery += `photo = $${index++}, `;
        values.push(photo);
      }
  
      // Hapus trailing comma dan spasi
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ` WHERE id = $${index} RETURNING *`;
      values.push(id);
  
      // Lakukan update
      const result = await pool.query(updateQuery, values);
  
      // Mengembalikan user yang telah diperbarui
      return {
        message: 'User updated successfully',
        user: result.rows[0] // Ini akan berisi data user yang diperbarui
      };
    } catch (error) {
      throw error;
    }
  }
  
async function updateUserRole(id, role) {
  const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *';
  const values = [role, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}


async function updatePassword(id, newPassword) {
  try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const result = await pool.query(
          `UPDATE users SET password = $1 WHERE id = $2 RETURNING *`,
          [hashedPassword, id]
      );
      return result.rows[0];
  } catch (error) {
      throw error;
  }
}


  async function deleteUser(id) {
    try {
      const result = await pool.query(
        `DELETE FROM users WHERE id = $1 RETURNING *`,
        [id]
      );
  
      if (result.rowCount === 0) {
        throw new Error('User not found');
      }
  
      return {
        message: 'User deleted successfully',
        user: result.rows[0],
      };
    } catch (error) {
      throw error;
    }
  }

  module.exports = { 
    loginUser,
    verifyToken,
    superadminLogin,
    updateUserStatus,
    addUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updatePassword,
    updateUserRole
 };