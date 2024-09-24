import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import axios from 'axios';

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
} from '@coreui/react-pro'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const WidgetsDropdown = (props) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    minimumStock: 0,
    latestIncomingItems: 0,
    latestSales: 0,
    getTotalUsers: 0,
    itemsChartData: { labels: [], data: [] },
    stockChartData: { labels: [], data: [] },
    incomingItemsChartData: { labels: [], data: [] },
    salesChartData: { labels: [], data: [] },
  });

  const widgetChartRef1 = useRef(null);
  const widgetChartRef2 = useRef(null);

  useEffect(() => {
    // Fetch data from API
    axios.get('http://localhost:3000/api/dashboard-admin')
      .then(response => {
        setDashboardData(response.data);
        console.log('Dashboard Data:', response.data); 
      })
      .catch(error => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary');
          widgetChartRef1.current.update();
        });
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info');
          widgetChartRef2.current.update();
        });
      }
    });
  }, [widgetChartRef1, widgetChartRef2]);

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary-gradient"
          value={
            <>
              {dashboardData.getTotalUsers}{' '}
              <span className="fs-6 fw-normal">
                {/* Adjust the percentage and arrow based on your data */}
                (20% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title={t('Jumlah User')}
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
                <CDropdownItem>{t('Tambah Barang')}</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            dashboardData.itemsChartData?.labels?.length > 0 && dashboardData.itemsChartData?.data?.length > 0 ? (
              <CChartLine
                ref={widgetChartRef1}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: dashboardData.itemsChartData?.labels || [],
                  datasets: [
                    {
                      label: 'User',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-primary'),
                      data: dashboardData.itemsChartData?.data || [],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 0,
                      max: 150,
                      display: false,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 1,
                      tension: 0.4,
                    },
                    point: {
                      radius: 4,
                      hitRadius: 10,
                      hoverRadius: 4,
                    },
                  },
                }}
              />
            ) : null
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary-gradient"
          value={
            <>
              {dashboardData.itemsCounter}{' '}
              <span className="fs-6 fw-normal">
                {/* Adjust the percentage and arrow based on your data */}
                (20% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title={t('Jumlah Barang')}
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
                <CDropdownItem>{t('Tambah Barang')}</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            dashboardData.itemsChartData?.labels?.length > 0 && dashboardData.itemsChartData?.data?.length > 0 ? (
              <CChartLine
                ref={widgetChartRef1}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: dashboardData.itemsChartData?.labels || [],
                  datasets: [
                    {
                      label: 'Barang',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-primary'),
                      data: dashboardData.itemsChartData?.data || [],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 0,
                      max: 150,
                      display: false,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 1,
                      tension: 0.4,
                    },
                    point: {
                      radius: 4,
                      hitRadius: 10,
                      hoverRadius: 4,
                    },
                  },
                }}
              />
            ) : null
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info-gradient"
          value={
            <>
              {dashboardData.minimumStock}{' '}
              <span className="fs-6 fw-normal">
                {/* Adjust the percentage and arrow based on your data */}
                (-10% <CIcon icon={cilArrowBottom} />)
              </span>
            </>
          }
          title={t('Stok Mencapai Minimum')}
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
                <CDropdownItem>{t('Tambah Stok')}</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            dashboardData.stockChartData?.labels?.length > 0 && dashboardData.stockChartData?.data?.length > 0 ? (
              <CChartLine
                ref={widgetChartRef2}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: dashboardData.stockChartData?.labels || [],
                  datasets: [
                    {
                      label: 'Stok Minimum',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-info'),
                      data: dashboardData.stockChartData?.data || [],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 0,
                      max: 30,
                      display: false,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 1,
                    },
                    point: {
                      radius: 4,
                      hitRadius: 10,
                      hoverRadius: 4,
                    },
                  },
                }}
              />
            ) : null
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning-gradient"
          value={
            <>
              {dashboardData.latestIncomingItems}{' '}
              <span className="fs-6 fw-normal">
                {/* Adjust the percentage and arrow based on your data */}
                (5% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title={t('Barang Masuk Bulan September')}
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
                <CDropdownItem>{t('Tambah Barang Masuk')}</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            dashboardData.incomingItemsChartData?.labels?.length > 0 && dashboardData.incomingItemsChartData?.data?.length > 0 ? (
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: dashboardData.incomingItemsChartData?.labels || [],
                  datasets: [
                    {
                      label: 'Barang Masuk',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-warning'),
                      data: dashboardData.incomingItemsChartData?.data || [],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 0,
                      max: 200,
                      display: false,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 1,
                    },
                    point: {
                      radius: 4,
                      hitRadius: 10,
                      hoverRadius: 4,
                    },
                  },
                }}
              />
            ) : null
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger-gradient"
          value={
            <>
              {dashboardData.latestSales}{' '}
              <span className="fs-6 fw-normal">
                {/* Adjust the percentage and arrow based on your data */}
                (10% <CIcon icon={cilArrowTop} />)
              </span>
            </>
          }
          title={t('Penjualan Bulan September')}
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
                <CDropdownItem>{t('Tambah Penjualan')}</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            dashboardData.salesChartData?.labels?.length > 0 && dashboardData.salesChartData?.data?.length > 0 ? (
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: dashboardData.salesChartData?.labels || [],
                  datasets: [
                    {
                      label: 'Penjualan',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-danger'),
                      data: dashboardData.salesChartData?.data || [],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: {
                        display: false,
                      },
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      min: 0,
                      max: 100,
                      display: false,
                      grid: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 1,
                    },
                    point: {
                      radius: 4,
                      hitRadius: 10,
                      hoverRadius: 4,
                    },
                  },
                }}
              />
            ) : null
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown

