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
  CFormFeedback,
  CFormSelect,
} from '@coreui/react-pro';
import {
  cilCheckCircle,
  cilWarning,
  cilInfo,
  cilXCircle,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';


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
  const [validated, setValidated] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    username: '',
    password: '',
    telepon: '',
    email: '',
    role: '',
    status: '',
    photo : null,
  });

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

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/superadmin/users', {
        headers: { Authorization: `${token}` },
        withCredentials: true
      });

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

  useEffect(() => {
  fetchData();  // Panggil fetchData saat komponen mount
}, []);

  const handleAdd = () => {
    setFormValues({
      name: '',
      username: '',
      password: '',
      telepon: '',
      email: '',
      role: '',
      status: '',
      photo: null,
    });
    setPreviewImage(null);
    setAddVisible(true);
  };


  const handleSaveAdd = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }


    // if (!formValues.name || !formValues.username || !formValues.password || !formValues.telepon || !formValues.role || !formValues.photo ) {
    //   setValidated(true);
    //   return;
    // }

    try {
      const formData = new FormData();

      formData.append('name', formValues.name);
      formData.append('username', formValues.username);
      formData.append('password', formValues.password);
      formData.append('telepon', formValues.telepon);
      formData.append('email', formValues.email);
      formData.append('role', formValues.role);
      formData.append('status', formValues.status);

      if (formValues.photo) {
        formData.append('photo', formValues.photo);
      }

      const response = await axios.post('/api/superadmin/users/add', formData,
      {
        headers: {
           Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      showAlert('User successfully Added!', 'success');

      setAddVisible(false);
      fetchData();
      // setUserData((prevUsers) => [...prevUsers, response.data]);

    } catch (error) {
      console.error('Error menambah data pengguna:', error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.message || 'An error occurred';

      showAlert('Failed to add user!', 'danger');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        showAlert(`Ukuran file terlalu besar. Maksimal ${maxSizeInMB} MB.`, 'danger');
        setFormValues({ ...formValues, photo: null });
        setPreviewImage(null);
        setAddVisible(false)
      } else {
        setFormValues({ ...formValues, photo: file });
        setPreviewImage(URL.createObjectURL(file));
      }
    }
  };


  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormValues({
      name: user.name,
      username: user.username,
      password: '', // hanya diisi jika user ingin mengubahnya
      telepon: user.telepon,
      email: user.email,
      role: user.role,
      status: user.status,
      photo: null,
    });

    setPreviewImage(user.photo ? `http://localhost:3000${user.photo}` : null);
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || !selectedUser.id) {
      console.error("No selectedUser or ID missing");
      return;
    }

    try {
      const formData = new FormData();

      formData.append('name', formValues.name);
      formData.append('username', formValues.username);

      // jika password diisi, maka tambahkan ke formData, jika tidak, biarkan password lama tetap ada
      if (formValues.password) {
        formData.append('password', formValues.password);
      }

      formData.append('telepon', formValues.telepon);
      formData.append('email', formValues.email);
      formData.append('role', formValues.role);
      formData.append('status', formValues.status);

      // Jika ada foto baru yang diunggah, tambahkan ke FormData
      if (formValues.photo) {
        formData.append('photo', formValues.photo);
      }
      const response = await axios.put(`/api/superadmin/users/${selectedUser.id}`, formData,  {
        headers: { 
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
          },
        withCredentials: true
      });

      console.log(response.data);

      setEditVisible(false);

      showAlert('User successfully updated!', 'success');

      // Swal
      // .fire(
      //   'Updated!',
      //   'User details have been updated.',
      //   'success',
      //   {
      //     background: '#343a40',
      //     color: '#fff',
      //   }
      // );

      fetchData();

    } catch (error) {
      console.error('Error updating user data:', error.response ? error.response.data : error.message);

      showAlert(error.message, 'danger');
      showAlert('Failed to update user!', 'danger');

      // Swal.fire(
      //   'Failed!',
      //   'There was an error updating the user.',
      //   'error',
      //   {
      //     background: '#343a40',
      //     color: '#fff',
      //   }
      // );
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
        await axios.delete(`/api/superadmin/users/${user.id}`, {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });

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

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Name' },
    { key: 'telepon', label: 'Phone' },
    { key: 'email', label: 'Email' },
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
      const token = localStorage.getItem('token');

      const response = await axios.put(`/api/user/${item.id}/status`,
      {
        status: newStatus,
      },
       {
        headers: { Authorization: `${token}` },
        withCredentials: true,
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
              <CAlert
                color={alert.color}
                onClose={() => setAlert({ ...alert, visible: false })}
                className="w-500 d-flex align-items-center"
              >
                {getIcon(alert.color)}
                <div>{alert.message}</div>
              </CAlert>
            )}
          <div className="d-flex justify-content-between align-items-center">
            <CButton
              color="primary"
              size="sm"
              // shape="rounded-pill"
              className="float-end"
              onClick={handleAdd}
            >
              Add User
            </CButton>
          </div>
        </div>
        <CCard>
          <CCardHeader>
            Users Data
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
                    <CBadge 
                      color={getBadge(item.status)}
                      onClick={() => handleStatus(item)} 
                      style={{ cursor: 'pointer' }}
                    >
                      {item.status}
                    </CBadge>
                  </td>
                ),
                actions: (item) => (
                  <td className="text-center">
                    {item.role !== 'superadmin' && (
                      <div className="d-flex justify-content-center gap-2">
                        {/* <CButton
                          color="info"
                          size="sm"
                          // shape="rounded-pill"
                          onClick={() => handleStatus(item)}
                        >
                          Status
                        </CButton> */}
                        <CButton
                          color="warning"
                          size="sm"
                          // shape="rounded-pill"
                          onClick={() => handleEdit(item)}
                          disabled={item.role === 'superadmin'}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          // shape="rounded-pill"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </CButton>
                      </div>
                    )}
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
                <CFormLabel htmlFor="password" className="col-form-label">
                  New Password
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  // type="password"
                  id="password"
                  value={formValues.password}
                  onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                  placeholder="Edit Password"
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
                  Phone
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
                <CFormLabel htmlFor="email" className="col-form-label">
                  Email
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
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
                <CFormSelect
                  id="role"
                  value={formValues.role}
                  onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  {/* <option value="superadmin">Superadmin</option> */}
                </CFormSelect>
              </CCol>
            </CRow>
            {/* <CRow className="mb-3">
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
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="photo" className="col-form-label">
                  Image
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="photo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  required
                />
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
          <CModalTitle>Add User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm noValidate validated={validated} onSubmit={handleSaveAdd}>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addUsername" className="col-form-label">
                  Username <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addUsername"
                  value={formValues.username}
                  onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Username is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addName" className="col-form-label">
                  Name <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addName"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Name is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addTelepon" className="col-form-label">
                  Phone <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="addTelepon"
                  value={formValues.telepon}
                  onChange={(e) => setFormValues({ ...formValues, telepon: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Phone is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="email" className="col-form-label">
                  Email <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  required
                />
                <CFormFeedback invalid>Email is required.</CFormFeedback>
              </CCol>
            </CRow>
            {/* <CRow className="mb-3">
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
                  required
                />
                <CFormFeedback invalid>Password is required.</CFormFeedback>
              </CCol>
            </CRow> */}
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="addRole" className="col-form-label">
                  Role <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormSelect
                  id="addRole"
                  value={formValues.role}
                  onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                  required
                >
                  <option>Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  {/* <option value="superadmin">Superadmin</option> */}
                </CFormSelect>
                <CFormFeedback invalid>Role is required.</CFormFeedback>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="photo" className="col-form-label">
                  Image <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="photo"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  required
                />
                {/* <CFormFeedback invalid>Gambar is required.</CFormFeedback> */}
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', marginTop: '10px' }}
                  />
                )}
                <CFormFeedback invalid>Image is required.</CFormFeedback>
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
