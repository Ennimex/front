// services/auth.js
// frontend
import api from './api';

export const authService = {
  // ============================================
  // GESTIÓN DE DISPOSITIVO CONFIABLE
  // ============================================
  
  // Obtener o generar deviceId
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    console.log('🔍 Obteniendo deviceId:', deviceId ? deviceId.substring(0, 10) + '...' : 'ninguno');
    return deviceId || null;
  },

  // Guardar deviceId cuando el usuario marca "Recordar dispositivo"
  saveDeviceId(deviceId) {
    if (deviceId) {
      localStorage.setItem('deviceId', deviceId);
      console.log('💾 DeviceId guardado:', deviceId.substring(0, 10) + '...');
    }
  },

  // Limpiar deviceId (al cerrar sesión o cambiar contraseña)
  clearDeviceId() {
    localStorage.removeItem('deviceId');
    console.log('🗑️ DeviceId eliminado');
  },

  // ============================================
  // REGISTRO Y LOGIN
  // ============================================
  
  // Registro
  async register(userData) {
    try {
      console.log('📝 Registrando usuario...');
      const response = await api.post('/auth/register', userData);
      console.log('✅ Usuario registrado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw error;
    }
  },

  // Login - Paso 1: Validar credenciales (✅ con deviceId)
  async login(credentials) {
    try {
      const deviceId = this.getDeviceId();
      
      console.log('🔐 Intentando login:', {
        username: credentials.username,
        tieneDeviceId: !!deviceId
      });
      
      const response = await api.post('/auth/login', {
        ...credentials,
        deviceId // ✅ Enviar deviceId si existe
      });
      
      console.log('✅ Respuesta del servidor:', {
        requiresMFA: response.data.requiresMFA,
        deviceTrusted: response.data.deviceTrusted,
        mfaMethods: response.data.mfaMethods
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      
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
    try {
      console.log('📤 Solicitando OTP:', { userId, method });
      const response = await api.post('/auth/request-otp', { userId, method });
      console.log('✅ OTP solicitado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al solicitar OTP:', error.response?.data || error.message);
      throw error;
    }
  },

  // Paso 3: Verificar OTP (✅ con opción de recordar dispositivo)
  async verifyOTP(data) {
    try {
      console.log('📤 Enviando verificación OTP al backend:', {
        userId: data.userId,
        method: data.method,
        rememberDevice: data.rememberDevice,
        otpLength: data.otp?.length
      });
      
      const response = await api.post('/auth/verify-otp', data);
      
      console.log('📥 Respuesta del backend:', {
        hasToken: !!response.data.token,
        hasDeviceId: !!response.data.deviceId,
        message: response.data.message
      });
      
      // ✅ Guardar token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token guardado en localStorage');
        
        // Verificar que se guardó correctamente
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          console.log('✅ Verificación: Token existe en localStorage');
        } else {
          console.error('❌ ADVERTENCIA: Token no se guardó correctamente');
        }
      } else {
        console.warn('⚠️ No se recibió token del backend');
      }
      
      // ✅ Si el backend devuelve un deviceId, guardarlo
      if (response.data.deviceId) {
        this.saveDeviceId(response.data.deviceId);
        console.log('✅ DeviceId guardado:', response.data.deviceId.substring(0, 10) + '...');
        
        // Verificar que se guardó correctamente
        const savedDeviceId = localStorage.getItem('deviceId');
        if (savedDeviceId) {
          console.log('✅ Verificación: DeviceId existe en localStorage');
        } else {
          console.error('❌ ADVERTENCIA: DeviceId no se guardó correctamente');
        }
      } else if (data.rememberDevice) {
        console.warn('⚠️ Se marcó "recordar dispositivo" pero no se recibió deviceId del backend');
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en verifyOTP:', error.response?.data || error.message);
      throw error;
    }
  },

  // ============================================
  // CONFIGURACIÓN MFA
  // ============================================

  // Habilitar MFA por Email
  async enableMFAEmail(userId) {
    try {
      console.log('📧 Habilitando MFA por email...');
      const response = await api.post('/auth/enable-mfa-email', { userId });
      console.log('✅ MFA por email habilitado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al habilitar MFA por email:', error.response?.data || error.message);
      throw error;
    }
  },

  // Habilitar MFA por SMS
  async enableMFASMS(userId, phone) {
    try {
      console.log('📱 Habilitando MFA por SMS...');
      const response = await api.post('/auth/enable-mfa-sms', { userId, phone });
      console.log('✅ MFA por SMS habilitado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al habilitar MFA por SMS:', error.response?.data || error.message);
      throw error;
    }
  },

  // Habilitar MFA por App
  async enableMFAApp(userId) {
    try {
      console.log('📱 Habilitando MFA por app...');
      const response = await api.post('/auth/enable-mfa-app', { userId });
      console.log('✅ MFA por app habilitado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al habilitar MFA por app:', error.response?.data || error.message);
      throw error;
    }
  },

  // Obtener métodos MFA configurados
  async getMFAMethods(userId) {
    try {
      console.log('🔍 Obteniendo métodos MFA...');
      const response = await api.get(`/auth/mfa-methods/${userId}`);
      console.log('✅ Métodos MFA obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener métodos MFA:', error.response?.data || error.message);
      throw error;
    }
  },

  // Deshabilitar un método MFA
  async disableMFAMethod(userId, method) {
    try {
      console.log('🔒 Deshabilitando método MFA:', method);
      const response = await api.post('/auth/disable-mfa-method', { userId, method });
      console.log('✅ Método MFA deshabilitado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al deshabilitar método MFA:', error.response?.data || error.message);
      throw error;
    }
  },

  // ============================================
  // 🆕 GESTIÓN DE DISPOSITIVOS CONFIABLES
  // ============================================

  // Ver dispositivos confiables
  async getTrustedDevices(userId) {
    try {
      console.log('🔍 Obteniendo dispositivos confiables...');
      const response = await api.get(`/auth/trusted-devices/${userId}`);
      console.log('✅ Dispositivos confiables obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener dispositivos:', error.response?.data || error.message);
      throw error;
    }
  },

  // Revocar todos los dispositivos confiables
  async revokeAllDevices(userId) {
    try {
      console.log('🗑️ Revocando todos los dispositivos...');
      const response = await api.post('/auth/revoke-all-devices', { userId });
      this.clearDeviceId(); // Limpiar el deviceId local también
      console.log('✅ Todos los dispositivos revocados');
      return response.data;
    } catch (error) {
      console.error('❌ Error al revocar dispositivos:', error.response?.data || error.message);
      throw error;
    }
  },

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  /**
   * Paso 1: Solicitar código de recuperación por email
   * @param {string} email - Email del usuario
   */
  async forgotPassword(email) {
    try {
      console.log('📧 Solicitando código de recuperación para:', email);
      const response = await api.post('/auth/forgot-password', { email });
      console.log('✅ Código de recuperación enviado');
      return response.data;
    } catch (error) {
      console.error('❌ Error en forgot-password:', error.response?.data || error.message);
      
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
      console.log('🔍 Verificando código de recuperación...');
      const response = await api.post('/auth/verify-reset-code', { 
        email, 
        code 
      });
      console.log('✅ Código verificado exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al verificar código:', error.response?.data || error.message);
      
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
      console.log('🔒 Restableciendo contraseña...');
      const response = await api.post('/auth/reset-password', data);
      
      // ✅ Limpiar deviceId al cambiar contraseña (seguridad)
      this.clearDeviceId();
      
      console.log('✅ Contraseña restablecida exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al restablecer contraseña:', error.response?.data || error.message);
      
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
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    // ✅ NO limpiar deviceId al cerrar sesión (queremos que permanezca)
    // Solo se limpia cuando el usuario revoca dispositivos o cambia contraseña
    console.log('✅ Sesión cerrada (deviceId preservado)');
  },

  // Verificar si está autenticado
  isAuthenticated() {
    const hasToken = !!localStorage.getItem('token');
    console.log('🔍 Usuario autenticado:', hasToken);
    return hasToken;
  },

  // Obtener token actual
  getToken() {
    const token = localStorage.getItem('token');
    console.log('🔍 Obteniendo token:', token ? 'existe' : 'no existe');
    return token;
  }
};

export default authService;