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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:3000/api/admin/products',  {
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

  const handleEdit = (barang) => {
    setSelectedBarang(barang);
    setFormValues({
      product_name: barang.product_name,
      brand: barang.brand,
      type: barang.type,
      stock: barang.stock,
      price: barang.price,
      image: barang.image, // Reset image to null for form
    });
    console.log(`handle edit: ${barang.image}`)
    setPreviewImage(barang.image ? `http://localhost:3000/${barang.image}` : null);
    setEditVisible(true);
  };

  const handleAdd = () => {
    setFormValues({
      product_name: '',
      brand: '',
      type: '',
      stock: '',
      price: '',
      image: null,
    });
    setPreviewImage(null);
    setAddVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBarang || !selectedBarang.id_product) {
      console.error("No selectedBarang or ID missing");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('product_name', formValues.product_name);
      formData.append('brand', formValues.brand);
      formData.append('type', formValues.type);
      formData.append('stock', formValues.stock);
      formData.append('price', formValues.price);
      formData.append('image', formValues.image);

      console.log(`new: ${formValues.image} | existing: ${selectedBarang.image}`)

      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:3000/api/admin/products/${selectedBarang.id_product}`, formData, {
          // { headers: { 'Content-Type': 'multipart/form-data' } }

          headers: { Authorization: `${token}` },
          withCredentials: true,
        });

      // Jika berhasil, tampilkan alert sukses
      showAlert('Product successfully updated!', 'light');

      fetchData();
      setEditVisible(false);
      setSelectedBarang(null);
    } catch (error) {
      // Jika gagal, tampilkan alert gagal
      showAlert('Failed to update product!', 'danger');
      console.error('Error updating data:', error.response ? error.response.data : error.message);
    }
  };

  const handleAddNew = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    // Pastikan ada data pada form
    if (!formValues.product_name || !formValues.brand || !formValues.type || !formValues.stock || !formValues.price) {
      setValidated(true);
      return;
    }

    setValidated(true);

    try {
      const formData = new FormData();
      formData.append('product_name', formValues.product_name);
      formData.append('brand', formValues.brand);
      formData.append('type', formValues.type);
      formData.append('stock', formValues.stock);
      formData.append('price', formValues.price); 
      if (formValues.image) {
        formData.append('image', formValues.image);
      }
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:3000/api/admin/products/add', formData, {
        headers: { Authorization: `${token}` },
        withCredentials: true
      });

      // Jika berhasil, tampilkan alert sukses
      showAlert('Product successfully Added!', 'light');

      fetchData();
      setAddVisible(false);

      setFormValues({
        product_name: '',
        brand: '',
        type: '',
        stock: '',
        price: '',
        image: null,
      });

    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Jika produk sudah ada
        showAlert('Product already exists.', 'danger');
      } else {
        // Jika gagal menambahkan produk
        showAlert('Failed to add product!', 'danger');
      }
  
      // Reset form setelah error
      setAddVisible(false);
      console.error('Error adding data:', error.response ? error.response.data : error.message);
    }
  };

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
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
      if (file.size > maxSizeInBytes) {
        alert(`Ukuran file terlalu besar. Maksimal ${maxSizeInMB} MB.`);
      } else {
        setFormValues({ ...formValues, image: file });
        setPreviewImage(URL.createObjectURL(file));
      }
    }
  };
  
  
  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setFormValues({ ...formValues, image: file });
  //     setPreviewImage(URL.createObjectURL(file));
  //   }
  // };
// 
  const handleDelete = async (barang) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        background: '#343a40',
        color: '#fff',
      });

      if (result.isConfirmed) {

        const token = localStorage.getItem('token');

        await axios.delete(`http://localhost:3000/api/admin/products/${barang.id_product}`,  {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });
        fetchData();

        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success',
          {
            background: '#343a40',
            color: '#fff',
          }
        );
      }
    } catch (error) {
      console.error('Error deleting data:', error.response ? error.response.data : error.message);
    }
  };

  const columns =[
    { key: 'product_code', label: 'Kode Barang' },
    { key: 'product_name', label: 'Nama Barang' },
    { key: 'brand', label: 'Merk' },
    { key: 'price', label: 'Harga' },
    {
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
      <div className="mb-3">
        {alert.visible && (
          <CAlert color={alert.color} onClose={() => setAlert({ ...alert, visible: false })} className="w-100">
            {alert.message}
          </CAlert>
        )}
        <div className="d-flex justify-content-between align-items-center">
          <CButton
            color="primary"
            size="sm"
            shape="rounded-pill"
            className="float-end"
            onClick={handleAdd}
          >
            Tambah Barang
          </CButton>
        </div>
      </div>
        <CCard>
          <CCardHeader>Data Barang</CCardHeader>
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
              // columnFilter
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
                      onClick={() => handleShowDetail(item)}
                    >
                      Detail
                    </CButton>{' '}
                    <CButton
                      color="warning"
                      size="sm"
                      shape="rounded-pill"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </CButton>{' '}
                    <CButton
                      color="danger"
                      size="sm"
                      shape="rounded-pill"
                      onClick={() => handleDelete(item)}
                    >
                      Hapus
                    </CButton>
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
              <CModalTitle>Detail Barang</CModalTitle>
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
                      Kode Barang
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
                      Nama Barang
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
                      Merk
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="brand"
                      value={selectedBarang.brand}
                      readOnly
                      plainText
                    />
                  </div>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="type" className="col-form-label">
                      Tipe
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
                      Stok
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
                      Harga
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="price"
                      value={selectedBarang.price}
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


      <CModal alignment="center" visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Barang</CModalTitle>
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
                <CFormInput
                  id="product_code"
                  type="text"
                  value={selectedBarang?.product_code || ''}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_name" className="col-form-label">
                  Nama Barang
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                
                <CFormInput
                  id="product_name"
                  placeholder="Nama Barang"
                  value={formValues.product_name}
                  onChange={(e) => setFormValues({ ...formValues, product_name: e.target.value })}
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
                  placeholder="Merk"
                  value={formValues.brand}
                  onChange={(e) => setFormValues({ ...formValues, brand: e.target.value })}
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
                  placeholder="Tipe"
                  value={formValues.type}
                  onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="stock" className="col-form-label">
                  Stok
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="stock"
                  placeholder="Stok"
                  type="number"
                  value={formValues.stock}
                  onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
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
                  placeholder="Harga"
                  type="number"
                  value={formValues.price}
                  onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="image" className="col-form-label">
                  Gambar
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
              {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                )}
                <CFormInput
                  id="image"
                  type="file"
                  name="image"
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                />

              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveEdit}>Save changes</CButton>
        </CModalFooter>
      </CModal>



      <CModal alignment="center" visible={addVisible} onClose={() => setAddVisible(false)}>
        <CModalHeader>
          <CModalTitle>Tambah Barang</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleAddNew}>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="product_name" className="col-form-label">
                  Nama Barang
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="product_name"
                  placeholder="Nama Barang"
                  value={formValues.product_name}
                  onChange={(e) => setFormValues({ ...formValues, product_name: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Nama Barang is required.</CFormFeedback>
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
                  placeholder="Merk"
                  value={formValues.brand}
                  onChange={(e) => setFormValues({ ...formValues, brand: e.target.value })}
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
                  placeholder="Tipe"
                  value={formValues.type}
                  onChange={(e) => setFormValues({ ...formValues, type: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Tipe is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="stock" className="col-form-label">
                  Stok
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="stock"
                  placeholder="Stok"
                  type="number"
                  value={formValues.stock}
                  onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Stok is required.</CFormFeedback>
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
                  placeholder="Harga"
                  type="number"
                  value={formValues.price}
                  onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Harga is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="image" className="col-form-label">
                  Gambar
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="image"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                  required
                />
                <CFormFeedback invalid>Gambar is required.</CFormFeedback>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px' }}
                  />
                )}
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleAddNew}>Save changes</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default DataBarang;
