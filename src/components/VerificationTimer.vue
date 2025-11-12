<template>
  <div class="verification-form">
    <div class="verification-info">
      <h3>Código enviado a {{ email }}</h3>
      <p v-if="timeLeft > 0" class="timer">
        Expira en: <strong>{{ formattedTime }}</strong>
      </p>
      <p v-else class="expired-message">⚠️ El código ha expirado</p>
    </div>

    <!-- Input para código de verificación -->
    <div class="form-group">
      <label>Código de verificación</label>
      <input 
        v-model="code"
        type="text" 
        maxlength="6"
        placeholder="123456"
        class="code-input"
        inputmode="numeric"
        pattern="[0-9]*"
        :disabled="timeLeft <= 0"
        @input="validateCode"
      />
    </div>

    <!-- Slot para contenido extra (checkbox de recordar dispositivo) -->
    <slot name="extra-content"></slot>

    <button 
      type="button"
      class="btn-primary"
      :disabled="!isValidCode || timeLeft <= 0"
      @click="handleVerify"
    >
      Verificar código
    </button>

    <div class="resend-section">
      <p v-if="timeLeft > 0">
        ¿No recibiste el código? 
        <button type="button" class="link-button" @click="handleResend">
          Reenviar
        </button>
      </p>
      <button 
        v-else
        type="button"
        class="btn-secondary"
        @click="handleResend"
      >
        Solicitar nuevo código
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
    default: 5
  }
})

const emit = defineEmits(['verify', 'resend', 'expired'])

// Estado
const code = ref('')
const timeLeft = ref(props.expirationMinutes * 60) // En segundos
const timerId = ref(null)

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const isValidCode = computed(() => {
  return code.value.length === 6 && /^\d{6}$/.test(code.value)
})

// Métodos
const validateCode = (event) => {
  // Solo permitir números
  code.value = event.target.value.replace(/\D/g, '')
}

const startTimer = () => {
  timerId.value = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stopTimer()
      emit('expired')
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerId.value) {
    clearInterval(timerId.value)
    timerId.value = null
  }
}

const handleVerify = () => {
  if (isValidCode.value) {
    emit('verify', code.value)
  }
}

const handleResend = () => {
  code.value = ''
  timeLeft.value = props.expirationMinutes * 60
  startTimer()
  emit('resend')
}

// Lifecycle
onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.verification-form {
  width: 100%;
}

.verification-info {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #b3d9ff;
}

.verification-info h3 {
  margin: 0 0 8px 0;
  color: #0066cc;
  font-size: 16px;
  font-weight: 600;
}

.timer {
  margin: 0;
  color: #0066cc;
  font-size: 14px;
}

.timer strong {
  font-weight: 700;
  font-size: 16px;
}

.expired-message {
  margin: 0;
  color: #dc3545;
  font-weight: 600;
  font-size: 14px;
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

.code-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 20px;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 600;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.code-input:focus {
  outline: none;
  border-color: #667eea;
}

.code-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
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
  margin-bottom: 15px;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.resend-section {
  text-align: center;
  margin-top: 15px;
}

.resend-section p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 14px;
}

.link-button:hover {
  color: #5568d3;
}

@media (max-width: 480px) {
  .verification-info h3 {
    font-size: 14px;
  }

  .timer {
    font-size: 13px;
  }

  .code-input {
    font-size: 18px;
  }
}
</style>