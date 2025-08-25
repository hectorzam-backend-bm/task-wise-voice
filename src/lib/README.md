# API Types Documentation

## Overview

Este archivo documenta los tipos mejorados para el manejo de argumentos en las APIs del sistema.

## Tipos Principales

### CreateActivityArgs

Schema para crear una nueva actividad/tarea:

```typescript
{
  projectName: string;     // REQUERIDO - Nombre del proyecto
  title: string;          // REQUERIDO - Título de la tarea
  userName: string;        // REQUERIDO - Nombre del usuario responsable
  moduleName?: string;     // OPCIONAL - Nombre del módulo
  phaseName?: string;      // OPCIONAL - Nombre de la fase
  estimatedHours?: string; // OPCIONAL - Horas estimadas
  estimatedMinutes?: string; // OPCIONAL - Minutos estimados
}
```

### FindProjectArgs

Schema para buscar un proyecto:

```typescript
{
  projectName: string; // REQUERIDO - Nombre del proyecto a buscar
}
```

## Reglas de Validación

### Campos Requeridos

- `projectName`: Siempre requerido en todas las operaciones
- `userName`: Requerido para crear tareas
- `title`: Requerido para crear tareas

### Campos Opcionales

- `moduleName`: Solo se incluye si se menciona explícitamente en el comando
- `phaseName`: Solo se incluye si se menciona explícitamente en el comando
- `estimatedHours` y `estimatedMinutes`: Valores por defecto si no se especifican

## Comportamiento del Sistema

### Fallback Logic

- Si no se especifica `moduleName`, se usa el primer módulo disponible del proyecto
- Si no se especifica `phaseName`, se usa la primera fase disponible del proyecto
- Si no se especifica `userName`, el sistema debe solicitar clarificación

### Validación con Zod

Todos los tipos están respaldados por esquemas Zod que proporcionan:

- Validación en tiempo de ejecución
- Mensajes de error descriptivos
- Type safety en TypeScript

## Ejemplos de Uso

### Comando Mínimo

```
"Crear tarea revisar login en proyecto Kronos para Ana"
```

### Comando Completo

```
"Crear tarea revisar login en proyecto Kronos módulo Frontend fase Desarrollo para Ana"
```

### Búsqueda de Proyecto

```
"Buscar proyecto TaskWise"
```
