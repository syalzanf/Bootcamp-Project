const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('./connection');

const JWT_SECRET = process.env.JWT_SECRET;

// Login function
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the database for user credentials
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare hashed password
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Generate JWT token
        const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, role: user.role });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login };






// const bcrypt = require('bcrypt');
// const jwt = require('jwt-simple');
// const {User, Superadmin} = require('./models/user');
// const sequelize = require('./configdb');

// async function authenticateUser(username, password) {
//     try {
//         let user = await Superadmin.findOne({ where: { username } });
//         let role = 'superadmin';

//         if (!user) {
//             user = await User.findOne({ where: { username } });
//             role = user ? user.role : null;
//         }

//         if (!user) {
//             return { success: false, message: 'User not found' };
//         }

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) {
//             return { success: false, message: 'Incorrect password' };
//         }

//         const token = jwt.sign({ id: user.id, username: user.username, role }, 'your-secret-key', { expiresIn: '1h' });

//         return { success: true, token, role };
//     } catch (error) {
//         console.error('Error during authentication:', error);
//         return { success: false, message: 'Internal server error' };
//     }
// }

// async function userLogin(req, res) {
//     const { username, password } = req.body;

//     const result = await authenticateUser(username, password);

//     if (result.success) {
//         return res.status(200).json({ message: 'Login successful', token: result.token, role: result.role });
//     } else {
//         const status = result.message === 'User not found' ? 404 : result.message === 'Incorrect password' ? 401 : 500;
//         return res.status(status).json({ message: result.message });
//     }
// }

// module.exports = {
//     userLogin
// };
