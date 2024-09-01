// import React from 'react'
// import { Navigate, Outlet } from 'react-router-dom'

// // const PrivateRoute = ({ allowedRoles, user }) => {
// //   // Jika role pengguna tidak ada dalam allowedRoles, arahkan ke halaman login atau halaman lain yang diinginkan
// //   return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" />
// // }

// // const ProtectedRoute = ({ element: Element, ...rest }) => {
// //   const { user } = useSelector(state => state);
// //   return (
// //     <Route
// //       {...rest}
// //       element={user ? <Element /> : <Navigate to="/login" />}
// //     />
// //   );
// // };

// function PrivateRoute({ children }) {
//   const token = localStorage.getItem('token');
//   return token ? children : <Navigate to="/login" />;
// }


// export default PrivateRoute



import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ role, element }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Jika tidak ada token dan bukan halaman login, arahkan ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika peran tidak cocok, arahkan ke halaman login
  if (userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  // Jika token ada dan peran cocok, tampilkan elemen
  return element;
};

export default PrivateRoute;

