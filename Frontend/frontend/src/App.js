import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react-pro';
import './scss/style.scss';
import './scss/examples.scss';
import 'sweetalert2/dist/sweetalert2.min.css';
// import { barangRoutes, adminRoutes, cashierRoutes, superadminRoutes } from './routes';

// Layouts and Pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./views/pages/login/loginUser'));

const DashboardAdmin = React.lazy(() => import('./views/dashboard/DashboardAdmin'))
const DashboardCashier = React.lazy(() => import('./views/dashboard/DashboardCashier'))
const DashboardSuperadmin = React.lazy(() => import('./views/dashboard/DashboardSuperadmin'))
const DataBarang = React.lazy(() => import('./views/pages/barang/DataBarang'))
const Stok = React.lazy(() => import('./views/pages/barang/Stok'))
const CustomersList = React.lazy(() => import('./views/pages/customers/CustomersList'))
const Customers = React.lazy(() => import('./views/pages/customers/Customers'))
const LaporanPenjualan = React.lazy(() => import('./views/pages/laporan/LaporanPenjualan'))
const LaporanPenjualanCashier = React.lazy(() => import('./views/pages/laporan/LaporanPenjualanCashier'))
const DetailPenjualanCashier = React.lazy(() => import('./views/pages/laporan/DetailPenjualan'))
const Transaksi = React.lazy(() => import('./views/pages/transaksi/Transaksi'))
const DataUser = React.lazy(() => import('./views/pages/users/DataUsers'))
const LogAktivitas = React.lazy(() => import('./views/pages/users/LogAktivitas'))


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-pro-react-admin-template-theme-light');
  const storedTheme = useSelector((state) => state.theme);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUser(localStorage.getItem('user'));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme');
    if (theme && /^[A-Za-z0-9\s]+$/.test(theme)) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);

  if (loading) {
    return <CSpinner color="primary" variant="grow" />;
  }

  return (
    <Router>
      <Suspense fallback={<CSpinner color="primary" variant="grow" />}>
        <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/login" element={<Login />} />

          {user ? (
            <>
              <Route element={<DefaultLayout />}>


                {/* Route untuk login */}
                <Route exact path="/admin-dashboard" element={<DashboardAdmin />} />
                <Route exact path="/superadmin-dashboard" element={<DashboardSuperadmin />} />
                <Route exact path="/cashier-dashboard" element={<DashboardCashier />} />
                


                <Route exact path="/dashboard-admin/*" name="Home" element={<DashboardAdmin />} />
                <Route exact path="/dashboard-superadmin/*" name="Home" element={<DashboardSuperadmin />} />
                <Route exact path="/dashboard-cashier/*" name="Home" element={<DashboardCashier />} />


                <Route exact path="/data-barang" element={<DataBarang />} />
                <Route exact path="/stok"element={<Stok />} />
                <Route exact path="/customer-list" element={<CustomersList />} />
                <Route exact path="/customers" element={<Customers />} />
                <Route exact path="/transaksi" element={<Transaksi />} />
                <Route exact path="/laporan-penjualan" element={<LaporanPenjualan />} />
                <Route exact path="/laporan-penjualan-cashier" element={<LaporanPenjualanCashier />} />
                <Route exact path="/detail-penjualan-cashier" element={<DetailPenjualanCashier />} />
                <Route exact path="/data-user" element={<DataUser />} />
                <Route exact path="/app-log" element={<LogAktivitas />} />


              {/* <Route exact path="/customers" name="Customers List" element={<Customers />} /> */}
              {/* <Route exact path="/customers-cashier" name="Customers Cashier" element={<CustomersCashier />} /> */}
              {/* <Route exact path="/laporanPenjualan" name="Laporan Penjualan" element={<LaporanPenjualan />} /> */}
              {/* <Route exact path="/transaksi" name="Transaksi" element={<Transaksi />} />   */}
            </Route>
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;


