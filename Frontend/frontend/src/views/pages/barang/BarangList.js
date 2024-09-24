import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
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
  CSmartTable,
  CAlert
} from '@coreui/react-pro';
import '../../../scss/_custom.scss';


const DataBarang = () => {
  const [barangData, setBarangData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [validated, setValidated] = useState(false);

  const [formValues, setFormValues] = useState({
    product_name: '',
    brand: '',
    type: '',
    stock: '',
    price: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });
  const [showFeedback, setShowFeedback] = useState(false)


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('/api/admin/products',  {
        headers: { Authorization: `${token}` },
        withCredentials: true
      });
      if (Array.isArray(response.data)) {
        setBarangData(response.data);
      } else {
        console.error('Data format is not an array:', response.data);
        setBarangData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (barang) => {
    setSelectedBarang(barang);
    setVisible(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns =[
    { key: 'product_code', label: 'Product Code' },
    { key: 'product_name', label: 'Product Name' },
    { key: 'stock', label: 'Stock' },
    {
      key: 'price',
      label: 'Price',
      _cellProps: (item) => ({ children: formatCurrency(item.price) }),
     },    {
      key: 'actions',
      label: 'Actions',
      _props: { className: 'text-center' },
      filter: false,
      sorter: false,
    },
  ]

  if (loading) {
    return <div className="pt-3 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="pt-3 text-center">Error: {error.message}</div>;
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>Product Data</CCardHeader>
          <CCardBody>
          <CSmartTable
              clickableRows
              tableProps={{
                striped: true,
                hover: true,
              }}
              activePage={1}
              footer
              items={barangData}
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
                actions: (item) => (
                  <td className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      shape="rounded-pill"
                      onClick={() => handleShowDetail(item)}
                    >
                      Details
                    </CButton>{' '}
                  </td>
                ),
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>


        {/* Detail Modal */}
        {selectedBarang && (
          <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
            <CModalHeader>
              <CModalTitle>Product Details</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                {selectedBarang.image && (
                  <CRow className="mb-3">
                    <CCol className="text-center">
                      <img
                        src={`http://localhost:3000/${selectedBarang.image}`}
                        alt={selectedBarang.product_name}
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </CCol>
                  </CRow>
                )}
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="product_code" className="col-form-label">
                      Product Code
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="product_code"
                      value={selectedBarang.product_code}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="product_name" className="col-form-label">
                      Product Name
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="product_name"
                      value={selectedBarang.product_name}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="brand" className="col-form-label">
                      Brand
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="brand"
                      value={selectedBarang.brand_name}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="type" className="col-form-label">
                      Type
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="type"
                      value={selectedBarang.type}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="stock" className="col-form-label">
                      Stock
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="stock"
                      value={selectedBarang.stock}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="price" className="col-form-label">
                      Price
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="price"
                      value={formatCurrency(selectedBarang.price)}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
            </CModalFooter>
          </CModal>
        )}

    </CRow>
  );
};

export default DataBarang;
