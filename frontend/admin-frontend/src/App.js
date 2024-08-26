import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react-pro'
import './scss/style.scss'

import './scss/examples.scss'
import 'sweetalert2/dist/sweetalert2.min.css';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const DataBarang = React.lazy(() => import('./views/pages/barang/DataBarang'))
const Customers = React.lazy(() => import('./views/pages/customers/CustomersList'))
const LaporanPenjualan = React.lazy(() => import('./views/pages/laporan/LaporanPenjualan'))


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes(
    'coreui-pro-react-admin-template-theme-light',
  )
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Router>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route exact path="/" name="Login Page" element={<Login />} />

          {/* Routes with DefaultLayout */}
          <Route element={<DefaultLayout />}>
            <Route exact path="/dashboard/*" name="Home" element={<DefaultLayout />} />
            <Route exact path="/dataBarang" name="Data Barang Page" element={<DataBarang />} />
            <Route exact path="/customers" name="Customers List" element={<Customers />} />
            <Route exact path="/laporanPenjualan" name="Laporan Penjualan" element={<LaporanPenjualan />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App












// import React, { Suspense, useEffect } from 'react'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import { useSelector } from 'react-redux'

// import { CSpinner, useColorModes } from '@coreui/react-pro'
// import './scss/style.scss'

// import './scss/examples.scss'
// // import DefaultLayout from './layout/DefaultLayout'

// // Containers
// const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// // Pages
// const Login = React.lazy(() => import('./views/pages/login/Login'))
// const DataBarang = React.lazy(() => import('./views/pages/barang/DataBarang'))
// const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
// const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// // Email App
// const EmailApp = React.lazy(() => import('./views/apps/email/EmailApp'))

// const App = () => {
//   const { isColorModeSet, setColorMode } = useColorModes(
//     'coreui-pro-react-admin-template-theme-light',
//   )
//   const storedTheme = useSelector((state) => state.theme)

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.href.split('?')[1])
//     const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
//     if (theme) {
//       setColorMode(theme)
//     }

//     if (isColorModeSet()) {
//       return
//     }

//     setColorMode(storedTheme)
//   }, []) // eslint-disable-line react-hooks/exhaustive-deps

//   return (
//     <Router>
//       <Suspense
//         fallback={
//           <div className="pt-3 text-center">
//             <CSpinner color="primary" variant="grow" />
//           </div>
//         }
//       >
//         <Routes>
//           <Route exact path="/" name="Login Page" element={<Login />} />
//           <Route exact path="/dashboard/*" name="Home" element={<DefaultLayout />} />
//           <Route exact path="/dataBarang" name="Data Barang Page" element={<DataBarang />} />
//           <Route exact path="/404" name="Page 404" element={<Page404 />} />
//           <Route exact path="/500" name="Page 500" element={<Page500 />} />
//           <Route path="/apps/email/*" name="Email App" element={<EmailApp />} />
//           <Route path="*" name="Home" element={<DefaultLayout />} />
//         </Routes>
//       </Suspense>
//     </Router>
//   )
// }

// export default App


