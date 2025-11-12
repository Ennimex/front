// services/auth.js
import api from './api';

export const authService = {
  // ============================================
  // REGISTRO Y LOGIN
  // ============================================
  
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

  // ============================================
  // AUTENTICACIÓN MFA
  // ============================================

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

  // ============================================
  // CONFIGURACIÓN MFA
  // ============================================

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

  // ============================================
  // 🆕 RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  /**
   * Paso 1: Solicitar código de recuperación por email
   * @param {string} email - Email del usuario
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('No existe una cuenta con este correo electrónico');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al enviar el código de recuperación');
      }
    }
  },

  /**
   * Paso 2: Verificar código de recuperación
   * @param {string} email - Email del usuario
   * @param {string} code - Código de 6 dígitos
   */
  async verifyResetCode(email, code) {
    try {
      const response = await api.post('/auth/verify-reset-code', { 
        email, 
        code 
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Código expirado');
      } else if (error.response?.status === 401) {
        throw new Error(error.response.data.message || 'Código inválido');
      } else if (error.response?.status === 429) {
        throw new Error('Demasiados intentos fallidos');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al verificar el código');
      }
    }
  },

  /**
   * Paso 3: Restablecer contraseña
   * @param {Object} data - { token, password, email }
   */
  async resetPassword(data) {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Contraseña inválida');
      } else if (error.response?.status === 401) {
        throw new Error('Token expirado. Solicita un nuevo código');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Error al restablecer la contraseña');
      }
    }
  },

  // ============================================
  // SESIÓN
  // ============================================

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtener token actual
  getToken() {
    return localStorage.getItem('token');
  }
};

export default authService;