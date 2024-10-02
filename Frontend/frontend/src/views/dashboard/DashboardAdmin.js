import { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import {
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CRow,
  CProgress,
  CButton,
  CButtonGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react-pro';
import {
  CChartBar,
} from '@coreui/react-chartjs'

import WidgetsDropdownAdmin from '../widgets/WidgetsDropdownAdmin';
import MainChart from './MainChart';

const Dashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState({
    itemsCounter: 0,
    minimumStock: 0,
    latestIncomingItems: 0,
    latestSales: 0,
    salesTraffic: {
      salesPerMonth: [],
      topSellingProducts: [],
      topSellingBrands: [],
    },
  });
  const [selectedYear, setSelectedYear] = useState(2024); // Tahun default


  useEffect(() => {
    axios.get('/api/dashboard-admin')
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

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  }

  return (
    <>
      <WidgetsDropdownAdmin className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
          <CCol sm={5}>
            <h4 id="traffic" className="card-title mb-0">
              {t('Traffic Transaction')}
            </h4>
            <div className="small text-body-secondary">
              {t('date', {
                date: new Date(2024, 0, 1), // Januari
                formatParams: {
                  date: {
                    month: 'long', // Menampilkan nama bulan saja
                  },
                },
              })}{' '}
              -{' '}
              {t('date', {
                date: new Date(2024, 11, 1), // Desember
                formatParams: {
                  date: {
                    month: 'long', // Menampilkan nama bulan saja
                  },
                },
              })}
            </div>
          </CCol>


            {/* <CCol sm={7} class  Name="d-none d-md-block">
              <CButtonGroup className="float-end me-3">
                {/* {[t('day'), t('month'), t('year')].map((value, index) => (
                {[t('year')].map((value, index) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={index === 1}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol> */}

            <CCol sm={7} className="d-none d-md-block">
            <CDropdown className="float-end me-3" size="sm">
              <CDropdownToggle color="outline-secondary">
                {selectedYear} {/* Tahun yang sedang dipilih ditampilkan */}
              </CDropdownToggle >
              <CDropdownMenu>
                {[2023, 2024].map((year) => (
                  <CDropdownItem
                    key={year}
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CCol>
          </CRow>
          {/* <MainChart /> */}
          <MainChart selectedYear={selectedYear} />
        </CCardBody>
        {/* <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
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
        </CCardFooter> */}
      </CCard>

      {/* <CCard className="mb-4">
          <CCardHeader>Bar Chart</CCardHeader>
          <CCardBody>
            <CChartBar
              data={{
                labels: ['Casio', 'Fossil', 'Vancos', 'Fusso', 'brand5'],
                datasets: [
                  {
                    label: 'Brand Product',
                    backgroundColor: '#36A2EB',
                    data: [40, 20, 12, 39, 10, 40, 39, 80, 40],
                  },
                ],
              }}
              labels="months"
            />
          </CCardBody>
        </CCard> */}
    </>
  );
};

export default Dashboard;
