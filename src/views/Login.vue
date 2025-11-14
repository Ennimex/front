<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-header">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Iniciar Sesión</h2>
      </div>
      
      <!-- Formulario de credenciales -->
      <form v-if="!requiresMFA" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Usuario</label>
          <div class="input-wrapper">
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
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <div class="input-wrapper">
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
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Ingresar</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            Ingresando...
          </span>
        </button>

        <!-- Link de recuperación de contraseña -->
        <div class="forgot-password-container">
          <router-link to="/forgot-password" class="forgot-password-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Enlaces de navegación -->
        <div class="auth-links">
          <router-link to="/register" class="link">
            ¿No tienes cuenta? Regístrate
          </router-link>
        </div>
      </form>

      <!-- Selección de método MFA -->
      <div v-else-if="showMFASelection" class="mfa-selection">
        <h3>Selecciona un método de verificación</h3>
        
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <div class="mfa-methods">
          <button 
            v-for="method in availableMFAMethods" 
            :key="method"
            @click="selectMFAMethod(method)"
            class="mfa-method-btn"
            :disabled="loading"
          >
            <svg v-if="method === 'email'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <svg v-if="method === 'sms'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <svg v-if="method === 'app'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
            <span v-if="method === 'email'">Correo Electrónico</span>
            <span v-if="method === 'sms'">SMS</span>
            <span v-if="method === 'app'">Aplicación Autenticador</span>
          </button>
        </div>
        <button type="button" @click="resetForm" class="btn-secondary">
          Volver
        </button>
      </div>

      <!-- Componente de verificación OTP con contador (para email y SMS) -->
      <VerificationTimer
        v-else-if="showOTPInput && (mfaMethod === 'email' || mfaMethod === 'sms')"
        :email="getUserContact"
        :expiration-minutes="10"
        @verify="handleVerifyOTP"
        @resend="handleResendOTP"
        @expired="handleOTPExpired"
      >
        <template #extra-content>
          <div class="remember-device-container">
            <label class="remember-device-label">
              <input 
                type="checkbox" 
                v-model="rememberDevice"
                class="remember-checkbox"
              />
              <span>Recordar este dispositivo por 30 días</span>
            </label>
          </div>
        </template>
      </VerificationTimer>

      <!-- Formulario OTP simple (para aplicación autenticadora) -->
      <form v-else-if="showOTPInput && mfaMethod === 'app'" @submit.prevent="handleVerifyOTPApp">
        <div class="otp-info">
          <p>Ingresa el código de tu aplicación de autenticación</p>
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

        <div class="remember-device-container">
          <label class="remember-device-label">
            <input 
              type="checkbox" 
              v-model="rememberDevice"
              class="remember-checkbox"
            />
            <span>Recordar este dispositivo por 30 días</span>
          </label>
        </div>

        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Verificar Código</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            Verificando...
          </span>
        </button>

        <button type="button" @click="backToMethodSelection" class="btn-secondary">
          Cambiar método
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth';
import VerificationTimer from '@/components/VerificationTimer.vue';

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
const rememberDevice = ref(false);

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
const userContact = ref('');

