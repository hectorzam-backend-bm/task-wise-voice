# TaskWise Voice

Una aplicación de asistente de voz para gestión de tareas que utiliza inteligencia artificial para procesar comandos de voz y crear actividades en proyectos.

## 🚀 Características

- 🎤 **Reconocimiento de Voz**: Soporte nativo para Web Speech API del navegador
- 🤖 **IA Integrada**: Procesamiento inteligente de comandos con Langchain (OpenAI)
- 🎨 **UI Moderna**: Interfaz elegante con shadcn/ui y Tailwind CSS
- 🌙 **Modo Oscuro/Claro**: Variables CSS nativas para temas personalizables
- 📱 **Diseño Responsivo**: Componentes adaptativos con sidebar colapsible
- 🔒 **Seguridad**: Tokens almacenados de forma segura en localStorage
- ⚡ **Real-time**: Transcripción y procesamiento en tiempo real
- 📊 **Mock API**: Sistema de simulación para desarrollo y testing

## 🛠️ Configuración

### 1. Variables de Entorno

Copia el archivo de configuración base:

```bash
cp .env.example .env.local
```

Configura las variables requeridas en `.env.local`:

```bash
# OpenAI Configuration (Requerido)
OPENAI_API_KEY="tu_api_key_de_openai_aqui"


# Optional: Para desarrollo y debugging
NODE_ENV="development"
```

### 2. Instalación y Ejecución

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar producción
pnpm start
```

## 🎯 Uso del Asistente

### 1. Configuración Inicial

1. **Abre la aplicación** en tu navegador
2. **Configura tu token de API** en la sección de autenticación
3. **Permite acceso al micrófono** cuando el navegador lo solicite

### 2. Comandos de Voz Soportados

#### 📝 Crear Tareas

**Comando completo** (recomendado):
```
"Crea una tarea para hacer el reporte mensual en el proyecto Kronos módulo frontend fase desarrollo para Ana"
```

**Comando simplificado**:
```
"Crear tarea revisar diseño en proyecto TaskWise"
```

**Elementos que puedes especificar**:
- **Proyecto**: Kronos, TaskWise, Interno
- **Módulo**: frontend, backend, mobile
- **Fase**: desarrollo, testing, producción
- **Usuario**: Ana, Carlos, Juan

#### 🔍 Buscar Proyectos

```
"Buscar proyecto Kronos"
"Encuentra el proyecto TaskWise"
```

### 3. Flujo de Trabajo

1. **Presiona el botón del micrófono** (círculo púrpura)
2. **Habla tu comando** claramente
3. **Observa la transcripción** en tiempo real
4. **Revisa el resultado** del procesamiento con IA
5. **Confirma la acción** realizada

## 🏗️ Arquitectura

### Estructura del Proyecto

```
src/
├── ai/
│   └── flows/
│       └── process-voice-command.ts  # Procesamiento de comandos
├── app/
│   ├── globals.css            # Estilos globales y variables CSS
│   ├── layout.tsx             # Layout raíz con fuentes
│   └── page.tsx               # Página principal
├── components/
│   ├── task-assistant.tsx     # Componente principal del asistente
│   └── ui/                    # Componentes de UI (shadcn/ui)
├── hooks/
│   ├── use-speech-recognition.ts  # Hook para reconocimiento de voz
│   ├── use-mobile.ts          # Hook para detección móvil
│   └── use-toast.ts           # Sistema de notificaciones
├── lib/
│   ├── api.ts                 # Cliente API con funciones mock
│   ├── types/                 # Definiciones de tipos TypeScript
│   └── utils.ts               # Utilidades generales
└── config/                    # Archivos de configuración
```

### Tecnologías Principales

- **Framework**: Next.js 15 con App Router
- **IA**: Langchain  (OpenAI)
- **UI**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS con variables CSS nativas
- **Voice**: Web Speech API nativa del navegador
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Fonts**: Inter (body) + Space Grotesk (headlines)

## 🎨 Diseño y Tema

### Paleta de Colores

- **Primario**: Púrpura profundo (#6750A4) - Profesionalismo e innovación
- **Fondo**: Gris claro (#F2F0F7) - Legibilidad y reducción de fatiga visual
- **Acento**: Teal (#00A3AD) - Elementos interactivos
- **Sidebar**: Variables CSS específicas para el panel lateral

### Componentes de UI

- **Cards**: Componente principal para organizar información
- **Buttons**: Estados interactivos con animaciones sutiles
- **Input/Textarea**: Campos de entrada con estados de focus
- **Toast**: Sistema de notificaciones integrado
- **Sidebar**: Panel lateral colapsible con scroll personalizado

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo
pnpm build            # Construir para producción
pnpm start            # Ejecutar build de producción
pnpm lint             # Verificar código con ESLint
pnpm typecheck        # Verificar tipos TypeScript
```

### API Mock Sistema

El proyecto incluye un sistema completo de APIs simuladas en [`src/lib/api.ts`](src/lib/api.ts):

- **Proyectos**: Kronos (ID: 101), TaskWise (ID: 102)
- **Módulos**: frontend (ID: 201), backend (ID: 888)
- **Fases**: desarrollo (ID: 301), testing (ID: 777)
- **Usuarios**: Ana (ID: 401), Carlos (ID: 666)

### Configuración de Desarrollo

1. **Node.js**: Versión especificada en [`.nvmrc`](.nvmrc)
2. **VS Code**: Configuración en [`.vscode/settings.json`](.vscode/settings.json)
3. **TypeScript**: Configuración en [`tsconfig.json`](tsconfig.json)
4. **Tailwind**: Configuración en [`postcss.config.mjs`](postcss.config.mjs)

## 🚀 Despliegue

### Firebase App Hosting

El proyecto está configurado para despliegue en Firebase con [`apphosting.yaml`](apphosting.yaml).

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables en tu plataforma de despliegue:

- `OPENAI_API_KEY`: Tu clave API de OpenAI
- `NODE_ENV`: `production`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa que tu navegador soporte Web Speech API
2. Verifica que tienes configurado el token de OpenAI
3. Asegúrate de permitir acceso al micrófono
4. Consulta la consola del navegador para errores detallados

---

**TaskWise Voice** - Tu asistente de tareas por voz. Configuración rápida, comandos naturales, resultados inmediatos.