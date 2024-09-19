
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CButton,
  CRow,
  CCol,


} from '@coreui/react-pro';
const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [totalSales, setTotalSales] = useState(null);
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

                const response = await axios.get('/api/admin/reportTransactions', {
                  headers: { Authorization: `${token}` },
                    withCredentials: true,
                });
                setTransactions(response.data.transactions);
                setTotalSales(response.data.totalSales);
                
                console.log('TRANSAKSI', response.data)
                console.log('TESTTT', response.items)

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

    const formattedTransactions = transactions.flatMap(transaction => {
      return transaction.items.map(item => ({
        transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
        transaction_code: transaction.transaction_code,
        member: transaction.member,
        // member: transaction.member ? transaction.member.nama : 'Guest',  // Jika member tidak ada, gunakan 'Guest'
        cashier: transaction.cashier,
        product_code: item.product_code,
        product_name: item.product_name,
        brand: item.brand,
        type: item.type,
        qty: item.qty,
        price: item.price,
        totalItems: item.totalItems
    }));
  })

    const columns = [
        { key: 'transaction_date', label: 'Date',  _render: (item) => new Date(item.date).toDateString() },
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
              {totalSales && <p className="mb-0">Total Sales: {totalSales}</p>}
            </CCardHeader>
            <CCardBody>
                <CSmartTable
                    clickableRows
                    tableProps={{
                      striped: true,
                      hover: true,
                    }}
                    activePage={1}
                    // footer
                    items={formattedTransactions}
                    columns={columns}
                    columnFilter
                    tableFilter
                    cleaner
                    itemsPerPageSelect
                    itemsPerPage={5}
                    columnSorter
                    pagination
                    scopedColumns={{
                    }}
                />
            </CCardBody>
        </CCard>

      </CCol>
      </CRow>
    );
};

export default TransactionReport;