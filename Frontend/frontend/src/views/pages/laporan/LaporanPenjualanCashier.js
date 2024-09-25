import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CRow,
  CCol
} from '@coreui/react-pro';

const TransactionReport = () => {
    const today = new Date(); // Mendapatkan tanggal saat ini
    const [transactions, setTransactions] = useState([]);
    const [totalSales, setTotalSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null); // Inisialisasi start date ke null
    const [endDate, setEndDate] = useState(null);     // Inisialisasi end date ke null

    useEffect(() => {
      const fetchTransactions = async () => {
        setLoading(true); // Set loading ke true saat mulai fetch
        try {
            const token = localStorage.getItem('token');
            const cashierName = localStorage.getItem('userName');
    
            if (!cashierName) {
                throw new Error('cashierName is not available in localStorage');
            }
    
            // Siapkan parameter untuk request
            const params = {};
    
            // Cek apakah startDate dan endDate ada
            if (startDate && endDate) {
                console.log('Fetching transactions for:', startDate, endDate); // Log debugging
                params.startDate = startDate.toISOString(); // Kirim dalam format yang diperlukan
                
                // Atur endDate ke akhir hari
                const adjustedEndDate = new Date(endDate);
                adjustedEndDate.setHours(23, 59, 59, 999); // Set ke akhir hari
                params.endDate = adjustedEndDate.toISOString(); // Kirim dalam format yang diperlukan
            }
    
            const response = await axios.get(`/api/cashier/laporanTransaksi/${cashierName}`, {
                headers: { Authorization: `${token}` },
                params, // Kirim parameter yang sudah disiapkan
            });
    
            // Tangani transaksi yang kosong
            if (response.data.transactions && response.data.transactions.length === 0) {
                setTransactions([]); 
                setTotalSales(0); 
            } else {
                setTransactions(response.data.transactions);
                setTotalSales(response.data.totalSales);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err); // Log error yang lebih baik
            setError('Error fetching transactions');
        } finally {
            setLoading(false); // Set loading ke false di blok finally
        }
    };
      
        fetchTransactions(); // Panggil fungsi fetch
     }, [startDate, endDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Format transaksi untuk ditampilkan
    const formattedTransactions = transactions.flatMap(transaction => {
        return transaction.items.map(item => ({
            transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
            transaction_code: transaction.transaction_code,
            member: transaction.member,
            cashier: transaction.cashier,
            product_code: item.product_code,
            product_name: item.product_name,
            brand: item.brand,
            type: item.type,
            qty: item.qty,
            price: item.price,
            totalItems: item.totalItems
        }));
    });

    const columns = [
        { key: 'transaction_date', label: 'Date' },
        { key: 'transaction_code', label: 'Transaction Code' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'member', label: 'Customer' },
        { key: 'product_code', label: 'Product Code' },
        { key: 'product_name', label: 'Product Name' },
        { key: 'qty', label: 'Qty' },
        { key: 'price', label: 'Price' },
        { key: 'totalItems', label: 'Total' },
    ];

    return (
        <CRow>
            <CCol>
                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">
                        <p className="mb-0">Transaction Report</p>
                        {totalSales !== null && <p className="mb-0">Total Sales: {totalSales}</p>}
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="row">
                            <CCol lg={5}>
                                <div>
                                    <label>Start Date:</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => {
                                            setStartDate(date);
                                            console.log('Start Date selected:', date);
                                        }}
                                        selectsStart
                                        startDate={startDate}
                                        endDate={endDate}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select start date"
                                    />
                                </div>
                                <div>
                                    <label>End Date:</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => {
                                            setEndDate(date);
                                            console.log('End Date selected:', date);
                                        }}
                                        selectsEnd
                                        startDate={startDate}
                                        endDate={endDate}
                                        minDate={startDate}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select end date"
                                    />
                                </div>
                            </CCol>
                        </CRow>
                        <CSmartTable
                            clickableRows
                            tableProps={{
                                striped: true,
                                hover: true,
                            }}
                            activePage={1}
                            items={formattedTransactions}
                            columns={columns}
                            columnFilter
                            tableFilter
                            cleaner
                            itemsPerPageSelect
                            itemsPerPage={5}
                            columnSorter
                            pagination
                        />
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default TransactionReport;


// import React, { useEffect, useState } from 'react';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import axios from 'axios';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CSmartTable,
//   CRow,
//   CCol
// } from '@coreui/react-pro';

// const TransactionReport = () => {
//     const today = new Date(); // Get current date
//     const [transactions, setTransactions] = useState([]);
//     const [totalSales, setTotalSales] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [startDate, setStartDate] = useState(today); // Initialize start date to today
//     const [endDate, setEndDate] = useState(today);     // Initialize end date to today

//     useEffect(() => {
//         const fetchTransactions = async () => {
//             setLoading(true); // Set loading to true when starting fetch
//             try {
//                 const token = localStorage.getItem('token');
//                 const cashierName = localStorage.getItem('userName');

//                 if (!cashierName) {
//                     throw new Error('cashierName is not available in localStorage');
//                 }

//                 // Check if dateRange has valid dates
//                 if (startDate && endDate) {
//                     console.log('Fetching transactions for:', startDate, endDate); // Debugging log
//                     const response = await axios.get(`/api/cashier/laporanTransaksi/${cashierName}`, {
//                         headers: { Authorization: `${token}` },
//                         params: {
//                             startDate: startDate.toISOString(), // Send in required format
//                             endDate: endDate.toISOString(),     // Send in required format
//                         }
//                     });

//                     // Handle empty transactions
//                     if (response.data.transactions && response.data.transactions.length === 0) {
//                         setTransactions([]); 
//                         setTotalSales(0); 
//                     } else {
//                         setTransactions(response.data.transactions);
//                         setTotalSales(response.data.totalSales);
//                     }
//                 } else {
//                     // Reset transactions if no valid date range
//                     setTransactions([]);
//                     setTotalSales(0);
//                 }
//             } catch (err) {
//                 console.error('Error fetching transactions:', err); // Improved error logging
//                 setError('Error fetching transactions');
//             } finally {
//                 setLoading(false); // Set loading to false in finally block
//             }
//         };

//         fetchTransactions(); // Call the fetch function
//      }, [startDate, endDate]);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }

//     // Format transactions for display
//     const formattedTransactions = transactions.flatMap(transaction => {
//         return transaction.items.map(item => ({
//             transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
//             transaction_code: transaction.transaction_code,
//             member: transaction.member,
//             cashier: transaction.cashier,
//             product_code: item.product_code,
//             product_name: item.product_name,
//             brand: item.brand,
//             type: item.type,
//             qty: item.qty,
//             price: item.price,
//             totalItems: item.totalItems
//         }));
//     });

//     const columns = [
//         { key: 'transaction_date', label: 'Date' },
//         { key: 'transaction_code', label: 'Transaction Code' },
//         { key: 'cashier', label: 'Cashier' },
//         { key: 'member', label: 'Customer' },
//         { key: 'product_code', label: 'Product Code' },
//         { key: 'product_name', label: 'Product Name' },
//         { key: 'qty', label: 'Qty' },
//         { key: 'price', label: 'Price' },
//         { key: 'totalItems', label: 'Total' },
//     ];

//     return (
//         <CRow>
//             <CCol>
//                 <CCard>
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                         <p className="mb-0">Transaction Report</p>
//                         {totalSales !== null && <p className="mb-0">Total Sales: {totalSales}</p>}
//                     </CCardHeader>
//                     <CCardBody>
//                         <CRow className="row">
//                             <CCol lg={5}>
//                             <div>
//                                     <label>Start Date:</label>
//                                     <DatePicker
//                                         selected={startDate}
//                                         onChange={(date) => {
//                                             setStartDate(date);
//                                             console.log('Start Date selected:', date);
//                                         }}
//                                         selectsStart
//                                         startDate={startDate}
//                                         endDate={endDate}
//                                         dateFormat="yyyy-MM-dd"
//                                         placeholderText="Select start date"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label>End Date:</label>
//                                     <DatePicker
//                                         selected={endDate}
//                                         onChange={(date) => {
//                                             setEndDate(date);
//                                             console.log('End Date selected:', date);
//                                         }}
//                                         selectsEnd
//                                         startDate={startDate}
//                                         endDate={endDate}
//                                         minDate={startDate}
//                                         dateFormat="yyyy-MM-dd"
//                                         placeholderText="Select end date"
//                                     />
//                                 </div>
//                             </CCol>
//                         </CRow>
//                         <CSmartTable
//                             clickableRows
//                             tableProps={{
//                                 striped: true,
//                                 hover: true,
//                             }}
//                             activePage={1}
//                             items={formattedTransactions}
//                             columns={columns}
//                             columnFilter
//                             tableFilter
//                             cleaner
//                             itemsPerPageSelect
//                             itemsPerPage={5}
//                             columnSorter
//                             pagination
//                         />
//                     </CCardBody>
//                 </CCard>
//             </CCol>
//         </CRow>
//     );
// };

// export default TransactionReport;
