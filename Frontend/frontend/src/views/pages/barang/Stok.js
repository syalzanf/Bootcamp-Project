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

const Stok = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [formValues, setFormValues] = useState({
    product_code: '',
    product_name: '',
    brand: '',
    type: '',
    price: '',
    stock: 0,
  })
  const [validated, setValidated] = useState(false)
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });


  // Fetch data from the API
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await axios.get('http://localhost:3000/api/admin/products/stock', {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      })

      setData(response.data)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Handle change in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    })
  }

  // Handle product code change and fetch product details
  const handleProductCodeChange = async (selectedItems) => {
    const selectedCode = selectedItems[0]?.value || ''
    setFormValues({ ...formValues, product_code: selectedCode })

    if (selectedCode) {
      try {
        const token = localStorage.getItem('token')

        const response = await axios.get(`http://localhost:3000/api/admin/products/${selectedCode}`, {
          headers: { Authorization: `${token}` },
          withCredentials: true,
        })

        const product = response.data
        setFormValues({
          ...formValues,
          product_code: product.product_code,
          product_name: product.product_name,
          brand: product.brand,
          type: product.type,
          stock: product.stock >= 0 ? product.stock : 0,
          // stock: product.stock,
          price: product.price,
        })
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    }
  }

  // Handle form submission to add stock
  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }

    // Pastikan ada data pada form
    if (!formValues.product_code || !formValues.product_name || !formValues.brand || !formValues.type || !formValues.stock || !formValues.price) {
      setValidated(true)
      return
    }

    const newStock = Number(formValues.stock)
    if (isNaN(newStock) || newStock <= 0) {
      console.error('Invalid stock value')
      return
    }

    setValidated(true)

    try {
      const token = localStorage.getItem('token')
      const productCode = formValues.product_code

      await axios.post(`http://localhost:3000/api/admin/products/stock/${productCode}`, {
        formValues,
        stock: newStock,
      }, {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      })

      showAlert('Product successfully Added!', 'light');

      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Error adding stock:', error.response ? error.response.data : error.message)
    }
  }

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

  // Reset form values
  const resetForm = () => {
    setFormValues({
      product_code: '',
      product_name: '',
      brand: '',
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
    label: `${item.product_code} - ${item.product_name}`,
  }))

  const columns = [
    { key: 'product_code', label: 'Kode Barang', _style: { width: '20%' } },
    { key: 'product_name', label: 'Nama Barang', _style: { width: '30%' } },
    { key: 'brand', label: 'Merk', _style: { width: '20%' } },
    { key: 'type', label: 'Tipe', _style: { width: '20%' } },
    { key: 'stock', label: 'Stok', _style: { width: '10%' } },

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
          <CAlert color={alert.color} onClose={() => setAlert({ ...alert, visible: false })} className="w-100">
            {alert.message}
          </CAlert>
        )}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <CButton
            color="primary"
            size="sm"
            shape="rounded-pill"
            onClick={() => setModalVisible(true)}
          >
            Tambah Stok
          </CButton>
        </div>
      </div>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Product Stock Table</strong>
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
                  Kode Barang
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
                <CFormFeedback invalid>Kode Barang is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="brand" className="col-form-label">
                  Merk
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="brand"
                  name="brand"
                  value={formValues.brand}
                  readOnly
                  required
                />
                <CFormFeedback invalid>Merk is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="type" className="col-form-label">
                  Tipe
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
                <CFormFeedback invalid>Tipe is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="stock" className="col-form-label">
                  Stock
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="stock"
                  name="stock"
                  type="number"
                  onChange={handleChange}
                  min="0"
                  required
                />
                <CFormFeedback invalid>Stock is required.</CFormFeedback>
              </CCol>
            </CRow>
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
                  onChange={handleChange}
                  min="0"
                  required
                />
                <CFormFeedback invalid>Price is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={handleModalClose}>
                Close
              </CButton>
              <CButton type="submit" color="primary">
                Add Stock
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  )
}

export default Stok
