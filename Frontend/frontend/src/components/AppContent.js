
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
