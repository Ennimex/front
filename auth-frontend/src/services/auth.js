import api from './api';

export const authService = {
  // Registro
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login - Paso 1: Validar credenciales
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Usuario o contraseña incorrectos');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al conectar con el servidor');
      }
    }
  },

  // Paso 2: Solicitar OTP para el método seleccionado
  async requestOTP(userId, method) {
    const response = await api.post('/auth/request-otp', { userId, method });
    return response.data;
  },

  // Paso 3: Verificar OTP
  async verifyOTP(data) {
    const response = await api.post('/auth/verify-otp', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Habilitar MFA por Email
  async enableMFAEmail(userId) {
    const response = await api.post('/auth/enable-mfa-email', { userId });
    return response.data;
  },

  // Habilitar MFA por SMS
  async enableMFASMS(userId, phone) {
    const response = await api.post('/auth/enable-mfa-sms', { userId, phone });
    return response.data;
  },

  // Habilitar MFA por App
  async enableMFAApp(userId) {
    const response = await api.post('/auth/enable-mfa-app', { userId });
    return response.data;
  },

  // Obtener métodos MFA configurados
  async getMFAMethods(userId) {
    const response = await api.get(`/auth/mfa-methods/${userId}`);
    return response.data;
  },

  // Deshabilitar un método MFA
  async disableMFAMethod(userId, method) {
    const response = await api.post('/auth/disable-mfa-method', { userId, method });
    return response.data;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
