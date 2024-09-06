// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import axios from 'axios';
// import {
//   CAvatar,
//   CDropdown,
//   CDropdownDivider,
//   CDropdownHeader,
//   CDropdownItem,
//   CDropdownMenu,
//   CDropdownToggle,
//   CModal,
//   CModalBody,
//   CModalFooter,
//   CModalHeader,
//   CModalTitle,
//   CForm,
//   CFormInput,
//   CFormLabel,
//   CRow,
//   CCol,
//   CButton
// } from '@coreui/react-pro';
// import {
//   cilBell,
//   cilCreditCard,
//   cilCommentSquare,
//   cilEnvelopeOpen,
//   cilFile,
//   cilLockLocked,
//   cilSettings,
//   cilTask,
//   cilUser,
//   cilAccountLogout
// } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import avatar8 from './../../assets/images/avatars/asalsa.jpg';

// const AppHeaderDropdown = () => {
//   const [username, setUsername] = useState('');
//   const [name, setName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [photo, setPhoto] = useState(null);
//   const [userPhoto, setUserPhoto] = useState(avatar8);
//   const [editVisible, setEditVisible] = useState(false);

//   // Fetch user profile data when the modal is opened
//   useEffect(() => {
//     if (editVisible) {
//       const fetchUserProfile = async () => {
//         try {
//           const token = localStorage.getItem('token');

//           const response = await axios.get('http://localhost:3000/api/profile', {
//             headers: { Authorization: `${user.token}` },
//             withCredentials: true
//           });

//           const { username, name, phone, photo } = response.data;
//           setUsername(username);
//           setName(name);
//           setPhone(phone);
//           setUserPhoto(photo || avatar8); // Set user photo if available
//         } catch (error) {
//           console.error('Error fetching user profile:', error);
//         }
//       };

//       fetchUserProfile();
//     }
//   }, [editVisible]);

//   const handlePhotoChange = (e) => {
//     setPhoto(e.target.files[0]);
//   };

//   const handleEditProfil = async (event) => {
//     event.preventDefault();

//     const formData = new FormData();
//     formData.append('username', username);
//     formData.append('name', name);
//     formData.append('phone', phone);
//     formData.append('password', password);
//     if (photo) formData.append('photo', photo);

//     try {
//       const token = localStorage.getItem('token');

//       const response = await axios.patch('http://localhost:3000/api/profile', formData, {
//         headers: {
//           Authorization: `${token}`,
//           'Content-Type': 'multipart/form-data'
//         },
//         withCredentials: true
//       });

//       alert(response.data.message);

//       if (response.data.photo_url) {
//         setUserPhoto(response.data.photo_url);
//       }

//       setEditVisible(false);
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile');
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const { t } = useTranslation();

//   return (
//     <>
//       <CDropdown variant="nav-item" alignment="end">
//         <CDropdownToggle className="py-0" caret={false} onClick={() => setEditVisible(true)}>
//           <CAvatar src={userPhoto} size="md" />
//         </CDropdownToggle>
//         <CDropdownMenu className="pt-0">
//           <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
//             {t('settings')}
//           </CDropdownHeader>
//           <CDropdownItem href="#" onClick={() => setEditVisible(true)}>
//             <CIcon icon={cilUser} className="me-2" />
//             {t('profile')}
//           </CDropdownItem>
//           <CDropdownItem href="#" onClick={handleLogout}>
//             <CIcon icon={cilAccountLogout} className="me-2" />
//             {t('logout')}
//           </CDropdownItem>
//         </CDropdownMenu>
//       </CDropdown>

//       <CModal alignment="center" visible={editVisible} onClose={() => setEditVisible(false)}>
//         <CModalHeader>
//           <CModalTitle>Edit Profile</CModalTitle>
//         </CModalHeader>
//         <CModalBody>
//           <CForm>
//             <CRow className="mb-3">
//               <CCol sm={3}>
//                 <CFormLabel htmlFor="username" className="col-form-label">
//                   Username
//                 </CFormLabel>
//               </CCol>
//               <CCol sm={9}>
//                 <CFormInput
//                   id="username"
//                   type="text"
//                   value={username} 
//                   readOnly
//                   plainText
//                 />
//               </CCol>
//             </CRow>
//             <CRow className="mb-3">
//               <CCol sm={3}>
//                 <CFormLabel htmlFor="name" className="col-form-label">
//                   Nama
//                 </CFormLabel>
//               </CCol>
//               <CCol sm={9}>
//                 <CFormInput
//                   id="name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                 />
//               </CCol>
//             </CRow>
//             <CRow className="mb-3">
//               <CCol sm={3}>
//                 <CFormLabel htmlFor="password" className="col-form-label">
//                   Password
//                 </CFormLabel>
//               </CCol>
//               <CCol sm={9}>
//                 <CFormInput
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </CCol>
//             </CRow>
//             <CRow className="mb-3">
//               <CCol sm={3}>
//                 <CFormLabel htmlFor="phone" className="col-form-label">
//                   Telepon
//                 </CFormLabel>
//               </CCol>
//               <CCol sm={9}>
//                 <CFormInput
//                   id="phone"
//                   placeholder="Telepon"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                 />
//               </CCol>
//             </CRow>
//             <CRow className="mb-3">
//               <CCol sm={3}>
//                 <CFormLabel htmlFor="photo" className="col-form-label">
//                   Photo
//                 </CFormLabel>
//               </CCol>
//               <CCol sm={9}>
//                 <CFormInput
//                   id="photo"
//                   type="file"
//                   onChange={handlePhotoChange}
//                 />
//               </CCol>
//             </CRow>
//           </CForm>
//         </CModalBody>
//         <CModalFooter>
//           <CButton color="secondary" onClick={() => setEditVisible(false)}>Close</CButton>
//           <CButton color="primary" onClick={handleEditProfil}>Save changes</CButton>
//         </CModalFooter>
//       </CModal>
//     </>
//   );
// };

