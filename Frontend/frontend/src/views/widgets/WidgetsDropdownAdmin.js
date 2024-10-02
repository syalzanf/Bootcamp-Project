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
import { cilArrowBottom, cilArrowTop, cilOptions, cilMoney  } from '@coreui/icons'

const WidgetsDropdown = (props) => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    minimumStock: 0,
    latestIncomingItems: 0,
    latestSales: 0,
    getTotalUsers: 0,
    totalIncomePerMonth: 0,
    totalIncomePerYear: 0,
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
            {dashboardData.itemsCounter}{' '}
            <span className="fs-6 fw-normal">
              {/* Adjust the percentage and arrow based on your data */}
              {/* (20% <CIcon icon={cilArrowTop} />) */}
            </span>
          </>
        }
        title={t('Total Items')}  // Translated to English
        // action={
        //   <CDropdown alignment="end">
        //     <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
        //       <CIcon icon={cilOptions} />
        //     </CDropdownToggle>
        //     <CDropdownMenu>
        //       <CDropdownItem>{t('View Details')}</CDropdownItem>  // Translated to English
        //       <CDropdownItem>{t('Add Item')}</CDropdownItem>      // Translated to English
        //     </CDropdownMenu>
        //   </CDropdown>
        // }
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
                    label: 'Items',
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
              {/* (-10% <CIcon icon={cilArrowBottom} />) */}
            </span>
          </>
        }
        title={t('Minimum Stock')}  // Translated to English
        // action={
        //   <CDropdown alignment="end">
        //     <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
        //       <CIcon icon={cilOptions} />
        //     </CDropdownToggle>
        //     <CDropdownMenu>
        //       <CDropdownItem>{t('View Details')}</CDropdownItem>  // Translated to English
        //       <CDropdownItem>{t('Add Stock')}</CDropdownItem>      // Translated to English
        //     </CDropdownMenu>
        //   </CDropdown>
        // }
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
                    label: 'Minimum Stock',
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
              {/* (5% <CIcon icon={cilArrowTop} />) */}
            </span>
          </>
        }
        title={t('Items Incoming in September')}  // Translated to English
        // action={
        //       <CIcon icon={cilOptions} />
        // }
        chart={
          dashboardData.incomingItemsChartData?.labels?.length > 0 && dashboardData.incomingItemsChartData?.data?.length > 0 ? (
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: dashboardData.incomingItemsChartData?.labels || [],
                datasets: [
                  {
                    label: 'Incoming Items',
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
    {/* <CCol sm={6} xl={4} xxl={3}>
      <CWidgetStatsA
        color="danger-gradient"
        value={
          <>
            {dashboardData.latestSales}{' '}
            <span className="fs-6 fw-normal">
             
            </span>
          </>
        }
        title={t('Sales in September')}  // Translated to English
        // action={
        //   <CDropdown alignment="end">
        //     <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
        //       <CIcon icon={cilOptions} />
        //     </CDropdownToggle>
        //     <CDropdownMenu>
        //       <CDropdownItem>{t('View Details')}</CDropdownItem>  // Translated to English
        //       <CDropdownItem>{t('Add Sale')}</CDropdownItem>      // Translated to English
        //     </CDropdownMenu>
        //   </CDropdown>
        // }
        chart={
          dashboardData.salesChartData?.labels?.length > 0 && dashboardData.salesChartData?.data?.length > 0 ? (
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: dashboardData.salesChartData?.labels || [],
                datasets: [
                  {
                    label: 'Sales',
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
    </CCol> */}
    
    <CCol sm={6} xl={4} xxl={3}>
      
      <CWidgetStatsA
       color="success-gradient"
       value={
           <>
               <span style={{ fontSize: '1rem' }}>{dashboardData.totalIncomePerMonth}</span>{' '}
               <span className="separator"> | </span>
               <span style={{ fontSize: '1rem' }}>{dashboardData.totalIncomePerYear}</span>
           </>
        }
        title={t('Total Monthly And Yearly Income')}  // Translated to English
        // action={
        //       <CIcon icon={cilMoney} />
        // }
        chart={
          dashboardData.salesChartData?.labels?.length > 0 && dashboardData.salesChartData?.data?.length > 0 ? (
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: dashboardData.salesChartData?.labels || [],
                datasets: [
                  {
                    label: 'Sales',
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
  </CRow>

  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
