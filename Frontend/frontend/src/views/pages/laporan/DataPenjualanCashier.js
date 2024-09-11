import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CButton,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,

} from '@coreui/react-pro';
import DatePicker from 'react-datepicker';
const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedDetails, setSelectedDetails] = useState([])
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);  



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
         
                // console.log('CEKKK', response.data);

            } catch (err) {
                setError('Error fetching transactions');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);
   
    const handleDetail = (transactionCode) => {
      const transaction = transactions.find(t => t.transaction_code === transactionCode);
      if (transaction) {
          setSelectedDetails(transaction.items); 
          setModalVisible(true);
      }
  };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const filteredData = transactions.filter(item => {
      const itemDate = new Date(item.date);
      return (
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)
      );
    });

    const columns = [
          { 
            key: 'transaction_date', 
            label: 'Date',
            _render: (item) => new Date(item.transaction_date).toLocaleDateString()
          },
        { key: 'transaction_code', label: 'Transaction Code' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'member', label: 'Customer' },
        { key: 'total', label: 'Total' },
        { key: 'payment', label: 'Payment' },
        { key: 'change', label: 'Change' },
        {
          key: 'actions',
          label: '',
          _props: { className: 'text-center' },
          filter: false,
          sorter: false,
        },
    ];

  //   const formattedTransactions = transactions.map(transaction => {
  //     const details = transaction.items.map(item => ({
  //       transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
  //       transaction_code: transaction.transaction_code,
  //       member: transaction.member,
  //       cashier: transaction.cashier,
  //       product_code: item.product_code,
  //       product_name: item.product_name,
  //       brand: item.brand,
  //       type: item.type,
  //       qty: item.qty,
  //       price: item.price
  //     }));

  //     return transaction.items.map(item => ({
  //         transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
  //         transaction_code: transaction.transaction_code,
  //         member: transaction.member,
  //         cashier: transaction.cashier,
  //         total: transaction.total,
  //         // total : item.price * item.qty,
  //         payment: transaction.payment,
  //         change: transaction.change,
  //         product_code: item.product_code,
  //         product_name: item.product_name,
  //         brand: item.brand,
  //         type: item.type,
  //         qty: item.qty,
  //         price: item.price,
  //         detail: details,
  //     }));
  // }).flat();

    return (
      <CRow>
      <CCol>
        <CCard>
            <CCardHeader>
                <p>Data Penjualan</p>
            </CCardHeader>
            <CCardBody>
              {/* <div>
                <label>Select Date Range:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                />
              </div> */}
                <CSmartTable
                    clickableRows
                    tableProps={{
                      striped: true,
                      hover: true,
                    }}
                    activePage={1}
                    footer
                    items={transactions}
                    columns={columns}
                    columnFilter
                    tableFilter
                    cleaner
                    itemsPerPageSelect
                    itemsPerPage={5}
                    columnSorter
                    pagination
                    scopedColumns={{
                      actions: (item) => (
                        <td className="text-center">
                          <CButton
                            color="info"
                            size="sm"
                            shape="rounded-pill"
                            onClick={() => handleDetail(item.transaction_code)}
                          >
                            Detail
                          </CButton>
                        </td>
                      ),
                    }}
                />
            </CCardBody>
        </CCard>
        
        <CModal alignment="center" size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detail Transaksi</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable>
            <CTableHead>
              <CTableRow>
                {/* <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Transaction Code</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Cashier</CTableHeaderCell> */}
                <CTableHeaderCell>Kode Produk</CTableHeaderCell>
                <CTableHeaderCell>Nama Produk</CTableHeaderCell>
                <CTableHeaderCell>Brand</CTableHeaderCell>
                <CTableHeaderCell>Tipe</CTableHeaderCell>
                <CTableHeaderCell>Qty</CTableHeaderCell>
                <CTableHeaderCell>Harga</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {Array.isArray (selectedDetails) && selectedDetails.map((detail, index) => (
                <CTableRow key={index}>
                  {/* <CTableDataCell>{new Date(detail.transaction_date).toLocaleDateString()}</CTableDataCell> */}
                  {/* <CTableDataCell>{detail.transaction_date}</CTableDataCell>
                  <CTableDataCell>{detail.transaction_code}</CTableDataCell>
                  <CTableDataCell>{detail.member}</CTableDataCell>
                  <CTableDataCell>{detail.cashier}</CTableDataCell> */}
                  <CTableDataCell>{detail.product_code}</CTableDataCell>
                  <CTableDataCell>{detail.product_name}</CTableDataCell>
                  <CTableDataCell>{detail.brand}</CTableDataCell>
                  <CTableDataCell>{detail.type}</CTableDataCell>
                  <CTableDataCell>{detail.qty}</CTableDataCell>
                  <CTableDataCell>{detail.price}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      </CCol>   
      </CRow>
    );
};

export default TransactionReport;
