<template>
  <div class="verification-container">
    <div class="verification-card">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h2>Verifica tu correo electrónico</h2>
      <p class="email-sent">Hemos enviado un código de verificación a:</p>
      <p class="email-address">{{ email }}</p>
      
      <!-- Contador visual -->
      <div class="timer-container">
        <div class="timer-circle" :class="{ 'warning': timeLeft < 120, 'critical': timeLeft < 60 }">
          <svg class="timer-svg" viewBox="0 0 100 100">
            <circle class="timer-background" cx="50" cy="50" r="45"></circle>
            <circle 
              class="timer-progress" 
              cx="50" 
              cy="50" 
              r="45"
              :style="{ strokeDashoffset: circleOffset }"
            ></circle>
          </svg>
          <div class="timer-text">
            <span class="time">{{ formattedTime }}</span>
            <span class="label">restantes</span>
          </div>
        </div>
      </div>
      
      <div v-if="timeLeft > 0" class="status-message">
        <p>Ingresa el código que recibiste</p>
      </div>
      <div v-else class="status-message expired">
        <p>⚠️ El código ha expirado</p>
      </div>
      
      <!-- Input para código de verificación -->
      <div class="code-input-container">
        <input 
          v-for="(digit, index) in code" 
          :key="index"
          type="text"
          maxlength="1"
          class="code-input"
          :class="{ 'disabled': timeLeft <= 0 }"
          v-model="code[index]"
          @input="handleInput($event, index)"
          @keydown="handleKeyDown($event, index)"
          :ref="el => inputRefs[index] = el"
          :disabled="timeLeft <= 0"
        />
      </div>
      
      <button 
        class="verify-button"
        :disabled="!isCodeComplete || timeLeft <= 0"
        @click="handleVerify"
      >
        Verificar código
      </button>
      
      <div class="resend-container">
        <button 
          v-if="timeLeft <= 0"
          class="resend-button"
          @click="handleResend"
        >
          Reenviar código
        </button>
        <p v-else class="resend-text">
          ¿No recibiste el código? 
          <button class="link-button" @click="handleResend">Reenviar</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

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

// Estado
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const timeLeft = ref(props.expirationMinutes * 60) // En segundos
const timerId = ref(null)

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const isCodeComplete = computed(() => {
  return code.value.every(digit => digit !== '')
})

const circleOffset = computed(() => {
  const totalTime = props.expirationMinutes * 60
  const circumference = 2 * Math.PI * 45
  const progress = timeLeft.value / totalTime
  return circumference * (1 - progress)
})

// Métodos
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

const handleInput = (event, index) => {
  const value = event.target.value
  
  if (value && /^\d$/.test(value)) {
    code.value[index] = value
    
    // Mover al siguiente input
    if (index < 5) {
      inputRefs.value[index + 1]?.focus()
    }
  } else {
    code.value[index] = ''
  }
}

const handleKeyDown = (event, index) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

const handleVerify = () => {
  const verificationCode = code.value.join('')
  emit('verify', verificationCode)
}

const handleResend = () => {
  code.value = ['', '', '', '', '', '']
  timeLeft.value = props.expirationMinutes * 60
  startTimer()
  emit('resend')
  inputRefs.value[0]?.focus()
}

// Lifecycle
onMounted(() => {
  startTimer()
  inputRefs.value[0]?.focus()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.verification-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon-container {
  margin-bottom: 20px;
  color: #667eea;
}

h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 10px;
}

.email-sent {
  color: #718096;
  font-size: 14px;
  margin-bottom: 5px;
}

.email-address {
  color: #2d3748;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 30px;
}

.timer-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.timer-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.timer-background {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 8;
}

.timer-progress {
  fill: none;
  stroke: #667eea;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 282.7;
  transition: stroke-dashoffset 1s linear, stroke 0.3s ease;
}

.timer-circle.warning .timer-progress {
  stroke: #f59e0b;
}

.timer-circle.critical .timer-progress {
  stroke: #ef4444;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-text .time {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.timer-text .label {
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-message {
  margin-bottom: 20px;
}

.status-message p {
  color: #4a5568;
  font-size: 14px;
}

.status-message.expired p {
  color: #ef4444;
  font-weight: 600;
}

.code-input-container {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.code-input {
  width: 50px;
  height: 60px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.code-input.disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
}

.verify-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.verify-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.verify-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resend-container {
  margin-top: 20px;
}

.resend-text {
  color: #718096;
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
  margin-left: 4px;
}

.link-button:hover {
  color: #764ba2;
}

.resend-button {
  padding: 12px 24px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resend-button:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 640px) {
  .verification-card {
    padding: 30px 20px;
  }
  
  .code-input {
    width: 40px;
    height: 50px;
    font-size: 20px;
  }
  
  .timer-circle {
    width: 140px;
    height: 140px;
  }
  
  .timer-text .time {
    font-size: 28px;
  }
}
</style>