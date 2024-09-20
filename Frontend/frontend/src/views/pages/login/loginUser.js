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
import gambarBg from '../../../assets/images/bgee.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/login', {
        username,
        password
      }, { withCredentials: true });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
        const { user, token } = response.data;

        // Simpan role dan token ke local storage
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userUsername', user.username);

        console.log("NAMEEE ", user.name);


        localStorage.setItem('token', user.token);


        console.log("TOKENnnn ", localStorage.getItem('token'));
        console.log("TOKENnnn2 ", user.token);

        const response2 = await axios.get('/api/profile', {
          headers: { Authorization: `${user.token}` },
          withCredentials: true
        });
        localStorage.setItem('user', response2.data);
        localStorage.setItem('id', response2.data.user.id);
        localStorage.setItem('username', response2.data.user.username);
        localStorage.setItem('name', response2.data.user.name);
        localStorage.setItem('telepon', response2.data.user.telepon)
        localStorage.setItem('photo', response2.data.user.photo)


        console.log("TOKENnnn ", localStorage.getItem('id'));

        // Arahkan ke halaman dashboard berdasarkan role
        navigate(`/${user.role}-dashboard`);
      }
  } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);

      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

      // Cek jika ada pesan error dari backend
      if (error.response && error.response.data && error.response.data.message) {
        // Jika ada pesan error khusus dari backend
        errorMessage = error.response.data.message;
      }
      setError(errorMessage); // Menampilkan pesan error yang sesuai
    }
  };

  return (
    <div
      className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundImage: `url(${gambarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // filter: 'brightness(0.5)',
      }}
    >
      <CContainer className="d-flex align-items-center justify-content-center h-100">
        <CRow className="justify-content-center w-100">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-3" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CCardBody className="flex-grow-1 d-flex flex-column">
                  <CForm onSubmit={handleLogin}>
                    <h5 className="text-center">Sign In to your account</h5>
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
                    <CRow className="mt-auto">
                      <CCol xs={12}>
                        <CButton color="primary" className="w-100 mb-3" type="submit">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={12} className="text-center">
                        <CButton color="link" className="px-0" style={{ textDecoration: 'none' }}>
                          Forgot password?
                        </CButton>
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
