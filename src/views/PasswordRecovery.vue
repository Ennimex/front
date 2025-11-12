<template>
  <div class="password-recovery-view">
    <!-- Paso 1: Solicitar recuperación de contraseña -->
    <div v-if="step === 'request'" class="form-container">
      <div class="icon-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h2>Recuperar contraseña</h2>
      <p class="subtitle">Ingresa tu correo electrónico y te enviaremos un código de verificación</p>
      
      <form @submit.prevent="requestPasswordReset">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <div class="input-wrapper">
            <input 
              id="email"
              v-model="email" 
              type="email" 
              placeholder="tu@email.com"
              required
              :class="{ 'input-error': emailError }"
            />
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
          </div>
        </div>
        
        <button type="submit" :disabled="loading" class="primary-button">
          <span v-if="!loading">Enviar código</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            Enviando...
          </span>
        </button>
        
        <router-link to="/login" class="back-link">
          ← Volver al inicio de sesión
        </router-link>
      </form>
    </div>

    <!-- Paso 2: Verificar código con contador -->
    <VerificationTimer
      v-else-if="step === 'verify'"
      :email="email"
      :expiration-minutes="10"
      @verify="handleVerification"
      @resend="handleResend"
      @expired="handleExpired"
    />

    <!-- Paso 3: Establecer nueva contraseña -->
    <div v-else-if="step === 'reset'" class="form-container">
      <div class="icon-header success">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2>Crear nueva contraseña</h2>
      <p class="subtitle">Tu identidad ha sido verificada. Establece una nueva contraseña segura</p>
      
      <form @submit.prevent="resetPassword">
        <div class="form-group">
          <label for="newPassword">Nueva contraseña</label>
          <div class="input-wrapper">
            <div class="password-input-container">
              <input 
                id="newPassword"
                v-model="newPassword" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                required
                minlength="8"
                :class="{ 'input-error': passwordError }"
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
            <small v-if="!passwordError">Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número</small>
            <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirmar contraseña</label>
          <div class="input-wrapper">
            <div class="password-input-container">
              <input 
                id="confirmPassword"
                v-model="confirmPassword" 
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Repite tu contraseña"
                required
                :class="{ 'input-error': confirmError }"
              />
              <button 
                type="button" 
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                :title="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <span v-if="confirmError" class="error-text">{{ confirmError }}</span>
          </div>
        </div>
        
        <button type="submit" :disabled="loading" class="primary-button">
          <span v-if="!loading">Restablecer contraseña</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            Guardando...
          </span>
        </button>
      </form>
    </div>

    <!-- Paso 4: Confirmación exitosa -->
    <div v-else-if="step === 'success'" class="form-container success-container">
      <div class="icon-header success">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h2>¡Contraseña actualizada!</h2>
      <p class="subtitle">Tu contraseña ha sido restablecida exitosamente</p>
      
      <button @click="goToLogin" class="primary-button">
        Iniciar sesión
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import VerificationTimer from '@/components/VerificationTimer.vue'
import { authService } from '@/services/auth'

const router = useRouter()

const step = ref('request') // 'request', 'verify', 'reset', 'success'
const email = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const verificationToken = ref('')

// Errores individuales
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

// Validaciones
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'El correo electrónico es requerido'
    return false
  }
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Ingresa un correo electrónico válido'
    return false
  }
  emailError.value = ''
  return true
}

const validatePassword = () => {
  if (newPassword.value.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
    return false
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword.value)) {
    passwordError.value = 'Debe contener mayúscula, minúscula y número'
    return false
  }
  passwordError.value = ''
  return true
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmError.value = 'Confirma tu contraseña'
    return false
  }
  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = 'Las contraseñas no coinciden'
    return false
  }
  confirmError.value = ''
  return true
}

// Paso 1: Solicitar código de recuperación
const requestPasswordReset = async () => {
  if (!validateEmail()) return

  loading.value = true
  emailError.value = ''
  
  try {
    // Ajusta esta URL a tu endpoint del backend
    await authService.forgotPassword(email.value)
    
    step.value = 'verify'
  } catch (error) {
    console.error('Error al enviar código:', error)
    
    if (error.response?.status === 404) {
      emailError.value = 'No existe una cuenta con este correo electrónico'
    } else {
      emailError.value = error.response?.data?.message || 'Error al enviar el código. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}

// Paso 2: Verificar código
const handleVerification = async (code) => {
  loading.value = true
  try {
    // Ajusta esta URL a tu endpoint del backend
    const response = await authService.verifyResetCode(email.value, code)
    
    // Guarda el token de verificación que retorna el backend
    verificationToken.value = response.token
    step.value = 'reset'
  } catch (error) {
    console.error('Error al verificar código:', error)
    alert('Código inválido o expirado. Inténtalo de nuevo.')
  } finally {
    loading.value = false
  }
}

// Reenviar código
const handleResend = async () => {
  try {
    await authService.forgotPassword(email.value)
    console.log('Código reenviado exitosamente')
  } catch (error) {
    console.error('Error al reenviar código:', error)
    alert('Error al reenviar el código')
  }
}

// Código expirado
const handleExpired = () => {
  console.log('El código ha expirado')
  alert('El código ha expirado. Por favor, solicita uno nuevo.')
}

// Paso 3: Restablecer contraseña
const resetPassword = async () => {
  passwordError.value = ''
  confirmError.value = ''
  
  // Validaciones
  const isPasswordValid = validatePassword()
  const isConfirmValid = validateConfirmPassword()
  
  if (!isPasswordValid || !isConfirmValid) return

  loading.value = true
  try {
    // Ajusta esta URL a tu endpoint del backend
    await authService.resetPassword({
      token: verificationToken.value,
      password: newPassword.value,
      email: email.value
    })
    
    step.value = 'success'
  } catch (error) {
    console.error('Error al restablecer contraseña:', error)
    passwordError.value = error.response?.data?.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

// Ir al login
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.password-recovery-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.form-container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.icon-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  color: #667eea;
}

.icon-header.success {
  color: #10b981;
}

h2 {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #718096;
  font-size: 14px;
  margin-bottom: 30px;
  line-height: 1.5;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  margin-bottom: 5px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  min-height: 46px;
  padding-bottom: 22px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-error {
  border-color: #dc3545;
  background-color: #fff8f8;
}

small {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 11px;
  color: #718096;
  line-height: 1.4;
}

.error-text {
  position: absolute;
  left: 0;
  bottom: 0;
  color: #dc3545;
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  padding-top: 2px;
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
  z-index: 1;
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
}

.primary-button {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.back-link {
  display: block;
  text-align: center;
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 10px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.success-container {
  text-align: center;
}

@media (max-width: 640px) {
  .form-container {
    padding: 30px 20px;
  }
  
  h2 {
    font-size: 24px;
  }
}
</style>