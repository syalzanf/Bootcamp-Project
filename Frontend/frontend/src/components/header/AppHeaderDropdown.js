import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CCol,
  CRow,
  CButton,
  CAlert,
} from '@coreui/react-pro';
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
  cilCheckCircle, cilWarning, cilInfo, cilXCircle,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';

import avatar8 from './../../assets/brand/logo-jam.png';

const AppHeaderDropdown = () => {
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    telepon: '',
    photo: '',
    role: '',
    email: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showVisible, setShowVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: '',
    telepon: '',
    password:'',
    photo: null,
    email:'',
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

  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `${token}` },
          withCredentials: true
        });

        const profileData = response.data.user;
        console.log('PROFIL', response.data.user)

        setProfile({
          username: profileData.username,
          name: profileData.name,
          telepon: profileData.telepon,
          photo: profileData.photo,
          role: profileData.role,
          email: profileData.email,
        });

        setEditProfile({
          name: profileData.name,
          telepon: profileData.telepon,
          password: '',
          photo: profileData.photo ? `http://localhost:3000/${profileData.photo}` : null,
          email: profileData.email,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleShowProfile = () => {
    setShowVisible(true);
  };

  const handleEditProfile = () => {
    setPreviewImage(profile.photo ? `http://localhost:3000/${profile.photo}` : null);
    setShowVisible(false);
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editProfile.name || !editProfile.telepon || !editProfile.email) {
      showAlert('Please fill in all required fields.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', editProfile.name);
    formData.append('telepon', editProfile.telepon);
    formData.append('email', editProfile.email);


    if (editProfile.photo) {
      formData.append('photo', editProfile.photo);
    }


    if (editProfile.password) {
      formData.append('password', editProfile.password);
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id');

    try {

      const response = await axios.put(`/api/profile/${userId}`, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setProfile({
        ...profile,
        name: response.data.name,
        telepon: response.data.telepon,
        photo: response.data.photo,
        email: response.data.email,

      });


      setShowVisible(false);
      showAlert('Profile updated successfully!', 'success');

      window.location.reload(); //refresh profile

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        // Jika pesan error dari backend ada
        console.error('Error:', error.response.data.message);
        showAlert(error.response.data.message, 'danger');
      } else {
        // Jika tidak ada pesan spesifik dari backend
        console.error('Error:', error);
        showAlert('Failed to update profile', 'danger');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditProfile((prevProfile) => ({
      ...prevProfile,
      photo: file,
    }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
    {/* {alert.visible && (
        <CAlert color={alert.color} onClose={() => setAlert({ ...alert, visible: false })} className="w-500">
            {alert.message}
        </CAlert>
        )} */}

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

      <CDropdown variant="nav-item" alignment="end">
        <CDropdownToggle className="py-0" caret={false}>
          <CAvatar
            src={profile.photo ? `http://localhost:3000/${profile.photo}` : avatar8}
            size="md"
          />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0">
          <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
            {t('settings')}
          </CDropdownHeader>
          <CDropdownItem href="#" onClick={handleShowProfile}>
            <CIcon icon={cilUser} className="me-2" />
            {t('profile')}
          </CDropdownItem>
          <CDropdownItem href="#" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            {t('logout')}
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* <CModal alignment="center" visible={showVisible} onClose={() => setShowVisible(false)}>
        <CModalHeader>
          <CModalTitle>Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>


        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleEditProfile}>Edit Profile</CButton>
        </CModalFooter>
      </CModal> */}
      <CModal alignment="center"  size="lg" visible={showVisible} onClose={() => setShowVisible(false)}>
        <CModalHeader>
          <CModalTitle>Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="g-3">
              {/* Kolom untuk gambar di sebelah kiri */}
              <CCol xs="auto" className="d-flex align-items-center">
                <img
                  style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '0' }}
                  src={profile.photo ? `http://localhost:3000/${profile.photo}` : 'default-photo.png'}
                  alt="user-profile"
                />
              </CCol>

              {/* Kolom untuk form di sebelah kanan */}
              <CCol>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="username">Username</CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                    <CFormInput
                      id="username"
                      type="text"
                      value={profile.username}
                      readOnly
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="name">Nama</CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                    <CFormInput
                      id="name"
                      value={profile.name}
                      readOnly
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="role">Role</CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                    <CFormInput
                      id="role"
                      value={profile.role}
                      readOnly
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="telepon">Telepon</CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                    <CFormInput
                      id="telepon"
                      placeholder="Telepon"
                      value={profile.telepon}
                      readOnly
                      
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol sm={3}>
                    <CFormLabel htmlFor="email">Email</CFormLabel>
                  </CCol>
                  <CCol sm={9}>
                    <CFormInput
                      id="email"
                      placeholder="Email"
                      value={profile.email}
                      readOnly
                    />
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CForm>
          <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleEditProfile}>Edit Profile</CButton>
        </CModalFooter>
        </CModalBody>
      </CModal>


      <CModal alignment="center" visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="photo" className="col-form-label">
                {previewImage && (
                  <CAvatar
                    src={previewImage}
                    alt="Preview"
                    size="xl"
                    style={{ width: '60%', height: '60px' }}
                  />
                )}
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  type="file"
                  id="photo"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>

                <CFormLabel htmlFor="username" className="col-form-label">
                  Username
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="username"
                  value={profile.username}
                  readOnly
                  plainText
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
                  value={editProfile.name}
                  onChange={(e) => setEditProfile((prev) => ({ ...prev, name: e.target.value }))}
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
                  value={editProfile.telepon}
                  onChange={(e) => setEditProfile((prev) => ({ ...prev, telepon: e.target.value }))}
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
                  value={editProfile.email}
                  onChange={(e) => setEditProfile((prev) => ({ ...prev, email: e.target.value }))}
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
                  type="password"
                  id="password"
                  value={editProfile.password}
                  onChange={(e) => setEditProfile((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Password"
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSaveEdit}>Save change</CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default AppHeaderDropdown;
