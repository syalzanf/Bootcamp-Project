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

  // Handle change in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    })
  }
  const handleProductCodeChange = async (selectedItems) => {
    const selectedCode = selectedItems[0]?.value || '';
    setFormValues({ ...formValues, product_code: selectedCode });

    if (selectedCode) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/admin/products/${selectedCode}`, {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        });

        const product = response.data;

        // Pastikan brands sudah terisi
        if (brands.length === 0) {
          console.error('Data brands masih kosong. Pastikan data sudah diambil.');
          return;
        }

        // Cari brand berdasarkan id_brand produk
        const selectedBrand = brands.find(brand => brand.id_brand === product.id_brand);
        const brandName = selectedBrand ? selectedBrand.brand_name : 'Merk tidak ditemukan';

        setFormValues({
          ...formValues,
          product_code: product.product_code,
          product_name: product.product_name,
          id_brand: product.id_brand,
          brand_name: brandName,
          type: product.type,
          stock: product.stock >= 0 ? product.stock : 0,
          price: product.price,
        });

        console.log('Product id_brand:', product.id_brand);
        console.log('Brands:', brands);
        console.log('Selected brand:', selectedBrand);

      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    }
  };


  // Handle form submission to add stock
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    // Pastikan ada data pada form
    if (!formValues.product_code || !formValues.product_name || !formValues.id_brand || !formValues.type || !formValues.stock || !formValues.price) {
      setValidated(true);
      return;
    }

    const newStock = Number(formValues.stock);
    if (isNaN(newStock) || newStock <= 0) {
      console.error('Invalid stock value');
      return;
    }

    setValidated(true);

    try {
      const token = localStorage.getItem('token');
      const productCode = formValues.product_code;

      await axios.post(`/api/admin/products/stock/${productCode}`, {
        formValues,
        stock: newStock,
      }, {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      });

      showAlert('Stock successfully Added!', 'success');

      setModalVisible(false);
      fetchData();
      fetchTotalStock();

    } catch (error) {
      console.error('Error adding stock:', error.response ? error.response.data : error.message);
    }
  };

  // Reset form values
  const resetForm = () => {
    setFormValues({
      product_code: '',
      product_name: '',
      id_brand: '',
      brand_name: '',
      type: '',
      price: '',
      stock: 0,
    })
    setValidated(false)
  }

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false)
    resetForm()
  }

  const options = data.map((item) => ({
    value: item.product_code,
    label: `${item.product_code} - ${item.product_name  }`,
  }))

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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <CButton
              color="primary"
              size="sm"
              // shape="rounded-pill"
              onClick={() => setModalVisible(true)}
            >
              Add Stock
            </CButton>
          </div>
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

      {/* Modal untuk menambah stok */}
      <CModal alignment="center" visible={modalVisible} onClose={handleModalClose}>
        <CModalHeader>
          <CModalTitle>Add Stock</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_code" className="col-form-label">
                  Product Code <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CMultiSelect
                  options={options}
                  optionsStyle="text"
                  multiple={false}
                  onChange={handleProductCodeChange}
                  value={options.find((option) => option.value === formValues.product_code)}
                  required
                />
                <CFormFeedback invalid>Product Name is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_name" className="col-form-label">
                  Product Name
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="product_name"
                  name="product_name"
                  value={formValues.product_name}
                  readOnly
                  required
                />
                <CFormFeedback invalid>Product Name is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="brand" className="col-form-label">
                  Brand
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="brand"
                  name="brand"
                  value={formValues.brand_name}
                  readOnly
                  required
                />
                <CFormFeedback invalid>Brand is required.</CFormFeedback>
              </CCol>
            </CRow>
            {/* <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="type" className="col-form-label">
                  Type
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="type"
                  name="type"
                  value={formValues.type}
                  readOnly
                  required
                />
                <CFormFeedback invalid>Type is required.</CFormFeedback>
              </CCol>
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="price" className="col-form-label">
                  Price 
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="price"
                  name="price"
                  type="number"
                  value={formValues.price}
                  readOnly
                  required
                />
                <CFormFeedback invalid>Price is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="stock" className="col-form-label">
                  Stock <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="stock"
                  name="stock"
                  type="number"
                  // value={formValues.stock}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Stock is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={handleModalClose}>
                Close
              </CButton>
              <CButton color="primary" type="submit">
                Save changes
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  )
}
export default Stok
