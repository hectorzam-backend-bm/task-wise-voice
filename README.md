# Task Wise Voice

Una aplicación de asistente de voz para gestión de tareas que utiliza inteligencia artificial para procesar comandos de voz y crear actividades en proyectos.

## Características

- 🎤 **Reconocimiento de Voz**: Soporte para Web Speech API y OpenAI Whisper
- 🤖 **IA Integrada**: Procesamiento de comandos con LangChain y OpenAI
- 🎨 **UI Moderna**: Interfaz con Tailwind CSS v4 y tema personalizable
- 🌙 **Modo Oscuro/Claro**: Toggle de tema integrado
- 📊 **API Real**: Integración con endpoints de TaskWise
- 🔒 **HTTPS**: Soporte completo para desarrollo seguro

## Configuración

### 1. Variables de Entorno

TaskWise Voice utiliza variables de entorno siguiendo las mejores prácticas de Next.js:

#### Configuración Inicial

1. **Copia el archivo de ejemplo**:

   ```bash
   cp .env.example .env.local
   ```

2. **Configura las variables requeridas** en `.env.local`:

```bash
# OpenAI Configuration (Required - Server-side only)
OPENAI_API_KEY="tu_api_key_de_openai"

# TaskWise API Configuration (Required - Client-side accessible)
NEXT_PUBLIC_API_URL="https://tu-api-taskwise.com/api"

# LangSmith Configuration (Optional - for development debugging)
LANGSMITH_TRACING="true"
LANGSMITH_API_KEY="tu_langsmith_api_key"
LANGSMITH_PROJECT="tu_proyecto"
```

#### Jerarquía de Archivos de Entorno

Next.js carga las variables de entorno en el siguiente orden:

1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (No se carga cuando `NODE_ENV` es `test`)
4. `.env.$(NODE_ENV)`
5. `.env`

#### Tipos de Variables

- **Server-side only**: Variables sin prefijo (ej: `OPENAI_API_KEY`)
- **Client-side**: Variables con prefijo `NEXT_PUBLIC_` (ej: `NEXT_PUBLIC_API_URL`)

> ⚠️ **Importante**: Las variables `NEXT_PUBLIC_` son visibles en el navegador. Nunca pongas secretos ahí.

#### Variables Requeridas

| Variable              | Tipo   | Descripción                                 |
| --------------------- | ------ | ------------------------------------------- |
| `OPENAI_API_KEY`      | Server | API key de OpenAI para transcripción de voz |
| `NEXT_PUBLIC_API_URL` | Client | URL de tu API de TaskWise                   |

#### Variables Opcionales

| Variable            | Tipo   | Descripción                        |
| ------------------- | ------ | ---------------------------------- |
| `LANGSMITH_TRACING` | Server | Habilita trazabilidad de LangChain |
| `LANGSMITH_API_KEY` | Server | API key de LangSmith               |
| `LANGSMITH_PROJECT` | Server | Nombre del proyecto en LangSmith   |

### 2. Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo (con HTTPS)
pnpm dev

# Ejecutar en desarrollo (HTTP)
pnpm dev:http
```

### 3. API Integration

La aplicación está configurada para trabajar con los siguientes endpoints:

- `GET /projects/` - Listar proyectos
- `GET /projects/{id}/modules` - Obtener módulos de un proyecto
- `GET /projects/{id}/phases` - Obtener fases de un proyecto
- `GET /projects/{id}/users` - Obtener usuarios de un proyecto

### 4. Uso del Asistente de Voz

1. **Configura tu token de API** en la interfaz
2. **Permite acceso al micrófono** cuando se solicite
3. **Habla comandos** como:

#### Comandos para Crear Tareas:

**Comando mínimo** (solo proyecto y título):

- "Crear tarea revisar diseño en proyecto TaskWise"
- "Crea una tarea llamada actualizar base de datos en el proyecto Kronos"

**Comando completo** (con módulo, fase y usuario):

- "Crear tarea revisar diseño en proyecto TaskWise módulo frontend fase desarrollo para Ana"
- "Crea una tarea llamada optimizar queries en proyecto Database módulo backend fase testing para Carlos"

**Comando parcial** (solo algunos elementos opcionales):

- "Crear tarea revisar API en proyecto Mobile para Juan"
- "Crea tarea diseñar mockups en proyecto Web módulo frontend"

#### Comandos para Buscar Proyectos:

- "Buscar proyecto Kronos"
- "Encuentra el proyecto TaskWise"

> 💡 **Tip**: Si no especificas módulo, fase o usuario, el sistema usará automáticamente la primera opción disponible en el proyecto.

## Desarrollo

### Scripts Disponibles

- `pnpm dev` - Servidor de desarrollo con HTTPS
- `pnpm dev:http` - Servidor de desarrollo con HTTP
- `pnpm build` - Construir para producción
- `pnpm start` - Ejecutar versión de producción
- `pnpm lint` - Verificar código con ESLint
- `pnpm typecheck` - Verificar tipos con TypeScript

### Estructura del Proyecto

```
src/
├── ai/                    # Flujos de IA con LangChain
├── app/                   # App Router de Next.js
├── components/            # Componentes de UI
├── hooks/                 # Hooks personalizados
├── lib/                   # Utilidades y API
│   ├── types/            # Tipos TypeScript
│   ├── api.ts            # Cliente de API
│   └── utils.ts          # Utilidades
└── config/               # Configuración
```

## Tecnologías

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **AI**: LangChain + OpenAI
- **Voice**: Web Speech API + Whisper
- **Language**: TypeScript
- **Package Manager**: pnpm
