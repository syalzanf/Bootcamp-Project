import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CRow,
  CCol,
} from '@coreui/react-pro';
import '../../../scss/_custom.scss';

const TransactionReport = () => {
    const today = new Date(); 
    const [transactions, setTransactions] = useState([]);
    const [totalSales, setTotalSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(null); // Awalnya null
    const [endDate, setEndDate] = useState(null); // Awalnya null
  
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');

                // Siapkan parameter untuk request
                const params = {};
                
                // Cek apakah startDate dan endDate ada
                if (startDate && endDate) {
                    console.log('Fetching transactions for:', startDate, endDate);
                    // Sesuaikan endDate agar inklusif
                    const adjustedEndDate = new Date(endDate);
                    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1); // Tambah satu hari

                    params.startDate = startDate.toISOString(); 
                    params.endDate = adjustedEndDate.toISOString(); // Gunakan end date yang sudah disesuaikan
                }

                const response = await axios.get('/api/admin/reportTransactions', {
                    headers: { Authorization: `${token}` },
                    params,
                    withCredentials: true,
                });

                if (response.data.transactions && response.data.transactions.length === 0) {
                    setTransactions([]); 
                    setTotalSales(0); 
                } else {
                    setTransactions(response.data.transactions);
                    setTotalSales(response.data.totalSales);
                }
            } catch (err) {
                setError('Error fetching transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [startDate, endDate]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

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
                        <p className="mb-0">Laporan Transaksi</p>
                        {totalSales && <p className="mb-0">Total Penjualan: {totalSales}</p>}
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
// import axios from 'axios';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CSmartTable,
//   CButton,
//   CRow,
//   CCol,


// } from '@coreui/react-pro';
// const TransactionReport = () => {
//     const today = new Date(); 
//     const [transactions, setTransactions] = useState([]);
//     const [totalSales, setTotalSales] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [startDate, setStartDate] = useState(today);
//     const [endDate, setEndDate] = useState(today); 
  
//     useEffect(() => {
//         const fetchTransactions = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const cashierName = localStorage.getItem('userName');

//                 if (!cashierName) {
//                   throw new Error('cashierName is not available in localStorage');
//               }

//               if (startDate && endDate) {
//                 console.log('Fetching transactions for:', startDate, endDate);
//                 const response = await axios.get('/api/admin/reportTransactions', {
//                   headers: { Authorization: `${token}` },
//                   params: {
//                     startDate: startDate.toISOString(), 
//                     endDate: endDate.toISOString(), 
//                   },
//                     withCredentials: true,
//                 });
//                 if (response.data.transactions && response.data.transactions.length === 0) {
//                   setTransactions([]); 
//                   setTotalSales(0); 
//                   } else {
//                       setTransactions(response.data.transactions);
//                       setTotalSales(response.data.totalSales);
//                   }
//               } else {
//                   setTransactions([]);
//                   setTotalSales(0);
//               }
//             } catch (err) {
//                 setError('Error fetching transactions');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTransactions();
//     }, [startDate, endDate]);

//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>{error}</div>;
//     }

//     const formattedTransactions = transactions.flatMap(transaction => {
//       return transaction.items.map(item => ({
//         transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
//         transaction_code: transaction.transaction_code,
//         member: transaction.member,
//         // member: transaction.member ? transaction.member.nama : 'Guest',  // Jika member tidak ada, gunakan 'Guest'
//         cashier: transaction.cashier,
//         product_code: item.product_code,
//         product_name: item.product_name,
//         brand: item.brand,
//         type: item.type,
//         qty: item.qty,
//         price: item.price,
//         totalItems: item.totalItems
//     }));
//   })

//     const columns = [
//         { key: 'transaction_date', label: 'Date',  _render: (item) => new Date(item.date).toDateString() },
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
//   <CRow>
//       <CCol>
//         <CCard>
//           <CCardHeader className="d-flex justify-content-between align-items-center">
//               <p className="mb-0">Transaction Report</p>
//               {totalSales && <p className="mb-0">Total Sales: {totalSales}</p>}
//             </CCardHeader>
//             <CCardBody>
//             <CRow className="row">
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
//                 <CSmartTable
//                     clickableRows
//                     tableProps={{
//                       striped: true,
//                       hover: true,
//                     }}
//                     activePage={1}
//                     // footer
//                     items={formattedTransactions}
//                     columns={columns}
//                     columnFilter
//                     tableFilter
//                     cleaner
//                     itemsPerPageSelect
//                     itemsPerPage={5}
//                     columnSorter
//                     pagination
//                     scopedColumns={{
//                     }}
//                 />
//             </CCardBody>
//         </CCard>

//       </CCol>
//       </CRow>
//     );
// };

// export default TransactionReport;