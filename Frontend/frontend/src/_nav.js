import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilCalendar,
  cilChartPie,
  cilCursor,
  cilDrop,
  cilEnvelopeOpen,
  cilGrid,
  cilLayers,
  cilMap,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilSpreadsheet,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react-pro'
import { Translation } from 'react-i18next'
// import { adminRoutes, cashierRoutes, superadminRoutes } from '../routes';


const _navAdmin = [
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    to: '/dashboard-admin',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    to: '/data-barang',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Stok')}</Translation>,
    to: '/stok',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Customers')}</Translation>,
    to: '/customer-list',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
    to: '/laporan-penjualan',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  }
]

const _navCashier = [
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    to: '/dashboard-cashier',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Transaksi')}</Translation>,
    to: '/transaksi',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Customers')}</Translation>,
    to: '/customers',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
    to: '/laporan-penjualan-cashier',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  }
]

const _navSuperadmin = [
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Dashboard')}</Translation>,
    to: '/dashboard-superadmin',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Data User')}</Translation>,
    to: '/data-user',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: <Translation>{(t) => t('Log Aktivitas')}</Translation>,
  //   to: '/app-log',
  //   icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  // },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Data Barang')}</Translation>,
    to: '/data-barang',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Stok')}</Translation>,
    to: '/stok',
    icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Customers')}</Translation>,
    to: '/customers',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: <Translation>{(t) => t('Data Penjualan')}</Translation>,
    to: '/laporan-penjualan',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  }
]


export { _navAdmin, _navCashier, _navSuperadmin };


// const _nav = [
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('dashboard')}</Translation>,
//     to: '/dashboard',
//     icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Data Barang')}</Translation>,
//     to: '/dataBarang',
//     icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Stok Opname')}</Translation>,
//     to: '/stok',
//     icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Customers List')}</Translation>,
//     to: '/customers',
//     icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Customers')}</Translation>,
//     to: '/customers-cashier',
//     icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Laporan Penjualan')}</Translation>,
//     to: '/laporanPenjualan',
//     icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('Transaksi')}</Translation>,
//     to: '/transaksi',
//     icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: <Translation>{(t) => t('LogOut')}</Translation>,
//     to: '/logout',
//     icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   },

// ]

// export default _nav


// import React from 'react';
// import CIcon from '@coreui/icons-react';
// import {
//   cilSpeedometer,
//   cilDrop,
//   cilPencil,
//   cilPuzzle,
// } from '@coreui/icons';
// import { CNavItem } from '@coreui/react-pro';
// import { Translation } from 'react-i18next';

// const getNavByRole = (role) => {
//   switch (role) {
//     case 'superadmin':
//       return [
//         {
//           component: CNavItem,
//           name: <Translation>{(t) => t('dashboard')}</Translation>,
//           to: '/superadmin-dashboard',
//           icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//         },
//       ];
//     case 'admin':
//       return [
//         {
//           component: CNavItem,
//           name: <Translation>{(t) => t('dashboard')}</Translation>,
//           to: '/admin-dashboard',
//           icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//         },
//         {
//           component: CNavItem,
//           name: <Translation>{(t) => t('Customers')}</Translation>,
//           to: '/customers',
//           icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//         },
//       ];
//     case 'cashier':
//       return [
//         {
//           component: CNavItem,
//           name: <Translation>{(t) => t('dashboard')}</Translation>,
//           to: '/cashier-dashboard',
//           icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//         },
//       ];
//     default:
//       return [];
//   }
// };

// const _nav = (role) => getNavByRole(role);

// export default _nav;
