import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    id_brand: '',
    type: '',
    stock: '',
    price: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });
  const [showFeedback, setShowFeedback] = useState(false)
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();


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

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/admin/brands', {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });
        if (Array.isArray(response.data)) {
          setBrands(response.data);
        } else {
          console.error('Data format is not an array:', response.data);
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error.response ? error.response.data : error.message);
      }
    };

    fetchBrands();
  }, []);


  const formatNumber = (value) => {
    return value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });
  };

  const handleShowDetail = (barang) => {
    setSelectedBarang(barang);
    setVisible(true);
  };

  // const handleEdit = (barang) => {
  //   console.log('Editing barang:', barang);
  //   setSelectedBarang(barang);
  //   setFormValues({
  //     product_name: barang.product_name,
  //     id_brand: brands.find((brand) => brand.name === barang.brand_name)?.id_brand || '', // Menyusun id_brand dari brand_name
  //     type: barang.type,
  //     stock: barang.stock,
  //     price: barang.price,
  //     image: barang.image, // Reset image to null for form
  //   });
  //   console.log('Form Values after edit:', formValues);
  //   console.log(`handle edit: ${barang.image}`)
  //   setPreviewImage(barang.image ? `http://localhost:3000/${barang.image}` : null);
  //   setEditVisible(true);
  // };

  const handleEdit = (barang) => {
    // console.log('Editing barang:', barang);

    const idBrand = brands.find((brand) => brand.brand_name === barang.brand_name)?.id_brand || '';

    setSelectedBarang(barang);
    setFormValues({
      product_name: barang.product_name || '',
      id_brand: idBrand,  // set id_brand
      type: barang.type || '',
      stock: barang.stock || '',
      price: barang.price || '',
      image: barang.image || null,
    });

    console.log('Form Values after edit:', {
      product_name: barang.product_name || '',
      id_brand: idBrand,
      type: barang.type || '',
      stock: barang.stock || '',
      price: barang.price || '',
      image: barang.image || null,
    });

    setPreviewImage(barang.image ? `http://localhost:3000/${barang.image}` : null);
    setEditVisible(true);
  };

  const handleBrand = () => {
    navigate('/brand'); // navigasi ke halaman brand
  };


  const handleAdd = () => {
    setFormValues({
      product_name: '',
      id_brand: '',
      type: '',
      stock: '',
      price: '',
      image: null,
    });
    setPreviewImage(null);
    setAddVisible(true);
  };

  // const handleSaveEdit = async   () => {
  //   if (!selectedBarang || !selectedBarang.id_product) {
  //     console.error("No selectedBarang or ID missing");
  //     return;
  //   }

  //   if (!formValues.product_name || !formValues.brand || !formValues.type || !formValues.stock || !formValues.price || !formValues.image ) {
  //     setValidated(true);
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     formData.append('product_name', formValues.product_name);
  //     formData.append('brand', formValues.brand);
  //     formData.append('type', formValues.type);
  //     formData.append('stock', formValues.stock);
  //     formData.append('price', formValues.price);
  //     formData.append('image', formValues.image);

  //     console.log(`new: ${formValues.image} | existing: ${selectedBarang.image}`)

  //     const token = localStorage.getItem('token');

  //     await axios.put(
  //       `http://localhost:3000/api/admin/products/${selectedBarang.id_product}`, formData, {
  //         // { headers: { 'Content-Type': 'multipart/form-data' } }

  //         headers: { Authorization: `${token}`,
  //         'Content-Type': 'multipart/form-data'
  //       },
  //         withCredentials: true,
  //       });

  //     // Jika berhasil, tampilkan alert sukses
  //     showAlert('Product successfully updated!', 'light');

  //     fetchData();
  //     setEditVisible(false);
  //     setSelectedBarang(null);
  //   } catch (error) {
  //     // Jika gagal, tampilkan alert gagal
  //     showAlert('Failed to update product!', 'danger');
  //     console.error('Error updating data:', error.response ? error.response.data : error.message);
  //   }
  // };

  const handleSaveEdit = async () => {
    if (!selectedBarang || !selectedBarang.id_product) {
      console.error("No selectedBarang or ID missing");
      return;
    }

    if (!formValues.product_name || !formValues.id_brand || !formValues.type || !formValues.stock || !formValues.price) {
      setValidated(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('product_name', formValues.product_name);
      formData.append('id_brand', formValues.id_brand);
      formData.append('type', formValues.type);
      formData.append('stock', formValues.stock);
      formData.append('price', formValues.price);
      if (formValues.image) {
        formData.append('image', formValues.image);
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/products/${selectedBarang.id_product}`,
        formData,
        {
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      showAlert('Product successfully updated!', 'light');
      fetchData();
      setEditVisible(false);
      setSelectedBarang(null);
    } catch (error) {
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

    setValidated(true);

    try {
      const formData = new FormData();
      formData.append('product_name', formValues.product_name);
      formData.append('id_brand', formValues.id_brand);
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

      showAlert('Product successfully Added!', 'light');
      fetchData();
      setAddVisible(false);

      setFormValues({
        product_name: '',
        id_brand: '',
        type: '',
        stock: '',
        price: '',
        image: null,
      });

    } catch (error) {
      if (error.response && error.response.status === 400) {
        showAlert('Product already exists.', 'danger');
      } else {
        showAlert('Failed to add product!', 'danger');
      }
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
    console.log('Selected File:', file);

    if (file) {
        const maxSizeInMB = 1;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        if (file.size > maxSizeInBytes) {
            showAlert(`Ukuran file terlalu besar. Maksimal ${maxSizeInMB} MB.`, 'warning');
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
    { key: 'brand_name', label: 'Merk' },
    {
      key: 'price',
      label: 'Harga',
      // fungsi format harga
      sorter: false,
      filter: false,
      render: (item) => formatNumber( item.price)
     },
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
            // className="float-end"
            className="me-2"
            onClick={handleAdd}
          >
            Tambah Barang
          </CButton>
          {/* <CButton
            color="primary"
            size="sm"
            shape="rounded-pill"
            // className="float-end"
            onClick={handleBrand}
          >
            Brand
          </CButton> */}
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

      <CModal alignment="center" visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Barang</CModalTitle>
        </CModalHeader>
        <CModalBody>

          <CForm noValidate validated={validated} onSubmit={handleSaveEdit}>
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
                  required
                />
                <CFormFeedback invalid>Nama Barang is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                  Merk
                <CFormLabel htmlFor="id_brand" className="col-form-label">
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
              <select
                  className="form-control"
                  id="id_brand"
                  value={formValues.id_brand || ''}
                  onChange={(e) => setFormValues({ ...formValues, id_brand: e.target.value })}

                >
                {/* <option value="">Pilih Merk</option>   */}
                  {brands.map((brand) => (
                    <option key={brand.id_brand} value={brand.id_brand}>
                       {brand.brand_name}
                    </option>
                  ))}
                </select>
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
                  // value={formValues.image}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  required
                />
              <CFormFeedback invalid>Gambar is required.</CFormFeedback>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveEdit}>Save changes</CButton>
        </CModalFooter>
      </CModal>




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
                    <CFormLabel htmlFor="id_brand" className="col-form-label">
                      Merk
                    </CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                  <div className="d-flex align-items-center">
                    <span className="me-2">:</span>
                    <CFormInput
                      id="id_brand"
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
                  Merk
                <CFormLabel htmlFor="id_brand" className="col-form-label">
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
              <select
                  className="form-control"
                  id="id_brand"
                  value={formValues.id_brand}
                  onChange={(e) => setFormValues({ ...formValues, id_brand: e.target.value })}

                >
                <option value="" disabled>Pilih Merk</option>
                  {brands.map((brand) => (
                    <option key={brand.id_brand} value={brand.id_brand}>
                       {brand.brand_name}
                    </option>
                  ))}
                </select>
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
                  type="text"
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
