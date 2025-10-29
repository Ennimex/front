<template>
  <div class="mfa-setup-container">
    <div class="mfa-setup-card">
      <div class="success-icon">✓</div>
      <h2>¡Registro Exitoso!</h2>
      <p class="welcome-text">Bienvenido, {{ username }}</p>
      
      <div class="mfa-section">
        <h3>Configura tu Autenticación Multifactor</h3>
        <p class="mfa-description">
          Protege tu cuenta con un segundo factor de autenticación. Elige uno de los siguientes métodos:
        </p>

        <div class="mfa-options">
          <!-- Opción Email -->
          <label class="mfa-option" for="email-mfa">
            <input 
              type="checkbox" 
              id="email-mfa" 
              v-model="selectedMethods" 
              value="email"
              class="mfa-checkbox"
            />
            <div class="mfa-content">
              <div class="mfa-option-header">
                <div class="mfa-icon">📧</div>
                <h4>Email</h4>
              </div>
              <p>Recibe códigos por correo electrónico</p>
            </div>
          </label>

          <!-- Opción App -->
          <label class="mfa-option" for="app-mfa">
            <input 
              type="checkbox" 
              id="app-mfa" 
              v-model="selectedMethods" 
              value="app"
              class="mfa-checkbox"
            />
            <div class="mfa-content">
              <div class="mfa-option-header">
                <div class="mfa-icon">📱</div>
                <h4>Aplicación Authenticator</h4>
              </div>
              <p>Usa Google Authenticator o Authy</p>
            </div>
          </label>

          <!-- Opción SMS -->
          <label class="mfa-option" :class="{ disabled: !hasPhone }" for="sms-mfa">
            <input 
              type="checkbox" 
              id="sms-mfa" 
              v-model="selectedMethods" 
              value="sms"
              :disabled="!hasPhone"
              class="mfa-checkbox"
            />
            <div class="mfa-content">
              <div class="mfa-option-header">
                <div class="mfa-icon">💬</div>
                <h4>SMS</h4>
              </div>
              <p>{{ hasPhone ? 'Recibe códigos por mensaje de texto' : 'Teléfono requerido para SMS' }}</p>
            </div>
          </label>

          <!-- Botón de configuración -->
          <button 
            class="btn-configure" 
            @click="configureMFA"
            :disabled="!selectedMethods.length || loading"
          >
            {{ loading ? 'Configurando...' : 'Configurar métodos seleccionados' }}
          </button>
        </div>

        <!-- Modal para QR Code -->
        <div v-if="showQR" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <button class="close-btn" @click="closeModal">×</button>
            <h3>Escanea este código QR</h3>
            <p>Abre Google Authenticator o Authy y escanea:</p>
            <img :src="qrCode" alt="QR Code" class="qr-image" />
            <div class="secret-container">
              <p class="secret-label">O ingresa manualmente:</p>
              <code class="secret-code">{{ secret }}</code>
            </div>
            <button @click="completeSetup" class="btn-primary">
              Continuar al Login
            </button>
          </div>
        </div>

        <!-- Mensaje de estado -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <!-- Botón para omitir -->
        <div class="skip-section">
          <button @click="skipMFA" class="btn-skip">
            Omitir por ahora
          </button>
          <p class="skip-text">Puedes configurarlo después desde tu perfil</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/auth';

const route = useRoute();
const router = useRouter();

const userId = ref('');
const username = ref('');
const phone = ref('');
const message = ref('');
const messageType = ref('');
const showQR = ref(false);
const qrCode = ref('');
const secret = ref('');
const loading = ref(false);
const selectedMethods = ref([]);

const hasPhone = computed(() => phone.value && phone.value.length > 0);

onMounted(() => {
  userId.value = route.params.userId;
  username.value = route.query.username || 'Usuario';
  phone.value = route.query.phone || '';
  
  if (!userId.value) {
    router.push('/register');
  }
});

const configureMFA = async () => {
  if (selectedMethods.value.length === 0) {
    message.value = 'Selecciona al menos un método de autenticación';
    messageType.value = 'error';
    return;
  }

  if (selectedMethods.value.includes('sms') && !hasPhone.value) {
    message.value = 'Debes proporcionar un teléfono para usar SMS';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';

  try {
    for (const method of selectedMethods.value) {
      let response;
      
      if (method === 'email') {
        response = await authService.enableMFAEmail(userId.value);
      } else if (method === 'sms') {
        response = await authService.enableMFASMS(userId.value, phone.value);
      } else if (method === 'app') {
        response = await authService.enableMFAApp(userId.value);
        qrCode.value = response.qrCode;
        secret.value = response.secret;
        
        // Si hay configuración de app, mostrar QR antes de continuar
        if (selectedMethods.value.includes('app')) {
          showQR.value = true;
          return; // Esperar a que el usuario configure la app
        }
      }
    }

    message.value = 'Métodos MFA configurados exitosamente';
    messageType.value = 'success';
    
    // Solo redirigir si no hay configuración de app pendiente
    if (!selectedMethods.value.includes('app')) {
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al configurar MFA';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  showQR.value = false;
};

const completeSetup = () => {
  showQR.value = false;
  router.push('/login');
};

const skipMFA = () => {
  router.push('/login');
};
</script>

<style scoped>
.mfa-setup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.mfa-setup-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 700px;
  width: 100%;
  text-align: center;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 20px;
}

h2 {
  color: #333;
  margin-bottom: 10px;
}

.welcome-text {
  color: #666;
  font-size: 18px;
  margin-bottom: 30px;
}

.mfa-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

h3 {
  color: #333;
  margin-bottom: 10px;
}

.mfa-description {
  color: #666;
  margin-bottom: 30px;
}

.mfa-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.mfa-option {
  display: block;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
  margin: 0;
  position: relative;
}

.mfa-option:hover:not(.disabled) {
  border-color: #667eea;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.mfa-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mfa-checkbox {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.mfa-content {
  padding-right: 40px; /* Espacio para la casilla */
}

.mfa-option.disabled .mfa-checkbox {
  cursor: not-allowed;
}

.mfa-option input[type="checkbox"]:checked ~ .mfa-content .mfa-option-header h4,
.mfa-option input[type="checkbox"]:checked ~ .mfa-content p {
  color: #667eea;
}

.mfa-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.mfa-option h4 {
  color: #333;
  margin-bottom: 5px;
}

.mfa-option p {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.btn-option {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-option:hover:not(:disabled) {
  background: #5568d3;
}

.btn-option:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.qr-image {
  max-width: 300px;
  width: 100%;
  margin: 20px 0;
}

.secret-container {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
}

.secret-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.secret-code {
  background: white;
  padding: 10px;
  border-radius: 5px;
  display: block;
  word-break: break-all;
  color: #333;
  font-family: monospace;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
  width: 100%;
}

.btn-primary:hover {
  background: #5568d3;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 5px;
}

.message.success {
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}

.skip-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-skip {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-skip:hover {
  background: #f5f5f5;
  border-color: #999;
}

.skip-text {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}
</style>
