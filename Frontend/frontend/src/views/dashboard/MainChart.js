import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CChartLine } from '@coreui/react-chartjs';
import { getStyle } from '@coreui/utils';
import axios from 'axios';



const MainChart = ({ selectedYear }) => {
  const { t } = useTranslation();
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

   // Array of month names
   const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/dashboard-admin/transactions/${selectedYear}`);
        const { transactions } = response.data; 
        // const response = await axios.get('/api/dashboard-admin'); // Your API endpoint
        //const { getMonthlyTransactions } = response.data; // Adjust based on your API structure

        // Assuming getMonthlyTransactions is structured correctly
        // if (!transactions) {
          // throw new Error("No transactions found");
        // }
        
        const labels = transactions.map(item => monthNames[item.month - 1]); // Assuming month is 1-indexed
        const data = transactions.map(item => item.total_transactions); // Assuming `total_transactions` is the value you want
        const dataProduct = transactions.map(item => item.total_products_sold); // Assuming `total_products_sold` is the value you want

        //const labels = getMonthlyTransactions.map(item => monthNames[item.month - 1]); // Assuming month is 1-indexed
        //const data = getMonthlyTransactions.map(item => item.total_transactions); // Assuming `total` is the value you want
        //const dataProduct = getMonthlyTransactions.map(item => item.total_products_sold); // Assuming `total` is the value you want

        setChartData({
          labels,
          datasets: [
            { 
              label: 'Transactions',
              backgroundColor: `rgba(${getStyle('--cui-warning-rgb')}, .1)`,
              borderColor: getStyle('--cui-warning'),
              pointHoverBackgroundColor: getStyle('--cui-warning'),
              borderWidth: 2,
              data,
              fill: true,
            },
            {
              label: 'Product Sold',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: dataProduct, 
              fill: true,
            }
          ],
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();

    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color');
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent');
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color');
          chartRef.current.update();
        });
      }
    });
  }, [chartRef,  selectedYear]);

  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              max: 150,
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                stepSize: Math.ceil(250 / 5),
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  );
};

export default MainChart;





// import React, { useEffect, useRef } from 'react'
// import { useTranslation } from 'react-i18next'

// import { CChartLine } from '@coreui/react-chartjs'
// import { getStyle } from '@coreui/utils'

// const MainChart = () => {
//   const { t } = useTranslation()
//   const chartRef = useRef(null)

//   useEffect(() => {
//     document.documentElement.addEventListener('ColorSchemeChange', () => {
//       if (chartRef.current) {
//         setTimeout(() => {
//           chartRef.current.options.scales.x.grid.borderColor = getStyle(
//             '--cui-border-color-translucent',
//           )
//           chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
//           chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
//           chartRef.current.options.scales.y.grid.borderColor = getStyle(
//             '--cui-border-color-translucent',
//           )
//           chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
//           chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
//           chartRef.current.update()
//         })
//       }
//     })
//   }, [chartRef])

//   const random = () => Math.round(Math.random() * 100)

//   return (
//     <>
//       <CChartLine
//         ref={chartRef}
//         style={{ height: '300px', marginTop: '40px' }}
//         data={{
//           labels: [
//             t('january'),
//             t('february'),
//             t('march'),
//             t('april'),
//             t('may'),
//             t('june'),
//             t('july'),
//           ],
//           datasets: [
//             {
//               label: 'My First dataset',
//               backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
//               borderColor: getStyle('--cui-info'),
//               pointHoverBackgroundColor: getStyle('--cui-info'),
//               borderWidth: 2,
//               data: [
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//               ],
//               fill: true,
//             },
//             {
//               label: 'My Second dataset',
//               backgroundColor: 'transparent',
//               borderColor: getStyle('--cui-success'),
//               pointHoverBackgroundColor: getStyle('--cui-success'),
//               borderWidth: 2,
//               data: [
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//                 random(50, 200),
//               ],
//             },
//             {
//               label: 'My Third dataset',
//               backgroundColor: 'transparent',
//               borderColor: getStyle('--cui-danger'),
//               pointHoverBackgroundColor: getStyle('--cui-danger'),
//               borderWidth: 1,
//               borderDash: [8, 5],
//               data: [65, 65, 65, 65, 65, 65, 65],
//             },
//           ],
//         }}
//         options={{
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               display: false,
//             },
//           },
//           scales: {
//             x: {
//               grid: {
//                 color: getStyle('--cui-border-color-translucent'),
//                 drawOnChartArea: false,
//               },
//               ticks: {
//                 color: getStyle('--cui-body-color'),
//               },
//             },
//             y: {
//               beginAtZero: true,
//               border: {
//                 color: getStyle('--cui-border-color-translucent'),
//               },
//               grid: {
//                 color: getStyle('--cui-border-color-translucent'),
//               },
//               max: 250,
//               ticks: {
//                 color: getStyle('--cui-body-color'),
//                 maxTicksLimit: 5,
//                 stepSize: Math.ceil(250 / 5),
//               },
//             },
//           },
//           elements: {
//             line: {
//               tension: 0.4,
//             },
//             point: {
//               radius: 0,
//               hitRadius: 10,
//               hoverRadius: 4,
//               hoverBorderWidth: 3,
//             },
//           },
//         }}
//       />
//     </>
//   )
// }

// export default MainChart;





// // import React, { useEffect, useRef, useState } from 'react'
// // import { useTranslation } from 'react-i18next'
// // import { CChartLine } from '@coreui/react-chartjs'
// // import { getStyle } from '@coreui/utils'
// // import axios from 'axios'

// // const MainChart = () => {
// //   const { t } = useTranslation()
// //   const chartRef = useRef(null)
// //   const [chartData, setChartData] = useState({
// //     labels: [],
// //     datasets: [
// //       {
// //         label: 'Transaction Count',
// //         backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
// //         borderColor: getStyle('--cui-info'),
// //         pointHoverBackgroundColor: getStyle('--cui-info'),
// //         borderWidth: 2,
// //         data: [],
// //         fill: true,
// //       },
// //       {
// //         label: 'Total Nominal',
// //         backgroundColor: 'transparent',
// //         borderColor: getStyle('--cui-success'),
// //         pointHoverBackgroundColor: getStyle('--cui-success'),
// //         borderWidth: 2,
// //         data: [],
// //       },
// //     ],
// //   })

// //   useEffect(() => {
// //     // Fetch data from API
// //     const fetchData = async () => {
// //       try {
// //         const response = await axios.get('/api/admin/transactions')
// //         const data = response.data

// //         // Process data to match the chart format
// //         const labels = data.map(item => item.month)
// //         const transactionCount = data.map(item => item.transaction_count)
// //         const totalNominal = data.map(item => item.total_nominal)

// //         // Update chart data state
// //         setChartData(prevData => ({
// //           ...prevData,
// //           labels: labels,
// //           datasets: [
// //             {
// //               ...prevData.datasets[0],
// //               data: transactionCount,
// //             },
// //             {
// //               ...prevData.datasets[1],
// //               data: totalNominal,
// //             },
// //           ],
// //         }))
// //       } catch (error) {
// //         console.error('Error fetching data:', error)
// //       }
// //     }

// //     fetchData()
// //   }, [])

// //   useEffect(() => {
// //     document.documentElement.addEventListener('ColorSchemeChange', () => {
// //       if (chartRef.current) {
// //         setTimeout(() => {
// //           chartRef.current.options.scales.x.grid.borderColor = getStyle(
// //             '--cui-border-color-translucent',
// //           )
// //           chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
// //           chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
// //           chartRef.current.options.scales.y.grid.borderColor = getStyle(
// //             '--cui-border-color-translucent',
// //           )
// //           chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
// //           chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
// //           chartRef.current.update()
// //         })
// //       }
// //     })
// //   }, [chartRef])

// //   return (
// //     <>
// //       <CChartLine
// //         ref={chartRef}
// //         style={{ height: '300px', marginTop: '40px' }}
// //         data={chartData}
// //         options={{
// //           maintainAspectRatio: false,
// //           plugins: {
// //             legend: {
// //               display: true, // Tampilkan legend untuk membedakan dataset
// //             },
// //           },
// //           scales: {
// //             x: {
// //               grid: {
// //                 color: getStyle('--cui-border-color-translucent'),
// //                 drawOnChartArea: false,
// //               },
// //               ticks: {
// //                 color: getStyle('--cui-body-color'),
// //               },
// //             },
// //             y: {
// //               beginAtZero: true,
// //               border: {
// //                 color: getStyle('--cui-border-color-translucent'),
// //               },
// //               grid: {
// //                 color: getStyle('--cui-border-color-translucent'),
// //               },
// //               max: Math.max(...chartData.datasets[0].data, ...chartData.datasets[1].data) * 1.1,
// //               ticks: {
// //                 color: getStyle('--cui-body-color'),
// //                 maxTicksLimit: 5,
// //                 stepSize: Math.ceil((Math.max(...chartData.datasets[0].data, ...chartData.datasets[1].data) * 1.1) / 5),
// //               },
// //             },
// //           },
// //           elements: {
// //             line: {
// //               tension: 0.4,
// //             },
// //             point: {
// //               radius: 0,
// //               hitRadius: 10,
// //               hoverRadius: 4,
// //               hoverBorderWidth: 3,
// //             },
// //           },
// //         }}
// //       />
// //     </>
// //   )
// // }

// // export default MainChart




