import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppAside, AppContent, AppSidebar, AppFooter, AppHeader } from './components/index'

const TimerComponent = ({ initialAccessToken, initialRefreshToken }) => {
  const [token, setToken] = useState(initialAccessToken);
  const [refreshToken] = useState(initialRefreshToken); // Refresh token tidak berubah, jadi tidak butuh setState
  const [timeLeft, setTimeLeft] = useState(3600); // 1 jam dalam detik (3600 detik)
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set interval untuk mengurangi waktu setiap detik
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId); // Hentikan interval ketika waktu habis
          handleLogout();
          return 0; // Pastikan timeLeft tidak menjadi negatif
        }
        return prevTime - 1;
      });
    }, 1000); // 1000ms = 1 detik

    // Cleanup interval ketika komponen di-unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Panggil refreshAccessToken 5 menit sebelum token kedaluwarsa
    if (timeLeft <= 3590) { // 5 menit dalam detik
      refreshAccessToken();
    }
  }, [timeLeft]);


  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/refresh-token', { refreshToken });
      setTimeLeft(3600); // Reset waktu ke 1 jam lagi
      setToken(response.data.token); // Simpan token yang baru
      localStorage.setItem('token', response.data.token)
    
      console.log('Token berhasil diperbarui:', response.data.token);
    } catch (error) {
      console.error('Gagal memperbarui token:', error);
      handleLogout();
    }
  };

  // Fungsi untuk format waktu dalam format mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    // Proses logout (misalnya, hapus token dari localStorage)
    localStorage.removeItem('token'); // Misal token disimpan di localStorage
    navigate('/login'); // Redirect ke halaman login
  };

  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
      <AppAside />
    </>
  )
};

export default TimerComponent;