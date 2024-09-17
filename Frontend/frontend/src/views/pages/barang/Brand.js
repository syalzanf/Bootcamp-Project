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

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [validated, setValidated] = useState(false);
  const [formValues, setFormValues] = useState({
    brand_name: '',
  });
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/brands', {
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
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      setError(error);
    } finally {
      setLoading(false);
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

  const handleAdd = () => {
    setFormValues({
      brand_name: '',
    });
    setAddVisible(true);
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
      const formData = {
        brand_name: formValues.brand_name,
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/brands/add', formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      setBrands([...brands, response.data]);

      showAlert('Brand successfully added!', 'light');
      setAddVisible(false);
      setFormValues({
        brand_name: '',
      });

    } catch (error) {
      if (error.response && error.response.status === 400) {
        showAlert('Brand already exists.', 'danger');
      } else {
        showAlert('Failed to add brand!', 'danger');
      }
      console.error('Error adding data:', error.response ? error.response.data : error.message);
    }
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormValues({
      brand_name: brand.brand_name || '',
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBrand || !selectedBrand.id_brand) {
      console.error("Brand atau ID tidak ditemukan");
      return;
    }

    if (!formValues.brand_name) {
      setValidated(true);
      return;
    }

    try {
      const formData = {
        brand_name: formValues.brand_name,
      };

      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/brands/edit/${selectedBrand.id_brand}`,
        formData,
        {
          headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true
        }
      );
      const updatedBrands = brands.map(brand =>
        brand.id_brand === selectedBrand.id_brand ? { ...brand, brand_name: formValues.brand_name } : brand
      );
      setBrands(updatedBrands);
  

      showAlert('Brand successfully updated!', 'light');
      // fetchBrands();
      setEditVisible(false);
      setSelectedBrand(null);
    } catch (error) {
      showAlert('Failed to update brand!', 'danger');
      console.error('Error updating data:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (brand) => {
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

        await axios.delete(`http://localhost:3000/api/brands/delete/${brand.id_brand}`, {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });
        fetchBrands();

        Swal.fire(
          'Deleted!',
          'The brand has been deleted.',
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

  const columns = [
    { key: 'brand_name', label: 'Nama Brand' },
    {
      key: 'actions',
      label: 'Actions',
      _props: { className: 'text-center' },
      filter: false,
      sorter: false,
    },
  ];

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
              className="me-2"
              onClick={handleAdd}
            >
              Tambah Brand
            </CButton>
          </div>
        </div>
        <CCard>
          <CCardHeader>Data Brand</CCardHeader>
          <CCardBody>
            <CSmartTable
              clickableRows
              tableProps={{
                striped: true,
                hover: true,
              }}
              activePage={1}
              footer
              items={brands}
              columns={columns}
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
          <CModalTitle>Edit Brand</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleSaveEdit}>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="brand_name" className="col-form-label">
                  Nama Brand
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="brand_name"
                  placeholder="Nama Brand"
                  value={formValues.brand_name}
                  onChange={(e) => setFormValues({ ...formValues, brand_name: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Brand name is required</CFormFeedback>
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setEditVisible(false)}>
                Close
              </CButton>
              <CButton type="submit" color="primary">
                Save Changes
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      <CModal alignment="center" visible={addVisible} onClose={() => setAddVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add Brand</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleAddNew}>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="brand_name" className="col-form-label">
                  Nama Brand
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="brand_name"
                  placeholder="Nama Brand"
                  value={formValues.brand_name}
                  onChange={(e) => setFormValues({ ...formValues, brand_name: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Brand name is required</CFormFeedback>
              </CCol>
            </CRow>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setAddVisible(false)}>
                Close
              </CButton>
              <CButton type="submit" color="primary">
                Save Changes
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  );
};

export default Brand;