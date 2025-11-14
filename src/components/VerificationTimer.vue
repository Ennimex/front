<template>
  <div class="verification-container">
    <div class="verification-header">
      <div class="icon-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
          <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      </div>
      
      <h2>Verifica tu código</h2>
      <p class="subtitle">
        Ingresa el código de 6 dígitos enviado a<br>
        <strong>{{ email }}</strong>
      </p>
    </div>

    <!-- Timer -->
    <div class="timer-container">
      <div class="timer-display" :class="{ 'timer-warning': timeRemaining <= 60 }">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>{{ formattedTime }}</span>
      </div>
      <p class="timer-label">Tiempo restante</p>
    </div>

    <!-- Input de código -->
    <form @submit.prevent="verifyCode">
      <div class="form-group">
        <label for="code">Código de verificación</label>
        <div class="input-wrapper">
          <input 
            id="code"
            v-model="code" 
            type="text" 
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="000000"
            required
            :disabled="isExpired"
            :class="{ 'input-error': error }"
            @input="handleInput"
          />
          <span v-if="error" class="error-text">{{ error }}</span>
        </div>
      </div>

      <!-- Slot para contenido extra (checkbox de recordar dispositivo) -->
      <slot name="extra-content"></slot>

      <button 
        type="submit" 
        :disabled="loading || isExpired || code.length !== 6" 
        class="primary-button"
      >
        <span v-if="!loading">Verificar código</span>
        <span v-else class="loading">
          <span class="spinner"></span>
          Verificando...
        </span>
      </button>
    </form>

    <!-- Opciones de reenvío -->
    <div class="resend-section">
      <p v-if="!isExpired" class="resend-text">
        ¿No recibiste el código?
      </p>
      <p v-else class="expired-text">
        El código ha expirado
      </p>
      
      <button 
        @click="handleResend" 
        :disabled="resendLoading"
        class="link-button"
      >
        <span v-if="!resendLoading">Reenviar código</span>
        <span v-else class="loading">
          <span class="spinner-small"></span>
          Reenviando...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  email: {
    type: String,
    required: true
  },
  expirationMinutes: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['verify', 'resend', 'expired'])

const code = ref('')
const error = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const timeRemaining = ref(props.expirationMinutes * 60) // en segundos
const isExpired = ref(false)
let timerInterval = null

// Formato del tiempo restante (MM:SS)
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Validar solo números
const handleInput = (e) => {
  code.value = e.target.value.replace(/[^0-9]/g, '')
  error.value = ''
}

// Iniciar temporizador
const startTimer = () => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      isExpired.value = true
      clearInterval(timerInterval)
      emit('expired')
    }
  }, 1000)
}

// Verificar código
const verifyCode = async () => {
  if (code.value.length !== 6) {
    error.value = 'El código debe tener 6 dígitos'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await emit('verify', code.value)
  } catch (err) {
    error.value = 'Código inválido o expirado'
  } finally {
    loading.value = false
  }
}

// Reenviar código
const handleResend = async () => {
  resendLoading.value = true
  
  try {
    await emit('resend')
    
    // Reiniciar temporizador
    timeRemaining.value = props.expirationMinutes * 60
    isExpired.value = false
    code.value = ''
    error.value = ''
    
    clearInterval(timerInterval)
    startTimer()
  } catch (err) {
    error.value = 'Error al reenviar el código'
  } finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.verification-container {
  width: 100%;
}

.verification-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
}

h2 {
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 10px;
  color: var(--text-color);
}

.subtitle {
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.6;
}

.subtitle strong {
  color: var(--text-color);
  font-weight: 600;
}

/* Timer */
.timer-container {
  text-align: center;
  margin-bottom: 30px;
}

.timer-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border-radius: 50px;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.timer-display.timer-warning {
  background: linear-gradient(135deg, var(--warning-color) 0%, var(--error-color) 100%);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.timer-label {
  color: var(--text-light);
  font-size: 0.75rem;
  margin: 0;
}

/* Form */
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  min-height: 46px;
  padding-bottom: 22px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5em;
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: var(--text-color);
  background-color: #ffffff;
}

input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

input::placeholder {
  color: var(--text-light);
  opacity: 0.4;
}

input:disabled {
  background-color: var(--bg-light);
  cursor: not-allowed;
  opacity: 0.6;
}

.input-error {
  border-color: var(--error-color);
  background-color: #fff8f8;
}

.error-text {
  position: absolute;
  left: 0;
  bottom: 0;
  color: var(--error-color);
  font-size: 0.75rem;
  line-height: 1.4;
  margin: 0;
  padding-top: 2px;
  text-align: center;
  width: 100%;
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

/* Buttons */
.primary-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
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

.link-button {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 8px;
  transition: all 0.3s ease;
}

.link-button:hover:not(:disabled) {
  color: var(--primary-hover);
  text-decoration: underline;
}

.link-button:disabled {
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

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Resend section */
.resend-section {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.resend-text {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 12px;
}

.expired-text {
  color: var(--error-color);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 12px;
}

/* Responsive */
@media (max-width: 640px) {
  h2 {
    font-size: 1.5rem;
  }
  
  .timer-display {
    font-size: 1.125rem;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  h2 {
    font-size: 1.35rem;
  }
  
  .icon-circle {
    width: 56px;
    height: 56px;
  }
  
  input {
    font-size: 1.125rem;
    letter-spacing: 0.3em;
  }
}
</style>