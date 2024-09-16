import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CButton,
  CCollapse,
} from '@coreui/react-pro';
import '../../../scss/_custom.scss';


const TransactionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([])


  useEffect(() => {
      const fetchTransactions = async () => {
          try {
              const token = localStorage.getItem('token');
              const response = await axios.get('http://localhost:3000/api/admin/reportTransactions', {
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
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'payment', label: 'Payment' },
      { key: 'change', label: 'Change' },
      // { key: 'items', label: 'Items' },
      {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        filter: false,
        sorter: false,
      },
  ];

  const toggleDetails = (index) => {
    const position = details.indexOf(index)
    let newDetails = details.slice()
    if (position !== -1) {
      newDetails.splice(position, 1)
    } else {
      newDetails = [...details, index]
    }
    setDetails(newDetails)
  }

  const formattedTransactions = transactions.map(transaction => ({
    transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
    transaction_code: transaction.transaction_code,
      member: transaction.member,
      cashier: transaction.cashier,
      total: transaction.total,
      payment_method: transaction.payment_method,
      payment: transaction.payment,
      change: transaction.change,
      detail: transaction.items.map(item =>
          `${item.product_code} - ${item.product_name} - ${item.id_brand} - ${item.type} - ${item.qty} - ${item.price}`
      ).join(', '),
  }));

  return (
      <CCard>
          <CCardHeader className="">
              <p>Laporan Penjualan</p>
          </CCardHeader>

          <CCardBody>
              <CSmartTable

                  clickableRows
                  tableProps={{
                    striped: true,
                    hover: true
                   }}
                  items={formattedTransactions}
                  columns={columns}
                  columnSorter
                  pagination
                  tableFilter
                  columnFilter
                  cleaner
                  itemsPerPageSelect
                  itemsPerPage={5}
                  scopedColumns={{
                    show_details: (item) => {
                      return (
                        <td className="py-2">
                          <CButton
                            color="primary"
                            variant="outline"
                            shape="square"
                            size="sm"
                            onClick={() => {
                              toggleDetails(item.transaction_code)
                            }}
                          >
                            {details.includes(item.transaction_code) ? 'Hide' : 'Show'}
                          </CButton>
                          </td>
                      )
                    },
                    details: (item) => {
                      return (
                        <CCollapse visible={details.includes(item.transaction_code)}>
                          <CCardBody>
                            <p>{item.detail}</p>
                            {/* <p className="text-body-secondary">User since: {item.registered}</p>
                            <CButton size="sm" color="info">
                              User Settings
                            </CButton>
                            <CButton size="sm" color="danger" className="ml-1">
                              Delete
                            </CButton> */}
                          </CCardBody>
                        </CCollapse>
                      )
                    },
                  }}
              />
          </CCardBody>
      </CCard>
  );
};


export default TransactionReport;