// export default AppHeaderDropdown;




















import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'
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
} from '@coreui/react-pro'
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
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/asalsa.jpg'

const AppHeaderDropdown = () => {
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    telepon: '',
    photo: '',
    role: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showVisible, setShowVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editProfile, setEditProfile] = useState({
    name: profile.name,
    telepon: profile.telepon,
    photo: profile.photo,
  });
  
  

  useEffect(() => {
    const role = localStorage.getItem('userRole');

    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    const telepon = localStorage.getItem('telepon');
    const photo = localStorage.getItem('photo');

    setProfile({
      role: role || '',
      username: username || '',
      name: name || '',
      telepon: telepon || '',
      photo: photo || '',
    });

    setEditProfile({
      name: name || '',
      telepon: telepon || '',
      photo: photo || '',
    });
  }, []);


  const handleShowProfile = () => {
    setShowVisible(true);
  };

  const handleEditProfile = (profile) => {
    setEditProfile({
      name: profile.name,
      telepon: profile.telepon,
      photo: profile.photo,
    });
  
    setPreviewImage(profile.photo ? `http://localhost:3000/${profile.photo}` : null);

    setShowVisible(false);
    setEditVisible(true);
  };
  

  const handleSaveEdit = async () => {
    const formData = new FormData();
    formData.append('name', editProfile.name);
    formData.append('telepon', editProfile.telepon);
    
    if (editProfile.photo) {
      formData.append('photo', editProfile.photo); 
    }
  
    const token = localStorage.getItem('token');

    try {
      // const response = await axios.put('http://localhost:3000/api/profile', formData, {
      const response = await axios.patch('http://localhost:3000/api/profile', formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
          withCredentials: true,
        },
      });
  
      setProfile({
        ...profile,
        name: response.data.profile.name,
        telepon: response.data.profile.telepon,
        photo: response.data.profile.photo
      });
      
      setShowVisible(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditProfile((prevProfile) => ({
      ...prevProfile,
      photo: file,
    }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const { t } = useTranslation()

  // const avatarSrc = profile.photo ? `http://localhost:3000/${profile.photo}` : avatar8;

  return (
    <>
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle className="py-0" caret={false}>
        <CAvatar
          src={profile.photo ? `http://localhost:3000/${profile.photo}` : avatar8}
          // src={avatarSrc}
          size="md"
        />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
          {t('settings')}
        </CDropdownHeader>
        <CDropdownItem href="#"  onClick={handleShowProfile}>
          <CIcon icon={cilUser} className="me-2" />
          {t('profile')}
        </CDropdownItem>
        <CDropdownItem href="#"  onClick={handleLogout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          {t('logout')}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>


    <CModal alignment="center" visible={showVisible} onClose={() => setShowVisible(false)}>
        <CModalHeader>
          <CModalTitle>Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="photo" className="col-form-label"> 
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CAvatar 
                  style={{ width: '250px', height: '250px' }}
                  src={profile.photo ? `http://localhost:3000/${profile.photo}` : 'default-photo.png'} 
                  alt="user-profile"
                  // size="xl" 
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
                  type="text"
                  value={profile.username}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="name" className="col-form-label">
                  Nama
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="name"
                  value={profile.name}
                  readOnly
                  plainText
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
                  value={profile.role}
                  readOnly
                  plainText
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
                  value={profile.telepon}
                  readOnly 
                  plainText
                  />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVisible(false)}>Close</CButton>
          {/* <CButton color="primary" onClick={() => setShowEdit(true)}>Edit Profile</CButton> */}
          <CButton color="primary" onClick={handleEditProfile}>Edit Akun</CButton>
        </CModalFooter>
      </CModal>



      {/* modal untuk edit profile */}
      <CModal alignment="center" visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Profile</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="photo" className="col-form-label">
                  Photo
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
              {previewImage && (
                  <CAvatar
                    src={previewImage}
                    alt="Preview"
                    size="xl"  
                    style={{ width: '250%', height: '250px' }}
                  />
                )}

                {/* <CAvatar 
                  style={{ width: '250px', height: '250px' }}
                  src={profile.photo ? `http://localhost:3000/${profile.photo}` : 'default-photo.png'} 
                  // src={editProfile.photo ? URL.createObjectURL(editProfile.photo) : `http://localhost:3000/${profile.photo}`}
                  alt="user-profile"
                  // size="xl" 
                /> */}
                <CFormInput
                  type="file"
                  id="photo"
                  accept="image/png, image/jpeg, image/jpg"
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
                  type="text"
                  value={profile.username}
                  readOnly
                  plainText
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={3}>
                <CFormLabel htmlFor="name" className="col-form-label">
                  Nama
                </CFormLabel>
              </CCol>
              <CCol sm={9}>
                <CFormInput
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
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
                  type="text"
                  value={profile.telepon}
                  onChange={(e) => setEditProfile({ ...editProfile, telepon: e.target.value })}
                  />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowVisible(false)}>Close</CButton>
          {/* <CButton color="primary" onClick={() => setShowEdit(true)}>Edit Profile</CButton> */}
          <CButton color="primary" onClick={handleSaveEdit}>Save changes</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AppHeaderDropdown

