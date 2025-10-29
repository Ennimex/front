<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Registro de Usuario</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Usuario</label>
          <input 
            v-model="formData.username" 
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
              v-model="formData.password" 
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
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>Confirmar Contraseña</label>
          <div class="password-input-container">
            <input 
              v-model="formData.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="Confirma tu contraseña"
              @blur="validateConfirmPassword"
              :class="{ 'input-error': errors.confirmPassword }"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="formData.email" 
            type="email" 
            required
            placeholder="tu@email.com"
            @blur="validateEmail"
            :class="{ 'input-error': errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>Teléfono (opcional)</label>
          <div class="phone-input-container">
            <select 
              v-model="selectedCountry"
              class="country-select"
              :title="selectedCountry.name"
            >
              <option 
                v-for="country in countries" 
                :key="country.code" 
                :value="country"
              >
                {{ country.flag }} {{ country.code }}
              </option>
            </select>
            <input 
              v-model="formData.phone" 
              type="tel"
              placeholder="1234567890"
              @blur="validatePhone"
              :class="{ 'input-error': errors.phone }"
              class="phone-input"
            />
          </div>
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
      </form>

      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <router-link to="/login" class="link">
        ¿Ya tienes cuenta? Inicia sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';
import { authService } from '@/services/auth';

const router = useRouter();

// Lista de países con sus códigos telefónicos
const countries = [
  { code: '+52', name: 'México', flag: '🇲🇽' },
  { code: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' }
].sort((a, b) => a.name.localeCompare(b.name));

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
});

const selectedCountry = ref(countries.find(c => c.code === '+52') || countries[0]);

const errors = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: ''
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const loading = ref(false);
const message = ref('');
const messageType = ref('');

// Validaciones
const validateUsername = () => {
  if (formData.value.username.length < 4) {
    errors.value.username = 'El usuario debe tener al menos 4 caracteres';
    return false;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(formData.value.username)) {
    errors.value.username = 'El usuario solo puede contener letras, números y guiones bajos';
    return false;
  }
  errors.value.username = '';
  return true;
};

const validatePassword = () => {
  if (formData.value.password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres';
    return false;
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.value.password)) {
    errors.value.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    return false;
  }
  errors.value.password = '';
  validateConfirmPassword();
  return true;
};

const validateConfirmPassword = () => {
  if (!formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirma tu contraseña';
    return false;
  }
  if (formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden';
    return false;
  }
  errors.value.confirmPassword = '';
  return true;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.value.email)) {
    errors.value.email = 'Ingresa un email válido';
    return false;
  }
  errors.value.email = '';
  return true;
};

const validatePhone = () => {
  if (formData.value.phone) {
    const phoneRegex = /^[1-9]\d{9,14}$/;
    if (!phoneRegex.test(formData.value.phone)) {
      errors.value.phone = 'Ingresa un número de teléfono válido (solo números, mínimo 10 dígitos)';
      return false;
    }
  }
  errors.value.phone = '';
  return true;
};

const validateForm = () => {
  const isUsernameValid = validateUsername();
  const isPasswordValid = validatePassword();
  const isConfirmPasswordValid = validateConfirmPassword();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();

  return isUsernameValid && isPasswordValid && isConfirmPasswordValid && isEmailValid && isPhoneValid;
};

const handleRegister = async () => {
  if (!validateForm()) {
    message.value = 'Por favor, corrige los errores en el formulario';
    messageType.value = 'error';
    return;
  }

  const dataToSend = { ...formData.value };
  if (dataToSend.phone) {
    dataToSend.phone = selectedCountry.value.code + dataToSend.phone;
  }

  loading.value = true;
  message.value = '';

  try {
    const response = await authService.register(dataToSend);
    message.value = response.message;
    messageType.value = 'success';
    
    setTimeout(() => {
      router.push({
        name: 'mfa-setup',
        params: { 
          userId: response.userId 
        },
        query: {
          username: formData.value.username,
          phone: dataToSend.phone
        }
      });
    }, 1000);
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al registrar';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

h2 {
  margin-bottom: 30px;
  color: #333;
  text-align: center;
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

.phone-input-container {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.country-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  min-width: 110px;
  transition: border-color 0.3s;
}

.country-select:focus {
  outline: none;
  border-color: #667eea;
}

.phone-input {
  flex: 1;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: #667eea;
  color: white;
  margin-top: 10px;
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