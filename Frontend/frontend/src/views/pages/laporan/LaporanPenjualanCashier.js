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

                const response = await axios.get(`/api/cashier/laporanTransaksi/${cashierName}`, {
                  headers: { Authorization: `${token}` },
                  withCredentials: true,
                });

                // Menghandle jika transaksi kosong
                if (response.data.transactions && response.data.transactions.length === 0) {
                  setTransactions([]); // Set transactions ke array kosong
                  setTotalSales(0); // Set total sales ke 0 jika tidak ada transaksi
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
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Mengubah transaksi menjadi format yang dapat ditampilkan
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
