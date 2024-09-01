import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSmartTable,
  CButton,
  CAlert,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput
} from '@coreui/react-pro';
import '../../../scss/_custom.scss';

const CustomerList = () => {
  const [customerData, setCustomerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });

  const [formValues, setFormValues] = useState({
    kode_member: '',
    nama: '',
    telepon: '',
    alamat: '',
  });



  useEffect(() => {
    console.log('Customers component rendered');

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/cashier/customers');
        if (Array.isArray(response.data)) {
          setCustomerData(response.data);
        } else {
          console.error('Data format is not an array:', response.data);
          setCustomerData([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error.response ? error.response.data : error.message);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleAdd = () => {
    setFormValues({
      nama: '',
      telepon: '',
      alamat:'',
    });
    setAddVisible(true);
  }

  const handleSaveAdd = async () => {
    try {
      const newCustomer = {
        nama: formValues.nama,
        telepon: formValues.telepon,
        alamat: formValues.alamat,
      };

      const response = await axios.post('http://localhost:3000/api/cashier/customers/add', newCustomer);

      Swal.fire(
        'Added!',
        'Customer details have been added.',
        'success',
        {
          background: '#343a40',
          color: '#fff',
        }
      );

      console.log('Pelanggan berhasil ditambahkan:', response.data);

      setAddVisible(false);

      setCustomerData((prevCustomers) => [...prevCustomers, response.data]);

    } catch (error) {
      console.error('Terjadi kesalahan:', error);
    }
  };

  
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormValues({
      kode_member: customer.kode_member,
      nama: customer.nama,
      telepon: customer.telepon,
      alamat: customer.alamat,
    });
    setEditVisible(true);
  };

  
  const handleSaveEdit = async () => {
    if (!selectedCustomer || !selectedCustomer.member_id) {
      console.error("No selectedCustomer or ID missing");
      return;
    }
  
    try {
      const updatedCustomer = {
        nama: formValues.nama,
        telepon: formValues.telepon,
        alamat: formValues.alamat,
      };
  
      const response = await axios.put(`http://localhost:3000/api/cashier/customers/${selectedCustomer.member_id}`, updatedCustomer);
  
      console.log('Pelanggan berhasil diperbarui:', response.data);
  
      // Perbarui state customerData dengan data pelanggan yang diperbarui
      setCustomerData((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.member_id === selectedCustomer.member_id ? response.data : customer
        )
      );
  
      setEditVisible(false);
  
      Swal.fire(
        'Updated!',
        'Customer details have been updated.',
        'success',
        {
          background: '#343a40',
          color: '#fff',
        }
      );
    } catch (error) {
      console.error('Error updating customer data:', error.response ? error.response.data : error.message);
      Swal.fire(
        'Error!',
        'There was an error updating the customer.',
        'error',
        {
          background: '#343a40',
          color: '#fff',
        }
      );
    }
  };




  const handleDelete = async (customer) => {
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
      await axios.delete(`http://localhost:3000/api/cashier/customers/${customer.member_id}`);

        setCustomerData((prevCustomers) =>
        prevCustomers.filter((item) => item.member_id !== customer.member_id)
      );

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



  const columns = [
    { key: 'kode_member', label: 'Kode Customer' },
    { key: 'nama', label: 'Nama Customer' },
    { key: 'telepon', label: 'Telepon' },
    { key: 'alamat', label: 'Alamat' },
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
              className="float-end"
              onClick={handleAdd}
            >
              Tambah Customer
            </CButton>
          </div>
        </div>
        <CCard>
          <CCardHeader>
            Data Customer
          </CCardHeader>
          <CCardBody>
          <CSmartTable
              clickableRows
              tableProps={{ 
                striped: true,
                hover: true
              }}
              columns={columns}
              items={customerData}
              columnFilter
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
          <CModalTitle>Edit Customer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="kode_member" className="col-form-label">
                  Kode Customer
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="kode_member"
                  type="text"
                  value={selectedCustomer?.kode_member || ''}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="nama" className="col-form-label">
                  Nama Customer
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="nama"
                  placeholder="Nama Customer"
                  value={formValues.nama}
                  onChange={(e) => setFormValues({ ...formValues, nama: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="telepon" className="col-form-label">
                  Telepon
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="telepon"
                  placeholder="Telepon"
                  value={formValues.telepon}
                  onChange={(e) => setFormValues({ ...formValues, telepon: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="alamat" className="col-form-label">
                  Alamat
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="alamat"
                  placeholder="Alamat"
                  value={formValues.alamat}
                  onChange={(e) => setFormValues({ ...formValues, alamat: e.target.value })}
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
          <CModalTitle>Tambah Customer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="kode_member" className="col-form-label">
                  Kode Customers
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="kode_member"
                  type="text"
                  value={selectedCustomer?.kode_member || ''}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="nama" className="col-form-label">
                  Nama Customer
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="nama"
                  placeholder="Nama Customer"
                  value={formValues.nama}
                  onChange={(e) => setFormValues({ ...formValues, nama: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="telepon" className="col-form-label">
                  Telepon
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="telepon"
                  placeholder="Telepon"
                  value={formValues.telepon}
                  onChange={(e) => setFormValues({ ...formValues, telepon: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="alamat" className="col-form-label">
                  Alamat
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="alamat"
                  placeholder="Alamat"
                  value={formValues.alamat}
                  onChange={(e) => setFormValues({ ...formValues, alamat: e.target.value })}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveAdd}>Save changes</CButton>
        </CModalFooter>
      </CModal>


    </CRow>
  );
};

export default CustomerList;
