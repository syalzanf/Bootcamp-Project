
// // routes config
// // import routes from '../routes'

// import React, { Suspense, useEffect, useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { CContainer, CSpinner } from '@coreui/react-pro';
// import axios from 'axios';
// import { useSelector } from 'react-redux';
// import { adminRoutes, cashierRoutes, superadminRoutes } from '../routes';
// const DataBarang = React.lazy(() => import('../views/pages/barang/DataBarang'))

// const AppContent = () => {
//     const [user, setUser] = useState(null);

//   return (
//     <CContainer lg className="px-4">
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {adminRoutes.map((route, idx) => {
//             return (
//               route.element && (
//                 <Route
//                   key={idx}
//                   path={route.path}
//                   exact={route.exact}
//                   name={route.name}
//                   element={<route.element />}
//                 />
//               )
//             )
//           })}
//             <Route path="/" element={<Navigate to={`/${localStorage.getItem('userRole')}-dashboard`} replace />} />
//         </Routes>
//       </Suspense>
//     </CContainer>
//   )
// }

// export default React.memo(AppContent)



import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CContainer, CSpinner } from '@coreui/react-pro';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { adminRoutes, cashierRoutes, superadminRoutes } from '../routes';
const DashboardAdmin = React.lazy(() => import('../views/dashboard/DashboardAdmin'))
const DashboardSuperadmin = React.lazy(() => import('../views/dashboard/DashboardSuperadmin'))
const DashboardCashier = React.lazy(() => import('../views/dashboard/DashboardCashier'))

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedTheme = useSelector((state) => state.theme);

  const token = localStorage.getItem('token'); 
  const dashboard = DashboardAdmin;
  const [timeLeft, setTimeLeft] = useState(3600); // 1 jam dalam detik (3600 detik)
  
  useEffect(() => {
    // Set interval untuk mengurangi waktu setiap detik
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId); // Hentikan interval ketika waktu habis
          handleLogout();
          return 0; // Pastikan timeLeft tidak menjadi negatif
        }
        return prevTime - 1;
      });
    }, 1000); // 1000ms = 1 detik

    // Cleanup interval ketika komponen di-unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Panggil refreshAccessToken 5 menit sebelum token kedaluwarsa
    if (timeLeft <= 600) { // 5 menit dalam detik
      refreshAccessToken();
    }
  }, [timeLeft]);


  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/refresh-token', { refreshToken });
      setTimeLeft(3600); // Reset waktu ke 1 jam lagi
      localStorage.removeItem('token'); // Misal token disimpan di localStorage
      localStorage.setItem('token', response.data.token);
      console.log('Token berhasil diperbarui:', response.data.token);
    } catch (error) {
      console.error('Gagal memperbarui token:', error);
      handleLogout();
    }
  };

  // Fungsi untuk format waktu dalam format mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    // Proses logout (misalnya, hapus token dari localStorage)
    localStorage.removeItem('token'); // Misal token disimpan di localStorage
    navigate('/login'); // Redirect ke halaman login
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(localStorage.getItem('user'));
        // Tentukan routes berdasarkan peran pengguna
        switch (localStorage.getItem('userRole')) {
          case 'admin':
            setRoutes(adminRoutes);
            break;
          case 'cashier':
            setRoutes(cashierRoutes);
            break;
          case 'superadmin':
            setRoutes(superadminRoutes);
            break;
          default:
            console.error('Unknown user role:', response.data.user.role);
            setRoutes([]); // Atau arahkan ke halaman error
            break;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null); // Jika gagal mengambil data pengguna
        setRoutes([]); // Kosongkan routes jika gagal
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <CContainer lg className="px-4">
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      </CContainer>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!routes || routes.length === 0) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CContainer lg className="px-4">
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
       { routes.map((route, idx) => { 
           return ( 
               route.element && ( 
                 <Route 
                   key={idx} 
                   path= {route.path}
                   exact={route.exact} 
                   name={route.name} 
                   element={<route.element />} 
                 /> 
               )
             ) 
           })}
          <Route path="/admin-dashboard" element={<DashboardAdmin /> }/>    
          <Route path="/superadmin-dashboard" element={<DashboardSuperadmin />} />
          <Route path="/cashier-dashboard" element={<DashboardCashier /> }/>    

         </Routes>
      </Suspense>
    </CContainer>
  );
};

export default React.memo(AppContent);





  //   return    (
  //   <CContainer lg className="px-4">
  //     <Suspense fallback={<CSpinner color="primary" />}>
  //       <Routes>
  //         {routes.map((route, idx) => {
  //           console.log('cek', route.element)
  //           return (
  //             <Route path="/data-barang" element={<DataBarang />} />       
  //           )
  //         })}
  //         <Route path="/" element={<Navigate to={`/${user.role}-dashboard`} replace />} />
  //       </Routes>
  //     </Suspense>
  //   </CContainer>
  // )





// import React, { Suspense } from 'react'
// import { Navigate, Route, Routes } from 'react-router-dom'
// import { CContainer, CSpinner } from '@coreui/react-pro'
// import routes from '../routes'

// // Fungsi untuk mengambil role pengguna
// const getUserRole = () => {
//   return localStorage.getItem('role');
// }

// const AppContent = () => {
//   const userRole = getUserRole();

//   // Tentukan ke mana pengguna harus diarahkan berdasarkan role
//   const getDashboardPath = () => {
//     switch (userRole) {
//       case 'admin':
//         return '/dashboard-admin';
//       case 'cashier':
//         return '/dashboard-cashier';
//       case 'superadmin':
//         return '/dashboard-superadmin';
//       default:
//         return '/login'; // Jika role tidak dikenali, kembalikan ke halaman login
//     }
//   };

//   return (
//     <CContainer lg className="px-4">
//       <Suspense fallback={<CSpinner color="primary" />}>
//         <Routes>
//           {/* Route default akan diarahkan ke dashboard berdasarkan role */}
//           <Route path="/" element={<Navigate to={getDashboardPath()} replace />} />
//         </Routes>
//       </Suspense>
//     </CContainer>
//   )
// }

// export default React.memo(AppContent)
