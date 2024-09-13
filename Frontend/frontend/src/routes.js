// import React from 'react'
// import { Translation } from 'react-i18next'

// const Dashboard = React.lazy(() => import('./views/dashboard/DashboardAdmin'))
// const DashboardCashier = React.lazy(() => import('./views/dashboard/DashboardAdmin'))
// const DashboardSuperadmin = React.lazy(() => import('./views/dashboard/DashboardAdmin'))
// const DataBarang = React.lazy(() => import('./views/pages/barang/DataBarang'))
// const Stok = React.lazy(() => import('./views/pages/barang/Stok'))
// const Customers = React.lazy(() => import('./views/pages/customers/CustomersList'))
// const CustomersCashier = React.lazy(() => import('./views/pages/customers/Customers'))
// const LaporanPenjualan = React.lazy(() => import('./views/pages/laporan/LaporanPenjualan'))
// const Transaksi = React.lazy(() => import('./views/pages/transaksi/Transaksi'))


// const routes = [
//   { path: '/', exact: true, name: <Translation>{(t) => t('home')}</Translation> },
//   {
//     path: '/dashboard',
//     name: <Translation>{(t) => t('Dashboard')}</Translation>,
//     element: DashboardAdmin,
//   },
//   {
//     path: '/dashboard-cashier',
//     name: <Translation>{(t) => t('Dashboard')}</Translation>,
//     element: DashboardCashier,
//   },
//   {
//     path: '/dashboard-superadmin',
//     name: <Translation>{(t) => t('Dashboard')}</Translation>,
//     element: DashboardSuperadmin,
//   },
//   {
//     path: '/dataBarang',
//     name: <Translation>{(t) => t('Data Barang')}</Translation>,
//     element: DataBarang,
//     exact: true,
//   },
//   {
//     path: '/stok',
//     name: <Translation>{(t) => t('Stok')}</Translation>,
//     element: Stok,
//   },
//   {
//     path: '/customers',
//     name: <Translation>{(t) => t('Customers')}</Translation>,
//     element: Customers,
//   },
//   {
//     path: '/laporanPenjualan',
//     name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
//     element: LaporanPenjualan,
//   },
//   {
//     path: '/transaksi',
//     name: <Translation>{(t) => t('Transaksi')}</Translation>,
//     element: Transaksi,
//   },
//   {
//     path: '/customers-cashier',
//     name: <Translation>{(t) => t('Customers Cashier')}</Translation>,
//     element: CustomersCashier,
//   },
// ]

// export default routes



// import AdminDashboard from './views/dashboard/DashboardAdmin';
// import CashierDashboard from './views/dashboard/DashboardCashier';
// import SuperAdminDashboard from './views/dashboard/DashboardSuperadmin';
// import Customers from './views/pages/customers/CustomersList';

// const routes = {
//   admin: [
//     { path: '/admin-dashboard', element: AdminDashboard, name: 'Admin Dashboard', exact: true },
//     { path: '/customers', element: Customers, name: 'Customers', exact: true },
//     // Rute lainnya untuk admin
//   ],
//   cashier: [
//     { path: '/cashier-dashboard', element: CashierDashboard, name: 'Cashier Dashboard', exact: true },
//     // Rute lainnya untuk cashier
//   ],
//   superadmin: [
//     { path: '/superadmin-dashboard', element: SuperAdminDashboard, name: 'SuperAdmin Dashboard', exact: true },
//     // Rute lainnya untuk superadmin
//   ],
// };

// export default routes;






import React from 'react'
import { Translation } from 'react-i18next'

// Lazy loading components
const DashboardAdmin = React.lazy(() => import('./views/dashboard/DashboardAdmin'))
const DashboardCashier = React.lazy(() => import('./views/dashboard/DashboardCashier'))
const DashboardSuperadmin = React.lazy(() => import('./views/dashboard/DashboardSuperadmin'))
const DataBarang = React.lazy(() => import('./views/pages/barang/DataBarang'))
const Barang = React.lazy(() => import('./views/pages/barang/BarangList'))
const Stok = React.lazy(() => import('./views/pages/barang/Stok'))
const CustomersList = React.lazy(() => import('./views/pages/customers/CustomersList'))
const Customers = React.lazy(() => import('./views/pages/customers/Customers'))
const LaporanPenjualan = React.lazy(() => import('./views/pages/laporan/LaporanPenjualan'))
const LaporanPenjualanCashier = React.lazy(() => import('./views/pages/laporan/LaporanPenjualanCashier'))
const DataPenjualanCashier = React.lazy(() => import('./views/pages/laporan/DataPenjualanCashier'))
const DetailPenjualanCashier = React.lazy(() => import('./views/pages/laporan/DetailPenjualan'))
const Transaksi = React.lazy(() => import('./views/pages/transaksi/Transaksi'))
const DataUser = React.lazy(() => import('./views/pages/users/DataUsers'))
const LogAktivitas = React.lazy(() => import('./views/pages/users/LogAktivitas'))



const barangRoutes = [
  {
    path: '/data-barang',
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    element: DataBarang,
    exact: true,
  }
]

// Routes for Admin
const adminRoutes = [
  {
    path: '/dashboard-admin',
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    element: DashboardAdmin,
    exact: true,

  },
  {
    path: '/data-barang',
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    element: DataBarang,
    exact: true,
  },
  {
    path: '/stok',
    name: <Translation>{(t) => t('Stok')}</Translation>,
    element: Stok,
    exact: true,

  },
  {
    path: '/customer-list',
    name: <Translation>{(t) => t('Customers')}</Translation>,
    element: CustomersList,
    exact: true,

  },
  {
    path: '/laporan-penjualan',
    name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
    element: LaporanPenjualan,
    exact: true,

  }
];

// Routes for Cashier
const cashierRoutes = [
  {
    path: '/dashboard-cashier',
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    element: DashboardCashier,
    exact: true,

  },
  {
    path: '/transaksi',
    name: <Translation>{(t) => t('Transaksi')}</Translation>,
    element: Transaksi,
    exact: true,

  },
  {
    path: '/barang',
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    element: Barang,
    exact: true,

  },
  {
    path: '/customers',
    name: <Translation>{(t) => t('Customers')}</Translation>,
    element: Customers,
    exact: true,

  },
  {
    path: '/laporan-penjualan-cashier',
    name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
    element: LaporanPenjualanCashier,
    exact: true,

  },
  {
    path: '/data-penjualan-cashier',
    name: <Translation>{(t) => t('Data Penjualan')}</Translation>,
    element: DataPenjualanCashier,
    exact: true,
  },

];

// Routes for Superadmin
const superadminRoutes = [
  {
    path: '/dashboard-superadmin',
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    element: DashboardSuperadmin,
    exact: true,

  },
  {
    path: '/data-user',
    name: <Translation>{(t) => t('Data User')}</Translation>,
    element: DataUser,
    exact: true,
  },
  {
    path: '/app-log',
    name: <Translation>{(t) => t('Log Aktivitas')}</Translation>,
    element: LogAktivitas,
    exact: true,
  },
  {
    path: '/data-barang',
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    element: DataBarang,
    exact: true,
  },
  {
    path: '/stok',
    name: <Translation>{(t) => t('Stok')}</Translation>,
    element: Stok,
    exact: true,

  },
  {
    path: '/customers',
    name: <Translation>{(t) => t('Customers')}</Translation>,
    element: Customers,
    exact: true,

  },
  {
    path: '/laporan-penjualan',
    name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
    element: LaporanPenjualan,
    exact: true,
  },
];

export { barangRoutes, adminRoutes, cashierRoutes, superadminRoutes };
