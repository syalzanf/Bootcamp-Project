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
import {
  cilCheckCircle,
  cilWarning,
  cilInfo,
  cilXCircle,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
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

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/brands', {
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
      const response = await axios.post('/api/brands/add', formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      setBrands([...brands, response.data]);

      showAlert('Brand successfully added!', 'success');
      setAddVisible(false);
      setValidated(false);
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

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    
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
        `/api/brands/edit/${selectedBrand.id_brand}`,
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
  

      showAlert('Brand successfully updated!', 'success');
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

        await axios.delete(`/api/brands/delete/${brand.id_brand}`, {
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
    { key: 'brand_name', label: 'Brand Name' },
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
              <CAlert
                color={alert.color}
                onClose={() => setAlert({ ...alert, visible: false })}
                className="w-500 d-flex align-items-center"
              >
                {getIcon(alert.color)}
                <div>{alert.message}</div>
              </CAlert>
            )}
        </div>
        <CCard>
          <CCardHeader>Brands Data</CCardHeader>
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
               
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Brand;