// const WidgetsDropdown = (props) => {
//   const { t } = useTranslation()
//   const widgetChartRef1 = useRef(null)
//   const widgetChartRef2 = useRef(null)

//   useEffect(() => {
//     document.documentElement.addEventListener('ColorSchemeChange', () => {
//       if (widgetChartRef1.current) {
//         setTimeout(() => {
//           widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
//           widgetChartRef1.current.update()
//         })
//       }

//       if (widgetChartRef2.current) {
//         setTimeout(() => {
//           widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
//           widgetChartRef2.current.update()
//         })
//       }
//     })
//   }, [widgetChartRef1, widgetChartRef2])

//   return (
//     <CRow className={props.className} xs={{ gutter: 4 }}>
//       <CCol sm={6} xl={4} xxl={3}>
//         <CWidgetStatsA
//           color="primary-gradient"
//           value={
//             <>
//               120{' '}
//               <span className="fs-6 fw-normal">
//                 (20% <CIcon icon={cilArrowTop} />)
//               </span>
//             </>
//           }
//           title={t('Jumlah Barang')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
//                 <CDropdownItem>{t('Tambah Barang')}</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               ref={widgetChartRef1}
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
//                 datasets: [
//                   {
//                     label: 'Barang',
//                     backgroundColor: 'transparent',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     pointBackgroundColor: getStyle('--cui-primary'),
//                     data: [30, 50, 80, 100, 120, 110, 130],
//                   },
//                 ],
//               }}
//               options={{
//                 plugins: {
//                   legend: {
//                     display: false,
//                   },
//                 },
//                 maintainAspectRatio: false,
//                 scales: {
//                   x: {
//                     border: {
//                       display: false,
//                     },
//                     grid: {
//                       display: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
//                   },
//                   y: {
//                     min: 0,
//                     max: 150,
//                     display: false,
//                     grid: {
//                       display: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
//                   },
//                 },
//                 elements: {
//                   line: {
//                     borderWidth: 1,
//                     tension: 0.4,
//                   },
//                   point: {
//                     radius: 4,
//                     hitRadius: 10,
//                     hoverRadius: 4,
//                   },
//                 },
//               }}
//             />
//           }
//         />
//       </CCol>
//       <CCol sm={6} xl={4} xxl={3}>
//         <CWidgetStatsA
//           color="info-gradient"
//           value={
//             <>
//               15{' '}
//               <span className="fs-6 fw-normal">
//                 (-10% <CIcon icon={cilArrowBottom} />)
//               </span>
//             </>
//           }
//           title={t('Stok Mencapai Minimum')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
//                 <CDropdownItem>{t('Tambah Stok')}</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               ref={widgetChartRef2}
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
//                 datasets: [
//                   {
//                     label: 'Stok Minimum',
//                     backgroundColor: 'transparent',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     pointBackgroundColor: getStyle('--cui-info'),
//                     data: [25, 20, 18, 15, 13, 10, 15],
//                   },
//                 ],
//               }}
//               options={{
//                 plugins: {
//                   legend: {
//                     display: false,
//                   },
//                 },
//                 maintainAspectRatio: false,
//                 scales: {
//                   x: {
//                     border: {
//                       display: false,
//                     },
//                     grid: {
//                       display: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
//                   },
//                   y: {
//                     min: 0,
//                     max: 30,
//                     display: false,
//                     grid: {
//                       display: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
//                   },
//                 },
//                 elements: {
//                   line: {
//                     borderWidth: 1,
//                   },
//                   point: {
//                     radius: 4,
//                     hitRadius: 10,
//                     hoverRadius: 4,
//                   },
//                 },
//               }}
//             />
//           }
//         />
//       </CCol>
//       <CCol sm={6} xl={4} xxl={3}>
//         <CWidgetStatsA
//           color="warning-gradient"
//           value={
//             <>
//               500{' '}
//               <span className="fs-6 fw-normal">
//                 (5% <CIcon icon={cilArrowTop} />)
//               </span>
//             </>
//           }
//           title={t('Barang Masuk Bulan September')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
//                 <CDropdownItem>{t('Tambah Barang Masuk')}</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               className="mt-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
//                 datasets: [
//                   {
//                     label: 'Barang Masuk',
//                     backgroundColor: 'rgba(255,255,255,.2)',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     data: [450, 470, 490, 500, 510, 520, 500],
//                     fill: true,
//                   },
//                 ],
//               }}
//               options={{
//                 plugins: {
//                   legend: {
//                     display: false,
//                   },
//                 },
//                 maintainAspectRatio: false,
//                 scales: {
//                   x: {
//                     display: false,
//                   },
//                   y: {
//                     display: false,
//                   },
//                 },
//                 elements: {
//                   line: {
//                     borderWidth: 2,
//                     tension: 0.4,
//                   },
//                   point: {
//                     radius: 0,
//                     hitRadius: 10,
//                     hoverRadius: 4,
//                   },
//                 },
//               }}
//             />
//           }
//         />
//       </CCol>
//       <CCol sm={6} xl={4} xxl={3}>
//         <CWidgetStatsA
//           color="danger-gradient"
//           value={
//             <>
//               700{' '}
//               <span className="fs-6 fw-normal">
//                 (8% <CIcon icon={cilArrowTop} />)
//               </span>
//             </>
//           }
//           title={t('Penjualan Bulan September')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('Lihat Detail')}</CDropdownItem>
//                 <CDropdownItem>{t('Tambah Penjualan')}</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartBar
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
//                 datasets: [
//                   {
//                     label: 'Penjualan',
//                     backgroundColor: 'rgba(255,255,255,.2)',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     data: [600, 650, 670, 700, 720, 730, 700],
//                     barPercentage: 0.6,
//                   },
//                 ],
//               }}
//               options={{
//                 maintainAspectRatio: false,
//                 plugins: {
//                   legend: {
//                     display: false,
//                   },
//                 },
//                 scales: {
//                   x: {
//                     display: false,
//                   },
//                   y: {
//                     display: false,
//                   },
//                 },
//               }}
//             />
//           }
//         />
//       </CCol>
//     </CRow>
//   )
// }

// WidgetsDropdown.propTypes = {
//   className: PropTypes.string,
// }

// export default WidgetsDropdown
