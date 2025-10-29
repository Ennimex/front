<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar Sesión</h2>
      
      <!-- Formulario de credenciales -->
      <form v-if="!requiresMFA" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Usuario</label>
          <input 
            v-model="credentials.username" 
            type="text" 
            required
            placeholder="Ingresa tu usuario"
            @blur="validateUsername"
            :class="{ 'input-error': errors.username }"
          />
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="password-input-container">
            <input 
              v-model="credentials.password" 
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Ingresa tu contraseña"
              @blur="validatePassword"
              :class="{ 'input-error': errors.password }"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <Eye v-if="!showPassword" :size="20" />
              <EyeOff v-else :size="20" />
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <!-- Selección de método MFA -->
      <div v-else-if="showMFASelection" class="mfa-selection">
        <h3>Selecciona un método de verificación</h3>
        <div class="mfa-methods">
          <button 
            v-for="method in availableMFAMethods" 
            :key="method"
            @click="selectMFAMethod(method)"
            class="mfa-method-btn"
            :disabled="loading"
          >
            <Mail v-if="method === 'email'" :size="24" />
            <Phone v-if="method === 'sms'" :size="24" />
            <ShieldCheck v-if="method === 'app'" :size="24" />
            <span v-if="method === 'email'">Correo Electrónico</span>
            <span v-if="method === 'sms'">SMS</span>
            <span v-if="method === 'app'">Aplicación Autenticador</span>
          </button>
        </div>
        <button type="button" @click="resetForm" class="btn-secondary">
          Volver
        </button>
      </div>

      <!-- Formulario de OTP -->
      <form v-else-if="showOTPInput" @submit.prevent="handleVerifyOTP">
        <div class="otp-info">
          <p v-if="mfaMethod !== 'app'">Se ha enviado un código a tu {{ mfaMethodText }}</p>
          <p v-else>Ingresa el código de tu aplicación de autenticación</p>
        </div>

        <div class="form-group">
          <label>Código de verificación</label>
          <input 
            v-model="otpCode" 
            type="text" 
            required
            maxlength="6"
            placeholder="123456"
            class="otp-input"
            inputmode="numeric"
            pattern="[0-9]*"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Verificando...' : 'Verificar Código' }}
        </button>

        <button type="button" @click="backToMethodSelection" class="btn-secondary">
          Cambiar método
        </button>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <router-link to="/register" class="link">
        ¿No tienes cuenta? Regístrate
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff, Mail, Phone, ShieldCheck } from 'lucide-vue-next';
import { authService } from '@/services/auth';

const router = useRouter();

const credentials = ref({
  username: '',
  password: ''
});

const errors = ref({
  username: '',
  password: ''
});

const showPassword = ref(false);
const loading = ref(false);
const message = ref('');
const messageType = ref('');

const validateUsername = () => {
  if (!credentials.value.username.trim()) {
    errors.value.username = 'El usuario es requerido';
    return false;
  }
  errors.value.username = '';
  return true;
};

const validatePassword = () => {
  if (!credentials.value.password) {
    errors.value.password = 'La contraseña es requerida';
    return false;
  }
  errors.value.password = '';
  return true;
};

const requiresMFA = ref(false);
const showMFASelection = ref(false);
const showOTPInput = ref(false);
const mfaMethod = ref('');
const userId = ref(null);
const otpCode = ref('');
const availableMFAMethods = ref([]);

const mfaMethodText = computed(() => {
  const methods = {
    email: 'correo electrónico',
    sms: 'teléfono',
    app: 'aplicación de autenticación'
  };
  return methods[mfaMethod.value] || 'dispositivo';
});

const validateLoginForm = () => {
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  return isUsernameValid && isPasswordValid;
};

