// Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password
      }, { withCredentials: true });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
        const { user, token } = response.data;

        // Simpan role dan token ke local storage
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('token', user.token);

        console.log("TOKENnnn ", localStorage.getItem('token'));
        console.log("TOKENnnn2 ", user.token);

        const response2 = await axios.get('http://localhost:3000/api/profile', {
          headers: { Authorization: `${user.token}` },
          withCredentials: true
        });
        localStorage.setItem('user', response2.data);

        // Arahkan ke halaman dashboard berdasarkan role
        navigate(`/${user.role}-dashboard`);
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {error && <p className="text-danger">{error}</p>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        {/* <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton> */}
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;









// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('/api/login', { username, password });
//       const { message, user } = response.data;

//       // Menyimpan user dan role
//       if (user.role === 'admin') {
//         navigate('/admin-dashboard');
//       } else if (user.role === 'cashier') {
//         navigate('/cashier-dashboard');
//       } else if (user.role === 'superadmin') {
//         navigate('/superadmin-dashboard');
//       }
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       <input
//         type="text"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         placeholder="Username"
//         required
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//         required
//       />
//       <button type="submit">Login</button>
//       {error && <p>{error}</p>}
//     </form>
//   );
// }

// export default Login;
