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
  CMultiSelect,
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

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:3000/api/admin/products/stock',  {
        headers: { Authorization: `${token}` },
        withCredentials: true
      });

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
        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:3000/api/admin/products/${selectedCode}`,  {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });
        
        const product = response.data
        setFormValues({
          ...formValues,
          product_code: product.product_code,
          product_name: product.product_name,
          brand: product.brand,
          type: product.type,
          stock: product.stock,
          price: product.price,
        })
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    }
  }

  // Handle form submission to add stock
  const handleSubmit = async () => {
    const newStock = Number(formValues.stock)
    if (isNaN(newStock) || newStock <= 0) {
      console.error('Invalid stock value')
      return
    }

    try {
      const token = localStorage.getItem('token');
      const productCode = formValues.product_code;


      await axios.post(`http://localhost:3000/api/admin/products/stock/${formValues.product_code}`, {
      formValues,
      stock: newStock, 
      },
      {
        headers: { Authorization: `${token}` },
        withCredentials: true,
      })
   

      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Error adding stock:', error.response ? error.response.data : error.message)
    }
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
      <CModal alignment="center" visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add Stock</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
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
                />
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
                />
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
                />
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
                  // value={formValues.stock}
                  onChange={handleChange}
                  min="0"
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="price" className="col-form-label">
                  Harga
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="price"
                  name="price"
                  value={formValues.price}
                  readOnly
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Save
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Stok
