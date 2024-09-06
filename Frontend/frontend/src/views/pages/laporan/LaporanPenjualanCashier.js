// import React from 'react';
// import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';

// const Cashier = () => {
//   return (
//     <CRow>
//       <CCol>
//         <CCard>
//           <CCardHeader>
//           testtttttttttttttt
//           </CCardHeader>
//           <CCardBody>
//             {/* Tambahkan konten dashboard cashier di sini */}
//           </CCardBody>
//         </CCard>
//       </CCol>
//     </CRow>
//   );
// };

// export default Cashier;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
} from '@coreui/react-pro';

const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const cashierName = localStorage.getItem('userName');

                if (!cashierName) {
                  throw new Error('cashierName is not available in localStorage');
              }

                const response = await axios.get(`http://localhost:3000/api/cashier/laporanTransaksi/${cashierName}`, {
                  headers: { Authorization: `${token}` },
                    withCredentials: true,
                });
                setTransactions(response.data);
            } catch (err) {
                setError('Error fetching transactions');
            } finally {
                setLoading(false);
            }
        }; 

        fetchTransactions();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const columns = [
        { key: 'transaction_date', label: 'Date' },
        { key: 'transaction_code', label: 'Transaction Code' },
        { key: 'member', label: 'Customer' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'total', label: 'Total' },
        { key: 'payment', label: 'Payment' },
        { key: 'change', label: 'Change' },
        { key: 'items', label: 'Items' },
    ];

    const formattedTransactions = transactions.map(transaction => ({
        transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
        transaction_code: transaction.transaction_code,
        member: transaction.member,
        cashier: transaction.cashier,
        total: transaction.total,
        payment: transaction.payment,
        change: transaction.change,
        items: transaction.items.map(item => `${item.product_code} - ${item.product_name} - ${item.brand} - ${item.type} - ${item.qty} - ${item.price}`).join(', '),
    }));

    return (
        <CCard>
            <CCardHeader>
                <h1>Laporan Penjualan</h1>
            </CCardHeader>
            <CCardBody>
                <CSmartTable
                    clickableRows
                    items={formattedTransactions}
                    columns={columns}
                    columnFilter
                    tableFilter
                    cleaner
                    itemsPerPageSelect
                    itemsPerPage={5}
                    columnSorter
                    pagination
                    tableProps={{ striped: true, hover: true }}
                />
            </CCardBody>
        </CCard>
    );
};

export default TransactionReport;
