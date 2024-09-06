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
  CFormInput,
  CBadge,
} from '@coreui/react-pro';

import '../../../scss/_custom.scss';

const Users = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState({ visible: false, message: '', color: '' });

  const [formValues, setFormValues] = useState({
    name: '',
    username: '',
    password: '',
    telepon: '',
    role: '',
    status: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/superadmin/users');
        if (Array.isArray(response.data)) {
          setUserData(response.data);
        } else {
          console.error('Data format is not an array:', response.data);
          setUserData([]);
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
      name: '',
      username: '',
      password: '',
      telepon: '',
      role: '',
      status: '',
    });
    setAddVisible(true);
  };

  const handleSaveAdd = async () => {
    try {
      const newUser = {
        name: formValues.name,
        username: formValues.username,
        password: formValues.password,
        telepon: formValues.telepon,
        role: formValues.role,
        status: formValues.status,
      };

      const response = await axios.post('http://localhost:3000/api/superadmin/users/add', newUser);

      Swal.fire(
        'Added!',
        'User details have been added.',
        'success',
        {
          background: '#343a40',
          color: '#fff',
        }
      );

      setAddVisible(false);
      setUserData((prevUsers) => [...prevUsers, response.data]);

    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormValues({
      name: user.name,
      username: user.username,
      password: user.password,
      telepon: user.telepon,
      role: user.role,
      status: user.status,
    });
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error("No selectedUser or ID missing");
      return;
    }

    try {
      const updatedUser = {
        name: formValues.name,
        username: formValues.username,
        password: formValues.password,
        telepon: formValues.telepon,
        role: formValues.role,
        status: formValues.status,
      };

      const response = await axios.put(`http://localhost:3000/api/superadmin/users/${selectedUser.id}`, updatedUser);

      setUserData((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? response.data : user
        )
      );

      setEditVisible(false);

      Swal.fire(
        'Updated!',
        'User details have been updated.',
        'success',
        {
          background: '#343a40',
          color: '#fff',
        }
      );


    
    } catch (error) {
      console.error('Error updating user data:', error.response ? error.response.data : error.message);
      Swal.fire(
        'Error!',
        'There was an error updating the user.',
        'error',
        {
          background: '#343a40',
          color: '#fff',
        }
      );
    }
  };

  const handleDelete = async (user) => {
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
        await axios.delete(`http://localhost:3000/api/superadmin/users/${user.id}`);

        setUserData((prevUsers) =>
          prevUsers.filter((item) => item.id !== user.id)
        );

        Swal.fire(
          'Deleted!',
          'User has been deleted.',
          'success',
          {
            background: '#343a40',
            color: '#fff',
          }
        );
      }
    } catch (error) {
      console.error('Error deleting user:', error.response ? error.response.data : error.message);
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
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Nama' },
    { key: 'telepon', label: 'Telepon' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      _props: { className: 'text-center' },
      filter: false,
      sorter: false,
    },
  ];

  const handleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.put(`http://localhost:3000/api/user/${item.id}/status`, {
        status: newStatus,
      });

      console.log('Status updated:', response.data);

       // Update state userData
      const updatedUsers = userData.map(user => 
        user.id === item.id ? { ...user, status: newStatus } : user
      );
      setUserData(updatedUsers);

    } catch (error) {
      console.error('Error updating status:', error.response ? error.response.data : error.message);
    }
  };

  const getBadge = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'secondary'
    }
  }

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
              Tambah User
            </CButton>
          </div>
        </div>
        <CCard>
          <CCardHeader>
            Data Users
          </CCardHeader>
          <CCardBody>
            <CSmartTable
              clickableRows
              tableProps={{ 
                striped: true,
                hover: true
              }}
              columns={columns}
              items={userData}
              columnFilter
              tableFilter
              cleaner
              itemsPerPageSelect
              itemsPerPage={5}
              columnSorter
              pagination
              scopedColumns={{
                status: (item) => (
                  <td>
                    <CBadge color={getBadge(item.status)}>{item.status}</CBadge>
                  </td>
                ),
                actions: (item) => (
                  <td className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      shape="rounded-pill"
                      onClick={() => handleStatus(item)}
                    >
                      Status
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
          <CModalTitle>Edit User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="username" className="col-form-label">
                  Username
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="username"
                  value={formValues.username}
                  onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                  disabled
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="name" className="col-form-label">
                  Name
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
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
                  value={formValues.telepon}
                  onChange={(e) => setFormValues({ ...formValues, telepon: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="role" className="col-form-label">
                  Role
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="role"
                  value={formValues.role}
                  onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveEdit}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal alignment="center" visible={addVisible} onClose={() => setAddVisible(false)}>
        <CModalHeader>
          <CModalTitle>Tambah User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addUsername" className="col-form-label">
                  Username
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addUsername"
                  value={formValues.username}
                  onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addName" className="col-form-label">
                  Name
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addName"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addTelepon" className="col-form-label">
                  Telepon
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addTelepon"
                  value={formValues.telepon}
                  onChange={(e) => setFormValues({ ...formValues, telepon: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="password" className="col-form-label">
                  Password
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="password"
                  value={formValues.password}
                  onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addRole" className="col-form-label">
                  Role
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addRole"
                  value={formValues.role}
                  onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveAdd}>
            Save changes
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Users;
