import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CMultiSelect,
  CAlert
} from '@coreui/react-pro'
import { CSmartTable } from '@coreui/react-pro'
import {
  cilCheckCircle,
  cilWarning,
  cilInfo,
  cilXCircle,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';


const Stok = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [formValues, setFormValues] = useState({
    product_code: '',
    product_name: '',
    id_brand: '',
    brand_name: '',
    type: '',
    price: '',
    stock: 0,
  })
  const [validated, setValidated] = useState(false)
  const [brands, setBrands] = useState([])
  const [totalStock, setTotalStock] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' })

  const showAlert = (message, color) => {
    setAlert({
      visible: true,
      message,
      color
    });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
    // untuk memilih ikon alert sesuai warna
    const getIcon = (color) => {
      switch (color) {
        case 'success':
          return <CIcon icon={cilCheckCircle} className="flex-shrink-0 me-2" width={24} height={24} />;
        case 'danger':
          return <CIcon icon={cilXCircle} className="flex-shrink-0 me-2" width={24} height={24} />;
        case 'warning':
          return <CIcon icon={cilWarning} className="flex-shrink-0 me-2" width={24} height={24} />;
        case 'info':
          return <CIcon icon={cilInfo} className="flex-shrink-0 me-2" width={24} height={24} />;
        default:
          return null;
      }
    };

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await axios.get('/api/admin/products/stock', {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      })

      setData(response.data)

      console.log('setttt', response.data)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, // Set to 0 if you don't want decimals
    }).format(value);
  };

  useEffect(() => {
    fetchData()
  }, [])

  const fetchTotalStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/stock/total', {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      });
      setTotalStock(response.data.totalStock);
      setTotalAmount(response.data.amount);

    } catch (error) {
      console.error('Error fetching total stock:', error);
    }
  };

  useEffect(() => {
    fetchTotalStock();
  }, []);

  useEffect(() => {
  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/brands', {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      });

      // Simpan data brands ke dalam state
      setBrands(response.data);
      console.log('Fetched brands:', response.data);  // Log untuk debugging
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  fetchBrands();
}, []);

  const columns = [
    { key: 'product_code', label: 'Product Code', _style: { width: '20%' } },
    { key: 'product_name', label: 'Product Name', _style: { width: '30%' } },
    { key: 'brand_name', label: 'Brand', _style: { width: '20%' } }, // Tampilkan nama merk
    // { key: 'type', label: 'Type', _style: { width: '20%' } },
    { key: 'price', label: 'Price', _style: { width: '20%' } },
    { key: 'stock', label: 'Stock', _style: { width: '10%' } },
  ]

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return <div className="text-center">Error: {error.message}</div>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <div className="mb-3">
        {alert.visible && (
              <CAlert
                color={alert.color}
                onClose={() => setAlert({ ...alert, visible: false })}
                className="w-500 d-flex align-items-center"
              >
                {getIcon(alert.color)}
                <div>{alert.message}</div>
              </CAlert>
            )}
          {/* <p>Product Stock Table</p> */}
        </div>
        <CCard className="mb-4">
        <CCardHeader>
          <span>Stock: {totalStock}</span>
          <span style={{ margin: '0 10px' }}>||</span>
          <span>Amount: {formatCurrency(totalAmount)}</span>
        </CCardHeader>
          <CCardBody>
            <CSmartTable
              clickableRows
              tableProps={{
                striped: true,
                hover: true,
              }}
              activePage={1}
              footer
              items={data}
              columns={columns}
              columnFilter
              tableFilter
              cleaner
              itemsPerPageSelect
              itemsPerPage={5}
              columnSorter
              pagination
              scopedColumns={{
                price: (item) => (
                  <td>{formatCurrency(item.price)}</td>
                ),
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}
export default Stok
