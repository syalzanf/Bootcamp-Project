
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    const navigate = useNavigate();

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
  

    // Filter data by date range
    const filteredData = formattedTransactions.filter(item => {
      const itemDate = new Date(item.transaction_date);
      return (
          (!startDate || itemDate >= startDate) &&
          (!endDate || itemDate <= endDate)
      );
  });

    const columns = [
        { key: 'transaction_date', label: 'Date',  _render: (item) => new Date(item.date).toDateString() },
        { key: 'transaction_code', label: 'Transaction Code' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'member', label: 'Customer' },
        { key: 'product_code', label: 'Kode Barang' },
        { key: 'product_name', label: 'Nama Barang' },
        { key: 'qty', label: 'Qty' },
        { key: 'price', label: 'Harga' },
        { key: 'totalItems', label: 'Total' },
    ];


    return (
      <CRow>
      <CCol>
        <CCard>
            <CCardHeader>
                <p>Laporan Penjualan</p>
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