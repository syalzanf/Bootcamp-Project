// import React, { useEffect, useRef } from 'react'
// import { useTranslation } from 'react-i18next'
// import PropTypes from 'prop-types'

// import {
//   CRow,
//   CCol,
//   CDropdown,
//   CDropdownMenu,
//   CDropdownItem,
//   CDropdownToggle,
//   CWidgetStatsA,
// } from '@coreui/react-pro'
// import { getStyle } from '@coreui/utils'
// import { CChartBar, CChartLine } from '@coreui/react-chartjs'
// import CIcon from '@coreui/icons-react'
// import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

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
//               26K{' '}
//               <span className="fs-6 fw-normal">
//                 (-12.4% <CIcon icon={cilArrowBottom} />)
//               </span>
//             </>
//           }
//           title={t('users')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('action')}</CDropdownItem>
//                 <CDropdownItem>{t('anotherAction')}</CDropdownItem>
//                 <CDropdownItem>{t('somethingElseHere')}</CDropdownItem>
//                 <CDropdownItem disabled>{t('disabledAction')}</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               ref={widgetChartRef1}
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [
//                   t('january'),
//                   t('february'),
//                   t('march'),
//                   t('april'),
//                   t('may'),
//                   t('june'),
//                   t('july'),
//                 ],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'transparent',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     pointBackgroundColor: getStyle('--cui-primary'),
//                     data: [65, 59, 84, 84, 51, 55, 40],
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
//                     min: 30,
//                     max: 89,
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
//               $6.200{' '}
//               <span className="fs-6 fw-normal">
//                 (40.9% <CIcon icon={cilArrowTop} />)
//               </span>
//             </>
//           }
//           title={t('income')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('action')}</CDropdownItem>
//                 <CDropdownItem>{t('anotherAction')}</CDropdownItem>
//                 <CDropdownItem>{t('somethingElseHere')}</CDropdownItem>
//                 <CDropdownItem disabled>Disabled action</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               ref={widgetChartRef2}
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [
//                   t('january'),
//                   t('february'),
//                   t('march'),
//                   t('april'),
//                   t('may'),
//                   t('june'),
//                   t('july'),
//                 ],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'transparent',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     pointBackgroundColor: getStyle('--cui-info'),
//                     data: [1, 18, 9, 17, 34, 22, 11],
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
//                     min: -9,
//                     max: 39,
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
//               2.49%{' '}
//               <span className="fs-6 fw-normal">
//                 (84.7% <CIcon icon={cilArrowTop} />)
//               </span>
//             </>
//           }
//           title={t('conversionRate')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('action')}</CDropdownItem>
//                 <CDropdownItem>{t('anotherAction')}</CDropdownItem>
//                 <CDropdownItem>{t('somethingElseHere')}</CDropdownItem>
//                 <CDropdownItem disabled>Disabled action</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartLine
//               className="mt-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [
//                   t('january'),
//                   t('february'),
//                   t('march'),
//                   t('april'),
//                   t('may'),
//                   t('june'),
//                   t('july'),
//                 ],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'rgba(255,255,255,.2)',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     data: [78, 81, 80, 45, 34, 12, 40],
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
//               44K{' '}
//               <span className="fs-6 fw-normal">
//                 (-23.6% <CIcon icon={cilArrowBottom} />)
//               </span>
//             </>
//           }
//           title={t('sessions')}
//           action={
//             <CDropdown alignment="end">
//               <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
//                 <CIcon icon={cilOptions} />
//               </CDropdownToggle>
//               <CDropdownMenu>
//                 <CDropdownItem>{t('action')}</CDropdownItem>
//                 <CDropdownItem>{t('anotherAction')}</CDropdownItem>
//                 <CDropdownItem>{t('somethingElseHere')}</CDropdownItem>
//                 <CDropdownItem disabled>Disabled action</CDropdownItem>
//               </CDropdownMenu>
//             </CDropdown>
//           }
//           chart={
//             <CChartBar
//               className="mt-3 mx-3"
//               style={{ height: '70px' }}
//               data={{
//                 labels: [
//                   t('january'),
//                   t('february'),
//                   t('march'),
//                   t('april'),
//                   t('may'),
//                   t('june'),
//                   t('july'),
//                   t('august'),
//                   t('september'),
//                   t('october'),
//                   t('november'),
//                   t('december'),
//                   t('january'),
//                   t('february'),
//                   t('march'),
//                   t('april'),
//                 ],
//                 datasets: [
//                   {
//                     label: 'My First dataset',
//                     backgroundColor: 'rgba(255,255,255,.2)',
//                     borderColor: 'rgba(255,255,255,.55)',
//                     data: [78, 81, 80, 45, 34, 12, 40, 85, 65, 23, 12, 98, 34, 84, 67, 82],
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
//                     grid: {
//                       display: false,
//                       drawTicks: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
//                   },
//                   y: {
//                     border: {
//                       display: false,
//                     },
//                     grid: {
//                       display: false,
//                       drawTicks: false,
//                     },
//                     ticks: {
//                       display: false,
//                     },
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
//   withCharts: PropTypes.bool,
// }

// export default WidgetsDropdown



import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

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
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const WidgetsDropdown = (props) => {
  const { t } = useTranslation()
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="primary-gradient"
          value={
            <>
              120{' '}
              <span className="fs-6 fw-normal">
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
            <CChartLine
              ref={widgetChartRef1}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
                datasets: [
                  {
                    label: 'Barang',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-primary'),
                    data: [30, 50, 80, 100, 120, 110, 130],
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
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info-gradient"
          value={
            <>
              15{' '}
              <span className="fs-6 fw-normal">
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
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
                datasets: [
                  {
                    label: 'Stok Minimum',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: [25, 20, 18, 15, 13, 10, 15],
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
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning-gradient"
          value={
            <>
              500{' '}
              <span className="fs-6 fw-normal">
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
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
                datasets: [
                  {
                    label: 'Barang Masuk',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [450, 470, 490, 500, 510, 520, 500],
                    fill: true,
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
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
                elements: {
                  line: {
                    borderWidth: 2,
                    tension: 0.4,
                  },
                  point: {
                    radius: 0,
                    hitRadius: 10,
                    hoverRadius: 4,
                  },
                },
              }}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger-gradient"
          value={
            <>
              700{' '}
              <span className="fs-6 fw-normal">
                (8% <CIcon icon={cilArrowTop} />)
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
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: [t('jan'), t('feb'), t('mar'), t('apr'), t('mei'), t('jun'), t('jul')],
                datasets: [
                  {
                    label: 'Penjualan',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: [600, 650, 670, 700, 720, 730, 700],
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                  },
                },
              }}
            />
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
