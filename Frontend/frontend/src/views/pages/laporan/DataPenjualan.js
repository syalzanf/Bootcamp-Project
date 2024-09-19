import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSmartTable,
  CButton,
  CCollapse,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react-pro';
import '../../../scss/_custom.scss';

const TransactionReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/reportTransactions', {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        });
        setTransactions(response.data.transactions);
        console.log('cekkk', response.data)
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
    { key: 'transaction_date', label: 'Transaction Date' },
    { key: 'transaction_code', label: 'Transaction Code' },
    { key: 'member', label: 'Customer' },
    { key: 'cashier', label: 'Cashier' },
    { key: 'total', label: 'Total' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'payment', label: 'Payment' },
    { key: 'change', label: 'Change' },
    // {
    //   key: 'show_details',
    //   label: '',
    //   _style: { width: '1%' },
    //   filter: false,
    //   sorter: false,
    // },
    {
      key: 'actions',
      label: 'Actions',
      _props: { className: 'text-center' },
      filter: false,
      sorter: false,
    },
  ];

  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  }

  const handleDetail = (item) => {
    // console.log('Selected Item:', item); 
    setSelectedTransaction(item);
    setModalVisible(true);
  };

  const formattedTransactions = transactions.map(transaction => ({
    transaction_date: new Date(transaction.transaction_date).toLocaleDateString(),
    transaction_code: transaction.transaction_code,
    member: transaction.member,
    cashier: transaction.cashier,
    total: transaction.total,
    payment_method: transaction.payment_method,
    payment: transaction.payment,
    change: transaction.change,
    items: transaction.items,
    // detail: transaction.items.map(item =>
    //   `${item.product_code} - ${item.product_name} - ${item.brand_name} - ${item.type} - ${item.qty} - ${item.price}`
    // ).join(', '),
  }));

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader className="">
            <p>Transaction Report</p>
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
                actions: (item) => (
                  <td className="text-center">
                    <CButton
                      color="primary"
                      size="sm"
                      shape="square"
                      onClick={() => handleDetail(item)}
                    >
                      Details
                    </CButton>{' '}
                  </td>
                ),
                // show_details: (item) => (
                //   <td className="py-2">
                //     <CButton
                //       color="primary"
                //       variant="outline"
                //       shape="square"
                //       size="sm"
                //       onClick={() => toggleDetails(item.transaction_code)}
                //     >
                //       {details.includes(item.transaction_code) ? 'Hide' : 'Show'}
                //     </CButton>
                //   </td>
                // ),
                details: (item) => (
                  <CCollapse visible={details.includes(item.transaction_code)}>
                    <CCardBody>
                      <CTable striped hover>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>product Code</CTableHeaderCell>
                            <CTableHeaderCell>Product Name</CTableHeaderCell>
                            <CTableHeaderCell>Brand</CTableHeaderCell>
                            <CTableHeaderCell>Type</CTableHeaderCell>
                            <CTableHeaderCell>Qty</CTableHeaderCell>
                            <CTableHeaderCell>Price</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {item.items && item.items.map((detailItem, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{detailItem.product_code}</CTableDataCell>
                              <CTableDataCell>{detailItem.product_name}</CTableDataCell>
                              <CTableDataCell>{detailItem.brand_name}</CTableDataCell>
                              <CTableDataCell>{detailItem.type}</CTableDataCell>
                              <CTableDataCell>{detailItem.qty}</CTableDataCell>
                              <CTableDataCell>{detailItem.price}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCollapse>                
                ),
              }}
            />
          </CCardBody>
        </CCard>

        {/* Modal for detailed transaction information */}
        <CModal alignment="center" size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Items Transaction Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedTransaction && (
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Kode Produk</CTableHeaderCell>
                    <CTableHeaderCell>Nama Produk</CTableHeaderCell>
                    <CTableHeaderCell>Brand</CTableHeaderCell>
                    <CTableHeaderCell>Tipe</CTableHeaderCell>
                    <CTableHeaderCell>Qty</CTableHeaderCell>
                    <CTableHeaderCell>Harga</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {Array.isArray(selectedTransaction.items) && selectedTransaction.items.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.product_code}</CTableDataCell>
                      <CTableDataCell>{item.product_name}</CTableDataCell>
                      <CTableDataCell>{item.brand_name}</CTableDataCell>
                      <CTableDataCell>{item.type}</CTableDataCell>
                      <CTableDataCell>{item.qty}</CTableDataCell>
                      <CTableDataCell>{item.price}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
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
