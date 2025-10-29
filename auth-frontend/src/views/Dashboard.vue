<template>
  <div class="dashboard-container">
    <div class="dashboard-card">
      <h2>Dashboard</h2>
      <p>¡Autenticación exitosa!</p>
      
      <button @click="handleLogout" class="btn-logout">
        Cerrar Sesión
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth';

const router = useRouter();

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.dashboard-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.btn-logout {
  margin-top: 20px;
  padding: 12px 30px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-logout:hover {
  background: #c82333;
}
</style>