const handleLogin = async () => {
  if (!validateLoginForm()) {
    message.value = 'Por favor, completa todos los campos';
    messageType.value = 'error';
    return;
  }

  try {
    loading.value = true;
    message.value = '';
    
    const response = await authService.login(credentials.value);
    console.log('Respuesta del login:', response);

    if (!response.userId || !response.mfaMethods) {
      throw new Error('Respuesta incompleta del servidor');
    }

    // Guardamos la información del usuario
    userId.value = response.userId;
    availableMFAMethods.value = response.mfaMethods;

    // Si el usuario no tiene métodos MFA configurados
    if (!response.mfaMethods.length) {
      throw new Error('No tienes métodos de autenticación configurados. Por favor, configura al menos uno en tu perfil.');
    }

    // Mostramos los métodos de verificación disponibles
    requiresMFA.value = true;
    showMFASelection.value = true;
    message.value = 'Por favor, selecciona un método de verificación';
    messageType.value = 'info';
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else if (error.message) {
      message.value = error.message;
    } else {
      message.value = 'Error al iniciar sesión. Por favor, intenta nuevamente.';
    }
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const selectMFAMethod = async (method) => {
  if (!userId.value) {
    message.value = 'Error: Sesión inválida';
    messageType.value = 'error';
    return;
  }

  try {
    loading.value = true;
    message.value = '';
    console.log('Solicitando OTP para método:', method);
    
    const response = await authService.requestOTP(userId.value, method);
    console.log('Respuesta de solicitud OTP:', response);
    
    mfaMethod.value = method;
    showMFASelection.value = false;
    showOTPInput.value = true;
    
    if (method === 'app') {
      message.value = 'Por favor, ingresa el código de tu aplicación autenticador';
      messageType.value = 'info';
    } else {
      message.value = `Código enviado a tu ${mfaMethodText.value}`;
      messageType.value = 'success';
    }
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al solicitar el código';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const backToMethodSelection = () => {
  showOTPInput.value = false;
  showMFASelection.value = true;
  otpCode.value = '';
  mfaMethod.value = '';
  message.value = '';
};

const resetForm = () => {
  requiresMFA.value = false;
  showMFASelection.value = false;
  showOTPInput.value = false;
  userId.value = null;
  mfaMethod.value = '';
  otpCode.value = '';
  message.value = '';
  credentials.value = { username: '', password: '' };
  showPassword.value = false;
};

const handleVerifyOTP = async () => {
  if (!otpCode.value || otpCode.value.length !== 6 || !/^\d+$/.test(otpCode.value)) {
    message.value = 'Por favor, ingresa un código válido de 6 dígitos';
    messageType.value = 'error';
    return;
  }

  if (!userId.value || !mfaMethod.value) {
    message.value = 'Error en la verificación: información incompleta';
    messageType.value = 'error';
    return;
  }

  try {
    loading.value = true;
    message.value = '';
    
    console.log('Enviando verificación OTP:', {
      userId: userId.value,
      method: mfaMethod.value
    });

    const response = await authService.verifyOTP({
      userId: userId.value,
      otp: otpCode.value,
      method: mfaMethod.value
    });
    
    if (!response.token) {
      throw new Error('No se recibió el token de autenticación');
    }

    localStorage.setItem('token', response.token);
    message.value = 'Verificación exitosa';
    messageType.value = 'success';
    
    await router.push('/dashboard');
  } catch (error) {
    console.error('Error en la verificación OTP:', error);
    if (error.response?.data?.message) {
      message.value = error.response.data.message;
    } else if (error.message) {
      message.value = error.message;
    } else {
      message.value = 'Código OTP inválido. Por favor, intenta nuevamente.';
    }
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  width: 100%;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

h3 {
  margin-bottom: 20px;
  color: #333;
  text-align: center;
  font-size: 18px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #555;
  background-color: transparent;
}

.toggle-password:hover {
  background-color: rgba(0, 0, 0, 0.08);
  color: #333;
}

.toggle-password:active {
  transform: scale(0.95);
}

.toggle-password:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.toggle-password svg {
  display: block;
  pointer-events: none;
  flex-shrink: 0;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.input-error {
  border-color: #dc3545;
  background-color: #fff8f8;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
  display: block;
}

.otp-input {
  text-align: center;
  font-size: 24px;
  letter-spacing: 8px;
  font-weight: 600;
}

.otp-info {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #b3d9ff;
}

.otp-info p {
  margin: 0;
  color: #0066cc;
  font-weight: 500;
}

.mfa-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.mfa-method-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.mfa-method-btn:hover:not(:disabled) {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.mfa-method-btn:active:not(:disabled) {
  transform: translateY(0);
}

.mfa-method-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
  margin-bottom: 10px;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.message {
  margin-top: 15px;
  padding: 12px;
  border-radius: 5px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #5568d3;
  text-decoration: underline;
}
</style>