const getUserContact = computed(() => {
  return userContact.value || 'tu dispositivo';
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

    if (!response.requiresMFA) {
      if (response.token) {
        localStorage.setItem('token', response.token);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await router.push('/dashboard');
      return;
    }

    userId.value = response.userId;
    availableMFAMethods.value = response.mfaMethods;
    
    if (response.email) userContact.value = response.email;
    if (response.phone) userContact.value = response.phone;

    requiresMFA.value = true;
    showMFASelection.value = true;
    message.value = 'Por favor, selecciona un método de verificación';
    messageType.value = 'info';
  } catch (error) {
    console.error('Error de inicio de sesión:', error);
    message.value = error.response?.data?.message || error.message || 'Error al iniciar sesión';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const selectMFAMethod = async (method) => {
  try {
    loading.value = true;
    message.value = '';
    
    await authService.requestOTP(userId.value, method);
    
    mfaMethod.value = method;
    showMFASelection.value = false;
    showOTPInput.value = true;
    
    if (method === 'app') {
      message.value = 'Ingresa el código de tu aplicación autenticador';
      messageType.value = 'info';
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
  rememberDevice.value = false;
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
  rememberDevice.value = false;
};

const handleVerifyOTP = async (code) => {
  try {
    loading.value = true;

    const response = await authService.verifyOTP({
      userId: userId.value,
      otp: code,
      method: mfaMethod.value,
      rememberDevice: rememberDevice.value
    });
    
    if (!response.token) {
      throw new Error('No se recibió el token de autenticación');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    await router.push('/dashboard');
    
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Código OTP inválido';
    message.value = errorMsg;
    messageType.value = 'error';
    alert(errorMsg);
  } finally {
    loading.value = false;
  }
};

const handleVerifyOTPApp = async () => {
  if (!otpCode.value || otpCode.value.length !== 6 || !/^\d+$/.test(otpCode.value)) {
    message.value = 'Ingresa un código válido de 6 dígitos';
    messageType.value = 'error';
    return;
  }
  await handleVerifyOTP(otpCode.value);
};

const handleResendOTP = async () => {
  try {
    await authService.requestOTP(userId.value, mfaMethod.value);
  } catch (error) {
    alert('Error al reenviar el código');
  }
};

const handleOTPExpired = () => {
  alert('El código ha expirado. Solicita uno nuevo.');
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  padding: 20px;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
}

.logo-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
}

h2, h3 {
  color: var(--text-color);
  text-align: center;
  font-weight: 700;
}

h2 {
  font-size: 1.75rem;
  margin: 0;
}

h3 {
  font-size: 1.125rem;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 600;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: var(--text-color);
  background-color: white;
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
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: var(--text-light);
  z-index: 1;
}

.toggle-password:hover {
  background-color: var(--bg-light);
  color: var(--text-color);
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input::placeholder {
  color: var(--text-light);
}

.input-error {
  border-color: var(--error-color);
  background-color: #fff8f8;
}

.error-text {
  display: block;
  color: var(--error-color);
  font-size: 0.75rem;
  margin-top: 6px;
  line-height: 1.4;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.remember-device-container {
  margin: 16px 0 12px 0;
  padding: 12px;
  background: var(--bg-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.remember-device-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-color);
  flex-shrink: 0;
}

.remember-device-label span {
  color: var(--text-color);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.forgot-password-container {
  text-align: center;
  margin-top: 16px;
}

.forgot-password-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.forgot-password-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

.otp-input {
  text-align: center;
  font-size: 1.5rem;
  letter-spacing: 0.5em;
  font-weight: 700;
  padding-left: 24px;
}

.otp-info {
  background: var(--bg-light);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.otp-info p {
  margin: 0;
  color: var(--info-color);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.4;
}

.mfa-selection {
  width: 100%;
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
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: white;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mfa-method-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: var(--bg-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.mfa-method-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  margin-bottom: 0;
}

.btn-secondary {
  margin-top: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: var(--text-color);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-light);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message {
  margin: 12px 0 16px 0;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
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
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.message.error {
  background: rgba(220, 53, 69, 0.1);
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.message.info {
  background: rgba(0, 102, 204, 0.1);
  color: var(--info-color);
  border: 1px solid var(--info-color);
}

.auth-links {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .login-card {
    padding: 30px 20px;
  }
  
  h2 {
    font-size: 1.5rem;
  }

  .otp-input {
    font-size: 1.25rem;
    letter-spacing: 0.4em;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 25px 15px;
  }
  
  h2 {
    font-size: 1.35rem;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
  }

  .otp-input {
    font-size: 1.125rem;
    letter-spacing: 0.3em;
  }
}
</style>