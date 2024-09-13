// import React from 'react';
// import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

// const SuperAdminDashboard = () => {
//   return (
//     <CRow>
//       <CCol>
//         <CCard>
//           <CCardHeader>
//             SuperAdmin Dashboard
//           </CCardHeader>
//           <CCardBody>
//             {/* Tambahkan konten dashboard superadmin di sini */}
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   );
// };

// export default SuperAdminDashboard;


import { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
      // CChartBar,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
} from '@coreui/icons'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'


const Dashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    itemsCounter: 0,
    minimumStock: 0,
    latestIncomingItems: 0,
    latestSales: 0,
  });

  useEffect(() => {
    axios.get('http://localhost:3000/api/dashboard-admin')
      .then(response => {
        console.log(response.data); // For debugging purposes
        setDashboardData(response.data);
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  const progressExample = [
    {
      title: t('Jumlah Barang'),
      value: t('itemsCounter', { counter: dashboardData.itemsCounter }),
      percent: 100, // Adjust based on real data if needed
      color: 'success',
    },
    {
      title: t('Jumlah Stok yang Mencapai Minimum'),
      value: t('itemsCounter', { counter: dashboardData.minimumStock }),
      percent: Math.min(100, (dashboardData.minimumStock / 100) * 100), // Example calculation
      color: 'danger',
    },
    {
      title: t('Jumlah Barang Masuk Bulan Terbaru'),
      value: t('itemsCounter', { counter: dashboardData.latestIncomingItems }),
      percent: Math.min(100, (dashboardData.latestIncomingItems / 100) * 100), // Example calculation
      color: 'info',
    },
    {
      title: t('Jumlah Penjualan Bulan Terbaru'),
      value: t('itemsCounter', { counter: dashboardData.latestSales }),
      percent: Math.min(100, (dashboardData.latestSales / 100) * 100), // Example calculation
      color: 'warning',
    },
  ];

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                {t('traffic')}
              </h4>
              <div className="small text-body-secondary">
                {t('date', {
                  date: new Date(2023, 0, 1),
                  formatParams: {
                    date: {
                      month: 'long',
                    },
                  },
                })}{' '}
                -{' '}
                {t('date', {
                  date: new Date(2023, 6, 1),
                  formatParams: {
                    date: {
                      year: 'numeric',
                      month: 'long',
                    },
                  },
                })}
              </div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CIcon icon={cilCloudDownload} className="float-end" />
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 4 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress
                  thin
                  className="mt-2"
                  color={`${item.color}-gradient`}
                  value={item.percent}
                />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
      {/* <WidgetsBrand className="mb-4" withCharts /> */}
      {/* <CCol md={6}>
        <CCard className="mb-4">
          <CCardHeader>Bar Chart</CCardHeader>
          <CCardBody>
            <CChartBar
              data={{
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                  {
                    label: 'GitHub Commits',
                    backgroundColor: '#f87979',
                    data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                  },
                ],
              }}
              labels="months"
            />
          </CCardBody>
        </CCard>
      </CCol>
       <CCol md={6}>
        <CCard className="mb-4">
          <CCardHeader>Pie Chart</CCardHeader>
          <CCardBody>
            <CChartPie
              data={{
                labels: ['Red', 'Green', 'Yellow'],
                datasets: [
                  {
                    data: [300, 50, 100],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol> */}
    </>
  );
}

export default Dashboard;


// const Dashboard = () => {
//   const { t } = useTranslation()

//   const progressExample = [
//     {
//       title: t('Jumlah Barang'),
//       value: t('itemsCounter', { counter: '120' }),
//       percent: 100,
//       color: 'success',
//     },
//     {
//       title: t('Jumlah Stok yang Mencapai Minimum'),
//       value: t('itemsCounter', { counter: '10' }),
//       percent: 8,
//       color: 'danger',
//     },
//     {
//       title: t('Jumlah Barang Masuk Bulan Terbaru'),
//       value: t('itemsCounter', { counter: '50' }),
//       percent: 42,
//       color: 'info',
//     },
//     {
//       title: t('Jumlah Penjualan Bulan Terbaru'),
//       value: t('itemsCounter', { counter: '30' }),
//       percent: 25,
//       color: 'warning',
//     },
//   ]

//   return (
//     <>
//       <WidgetsDropdown className="mb-4" />
//       <CCard className="mb-4">
//         <CCardBody>
//           <CRow>
//             <CCol sm={5}>
//               <h4 id="traffic" className="card-title mb-0">
//                 {t('traffic')}
//               </h4>
//               <div className="small text-body-secondary">
//                 {t('date', {
//                   date: new Date(2023, 0, 1),
//                   formatParams: {
//                     date: {
//                       month: 'long',
//                     },
//                   },
//                 })}{' '}
//                 -{' '}
//                 {t('date', {
//                   date: new Date(2023, 6, 1),
//                   formatParams: {
//                     date: {
//                       year: 'numeric',
//                       month: 'long',
//                     },
//                   },
//                 })}
//               </div>
//             </CCol>
//             <CCol sm={7} className="d-none d-md-block">
//               <CIcon icon={cilCloudDownload} className="float-end" />
//             </CCol>
//           </CRow>
//           <MainChart />
//         </CCardBody>
//         <CCardFooter>
//           <CRow
//             xs={{ cols: 1, gutter: 4 }}
//             sm={{ cols: 2 }}
//             lg={{ cols: 4 }}
//             xl={{ cols: 4 }}
//             className="mb-2 text-center"
//           >
//             {progressExample.map((item, index, items) => (
//               <CCol
//                 className={classNames({
//                   'd-none d-xl-block': index + 1 === items.length,
//                 })}
//                 key={index}
//               >
//                 <div className="text-body-secondary">{item.title}</div>
//                 <div className="fw-semibold text-truncate">
//                   {item.value} ({item.percent}%)
//                 </div>
//                 <CProgress
//                   thin
//                   className="mt-2"
//                   color={`${item.color}-gradient`}
//                   value={item.percent}
//                 />
//               </CCol>
//             ))}
//           </CRow>
//         </CCardFooter>
//       </CCard>
//         {/* <WidgetsBrand className="mb-4" withCharts /> */}
//     </>
//   )
// }

// export default Dashboard


