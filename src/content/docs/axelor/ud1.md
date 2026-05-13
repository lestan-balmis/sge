---
title: UD1 — Identificación ERP-CRM
description: Manual de uso · Axelor Open Suite. Módulo SGE · DAM · IES Doctor Balmis
---

### Manual de uso · Axelor Open Suite
**Módulo SGE · DAM · IES Balmis**

---

> **Duración:** 4 horas  
> **Herramienta:** Axelor (referencia funcional del ERP Balmis)  
> **Objetivo:** Entender qué es un ERP, qué módulos tiene Axelor y cómo están organizados sus datos, antes de comenzar a programar el ERP Balmis con Spring Boot.

---

## Índice

1. [¿Qué es un ERP?](#1-qué-es-un-erp)
2. [¿Qué es un CRM?](#2-qué-es-un-crm)
3. [Diferencia entre ERP y CRM](#3-diferencia-entre-erp-y-crm)
4. [Presentación de Axelor](#4-presentación-de-axelor)
5. [Acceso y pantalla principal de Axelor](#5-acceso-y-pantalla-principal-de-axelor)
   - 5.1 [Cómo acceder a Axelor](#51-cómo-acceder-a-axelor)
   - 5.2 [Instalación y puesta en marcha con Docker](#52-instalación-y-puesta-en-marcha-con-docker)
   - 5.3 [Tutorial: Navegación y Visualizaciones de Axelor](#53-tutorial-navegación-y-visualizaciones-de-axelor)
   - 5.4 [Descripción de la pantalla principal](#54-descripción-de-la-pantalla-principal)
   - 5.5 [Tipos de vistas en Axelor](#55-tipos-de-vistas-en-axelor)
6. [Identificación de módulos en Axelor](#6-identificación-de-módulos-en-axelor)
7. [El módulo CRM en Axelor](#7-el-módulo-crm-en-axelor)
8. [Ficha de campos del Cliente en Axelor](#8-ficha-de-campos-del-cliente-en-axelor)
9. [Comparativa de ERPs del mercado](#9-comparativa-de-erps-del-mercado)
10. [Conexión con el ERP Balmis](#10-conexión-con-el-erp-balmis)
11. [Actividades a realizar](#11-actividades-a-realizar)
12. [Entregable: Cuaderno de Referencia Axelor](#12-entregable-cuaderno-de-referencia-axelor)

---

## 1. ¿Qué es un ERP?

Un **ERP** (*Enterprise Resource Planning* — Planificación de Recursos Empresariales) es un software de gestión integral que permite a una empresa centralizar y coordinar todos sus procesos de negocio en un único sistema.

En lugar de tener programas separados para contabilidad, almacén, ventas y recursos humanos, un ERP unifica toda esa información en una base de datos común. Así, cuando un comercial confirma un pedido, el almacén ve el movimiento de stock en tiempo real, y contabilidad genera la factura automáticamente.

### Características principales de un ERP

| Característica | Descripción |
|---|---|
| **Integración** | Todos los módulos comparten la misma base de datos |
| **Tiempo real** | Los cambios en un módulo se reflejan inmediatamente en los demás |
| **Modularidad** | Se pueden activar solo los módulos que necesita la empresa |
| **Trazabilidad** | Cada operación queda registrada con usuario, fecha y hora |
| **Roles y permisos** | Cada usuario solo ve y edita lo que le corresponde |

### ¿Para qué sirve un ERP en una empresa?

- Evitar la duplicidad de datos (el mismo cliente no se introduce dos veces)
- Automatizar procesos repetitivos (generación de facturas, alertas de stock bajo)
- Obtener informes y KPIs en tiempo real (total facturado, pedidos pendientes)
- Controlar los accesos: un empleado de ventas no puede modificar la nómina

---

## 2. ¿Qué es un CRM?

Un **CRM** (*Customer Relationship Management* — Gestión de la Relación con el Cliente) es el módulo del ERP (o aplicación independiente) dedicado exclusivamente a gestionar las interacciones con los clientes.

Su función principal es hacer seguimiento del ciclo de vida de un cliente:

```
PROSPECTO  →  OPORTUNIDAD  →  CLIENTE ACTIVO  →  CLIENTE INACTIVO
```

| Fase | Descripción |
|---|---|
| **Prospecto** | Contacto potencial al que se quiere vender, aún no ha comprado |
| **Oportunidad** | El prospecto ha mostrado interés y se está negociando |
| **Cliente Activo** | Ha realizado al menos una compra y está en activo |
| **Cliente Inactivo** | No ha comprado en un tiempo determinado |

---

## 3. Diferencia entre ERP y CRM

Aunque a menudo se usan juntos, no son lo mismo:

| Aspecto | ERP | CRM |
|---|---|---|
| **Alcance** | Toda la empresa (finanzas, almacén, producción, RRHH…) | Solo la relación con el cliente |
| **Objetivo principal** | Optimizar procesos internos | Aumentar ventas y fidelizar clientes |
| **Usuarios típicos** | Toda la empresa | Equipo comercial y marketing |
| **Datos clave** | Facturas, pedidos, stock, nóminas | Contactos, oportunidades, campañas |

En Axelor —y en el ERP Balmis— el CRM es **un módulo más dentro del ERP**, perfectamente integrado con Ventas, Compras y RRHH.

---

## 4. Presentación de Axelor

**Axelor** es un ERP Open Source de código abierto desarrollado en Java, distribuido bajo licencia **GNU AGPL**. Es la **referencia funcional** del proyecto ERP Balmis: estudiaremos cómo funciona Axelor para luego construir nuestra propia versión con Spring Boot.

### ¿Por qué Axelor como referencia?

- Es Open Source: podemos descargarlo, instalarlo y estudiarlo libremente
- Está desarrollado en Java (misma tecnología que Spring Boot)
- Tiene más de 30 módulos integrados que cubren todo el ciclo empresarial
- Su arquitectura es modular, igual que la que construiremos en el ERP Balmis
- Cuenta con documentación pública y una comunidad activa

### Datos clave de Axelor

| Dato | Valor |
|---|---|
| **Licencia** | GNU AGPL (Community) / Comercial (Pro/Enterprise) |
| **Lenguaje** | Java (backend) + Angular (frontend) |
| **Base de datos** | PostgreSQL |
| **Módulos disponibles** | +30 (CRM, Ventas, Compras, RRHH, Contabilidad, Producción…) |
| **Usuarios en el mundo** | +1.000.000 |
| **Web oficial** | [axelor.com](https://axelor.com) |
| **Documentación** | [docs.axelor.com](https://docs.axelor.com) |

### Imagen: Plataforma Axelor

![Plataforma Axelor ERP](https://axelor.com/wp-content/uploads/2022/11/erp-980x561.png)

*Interfaz web de Axelor: vista general del escritorio con acceso a todos los módulos.*

---

## 5. Acceso y pantalla principal de Axelor

### 5.1 Cómo acceder a Axelor

Axelor puede ejecutarse:

- **En la nube (demo):** accediendo a [axelor.com/demo-access-request](https://axelor.com/demo-access-request/) se puede solicitar acceso a una instancia de demostración.
- **En local:** descargando Axelor Open Suite desde [axelor.com/downloads](https://axelor.com/downloads) e instalándolo en un servidor local con Java y PostgreSQL.
- **Con Docker:** usando la imagen oficial de Axelor disponible en Docker Hub.

> **Para esta unidad** se utilizará la instancia proporcionada por el profesor o la demo online.

### 5.2 Instalación y puesta en marcha con Docker

Esta es la forma recomendada para el aula: no requiere instalar Java, Tomcat ni PostgreSQL en el sistema operativo. Docker gestiona todos los servicios de forma aislada en contenedores.

#### Prerrequisitos

| Requisito | Versión mínima | Descarga |
|---|---|---|
| **Docker Desktop** | 4.x o superior | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **RAM disponible** | Mínimo 4 GB asignados a Docker | Configurar en Docker Desktop → Settings → Resources |
| **Espacio en disco** | ~2 GB para las imágenes | — |

> **Windows:** Docker Desktop instala automáticamente WSL2 (Windows Subsystem for Linux), que es el motor que ejecuta los contenedores. Durante la instalación aceptar la opción *"Use WSL 2 instead of Hyper-V"*.

---

#### Paso 1 — Crear el directorio de trabajo

Abre una terminal (PowerShell o CMD) y crea una carpeta para el proyecto:

```powershell
mkdir C:\axelor-docker
cd C:\axelor-docker
```

---

#### Paso 2 — Crear el fichero `docker-compose.yml`

Crea el fichero `docker-compose.yml` en esa carpeta con el siguiente contenido. Este fichero define **dos servicios**: la aplicación Axelor y la base de datos PostgreSQL.

```yaml
services:

  # ──────────────────────────────────────────────
  # Servicio 1: Aplicación Axelor (Community Edition)
  # ──────────────────────────────────────────────
  app:
    image: axelor/aos-ce:latest          # Imagen oficial de Axelor Open Suite CE
    environment:
      - PGHOST=postgres                  # Nombre del servicio PostgreSQL (red interna Docker)
      - PGPORT=5432                      # Puerto estándar de PostgreSQL
      - PGUSER=axelor                    # Usuario de la base de datos
      - PGPASSWORD=axelor                # Contraseña de la base de datos
      - PGDATABASE=axelor                # Nombre de la base de datos
      - JAVA_XMX=4096m                   # Memoria máxima para la JVM (4 GB)
      - APP_USER=admin                   # Usuario administrador de Axelor
      - APP_PASS=admin                   # Contraseña administrador de Axelor
      - APP_LANGUAGE=es                  # Idioma de la interfaz (es = español)
      - APP_DEMO_DATA=true               # Cargar datos de demostración (útil para el aula)
      - APP_MODE=dev                     # Modo desarrollo (activa logs detallados)
    ports:
      - "8080:8080"                      # Puerto local:puerto contenedor
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 1800s                # Tiempo máximo de arranque: 30 min (primer inicio)
    depends_on:
      - postgres                         # Axelor espera a que PostgreSQL esté listo
    volumes:
      - app_data:/data                   # Persistencia de adjuntos y exportaciones

  # ──────────────────────────────────────────────
  # Servicio 2: Base de datos PostgreSQL
  # ──────────────────────────────────────────────
  postgres:
    image: postgres:16                   # PostgreSQL versión 16
    environment:
      - POSTGRES_USER=axelor
      - POSTGRES_PASSWORD=axelor
      - POSTGRES_DB=axelor
    volumes:
      - postgres_data:/var/lib/postgresql/data   # Persistencia de los datos de BD

# Volúmenes Docker (almacenamiento persistente gestionado por Docker)
volumes:
  app_data:
  postgres_data:
```

---

#### Paso 3 — Arrancar los contenedores

Desde la carpeta donde está el `docker-compose.yml`, ejecuta:

```powershell
docker compose up -d
```

El flag `-d` (*detached*) lanza los contenedores en segundo plano. Docker descargará automáticamente las imágenes si no están ya en local (~600 MB la primera vez).

**Verificar que los contenedores están en ejecución:**

```powershell
docker compose ps
```

La salida esperada es similar a:

```
NAME                  IMAGE                   STATUS
axelor-docker-app-1      axelor/aos-ce:latest    Up (healthy)
axelor-docker-postgres-1 postgres:16             Up
```

---

#### Paso 4 — Esperar el primer arranque

> ⚠️ **El primer arranque tarda entre 10 y 30 minutos.** Axelor compila y configura la aplicación completa al iniciarse por primera vez. Los arranques posteriores son mucho más rápidos (~2 minutos).

Puedes monitorizar el progreso en tiempo real con:

```powershell
docker compose logs -f app
```

La aplicación está lista cuando en los logs aparece:

```
INFO  Server startup in XXXX ms
```

O cuando el estado en `docker compose ps` muestre `(healthy)`.

---

#### Paso 5 — Acceder a Axelor en el navegador

Una vez arrancado, abre el navegador y accede a:

| Campo | Valor |
|---|---|
| **URL** | `http://localhost:8080` |
| **Usuario** | `admin` |
| **Contraseña** | `admin` |

> ⚠️ En producción real **nunca** se dejan las credenciales por defecto. Esta práctica de seguridad se aplicará también en el ERP Balmis a partir del Reto 6.

---

#### Comandos útiles de gestión

| Acción | Comando |
|---|---|
| Arrancar los contenedores | `docker compose up -d` |
| Detener los contenedores (sin borrar datos) | `docker compose stop` |
| Ver logs en tiempo real | `docker compose logs -f app` |
| Ver estado de los contenedores | `docker compose ps` |
| Reiniciar Axelor | `docker compose restart app` |
| Eliminar contenedores y volúmenes (**borra todos los datos**) | `docker compose down -v` |

---

#### Diagrama de la arquitectura Docker

```
  Tu navegador
  http://localhost:8080
         │
         ▼
┌─────────────────────────────────────┐
│         Docker Desktop              │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Contenedor: app             │   │
│  │  axelor/aos-ce:latest        │   │
│  │  Puerto: 8080                │   │
│  │  Tomcat 10 + JDK 21          │   │
│  └─────────────┬────────────────┘   │
│                │ Red interna Docker │
│  ┌─────────────▼────────────────┐   │
│  │  Contenedor: postgres        │   │
│  │  postgres:16                 │   │
│  │  Puerto: 5432 (interno)      │   │
│  │  BD: axelor                  │   │
│  └──────────────────────────────┘   │
│                                     │
│  Volúmenes persistentes:            │
│  • app_data  → adjuntos y exports   │
│  • postgres_data → datos de BD      │
└─────────────────────────────────────┘
```

---

#### Resolución de problemas habituales

| Problema | Causa probable | Solución |
|---|---|---|
| Los contenedores no arrancan | Docker Desktop no está en ejecución | Abrir Docker Desktop y esperar a que el icono de la ballena esté estable |
| Puerto 8080 ya en uso | Otro servicio ocupa ese puerto (ej: Tomcat del ERP Balmis) | Cambiar el mapeo a `"8081:8080"` en el `docker-compose.yml` |
| `app` en estado `unhealthy` | Aún está arrancando | Esperar y revisar logs con `docker compose logs -f app` |
| Error de memoria | Docker Desktop tiene poca RAM asignada | Aumentar RAM en Docker Desktop → Settings → Resources → Memory (mínimo 4 GB) |
| Datos perdidos tras reiniciar PC | Se usó `down -v` accidentalmente | Los volúmenes nombrados persisten con `stop`; solo se borran con `down -v` |

---

### 5.3 Tutorial: Navegación y Visualizaciones de Axelor

Este tutorial te guía paso a paso sobre cómo navegar, explorar y utilizar las diferentes visualizaciones de Axelor. Es fundamental que domines estos conocimientos antes de realizar las actividades del apartado 11.

#### 5.3.1 Estructura general de la interfaz

Al acceder a Axelor después de autenticarse, la pantalla se divide en tres zonas principales:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ BARRA SUPERIOR (Header)                                                    │
│ [≡ Menú] [Axelor Logo] [🔍 Búsqueda Global] [🔔 Campana] [👤 Usuario] [⚙] │
├───────────────────┬─────────────────────────────────────────────────────────┤
│                   │                                                         │
│  BARRA LATERAL    │           ÁREA DE TRABAJO PRINCIPAL                     │
│  (Sidebar)        │           • Vistas del módulo seleccionado              │
│                   │           • Formularios                                 │
│  • CRM            │           • Dashboard con KPIs                          │
│  • Ventas         │           • Gráficos y reportes                         │
│  • Compras        │                                                         │
│  • Stock          │                                                         │
│  • Contabilidad   │                                                         │
│  • RRHH           │                                                         │
│  • Producción     │                                                         │
│  • Proyectos      │                                                         │
│  • (más módulos)  │                                                         │
│                   │                                                         │
│  [≡ Más opciones] │                                                         │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

**Elementos clave de la interfaz:**

| Elemento | Ubicación | Función |
|---|---|---|
| **Menú hamburguesa (≡)** | Arriba izquierda | Contraer/expandir la barra lateral |
| **Búsqueda global (🔍)** | Barra superior central | Buscar en toda la aplicación por palabra clave |
| **Campana (🔔)** | Barra superior derecha | Notificaciones y alertas del sistema |
| **Perfil de usuario (👤)** | Extremo superior derecho | Cambiar contraseña, idioma, cerrar sesión |
| **Engranaje (⚙)** | Extremo superior derecha | Configuración de parámetros del sistema |
| **Barra lateral (Sidebar)** | Izquierda | Acceso a todos los módulos y menús |

---

#### 5.3.2 El escritorio (Dashboard) principal

Al iniciar sesión, se accede a la pantalla principal o **dashboard**. Este es el centro de operaciones de Axelor.

**Paneles del dashboard:**

```
┌─────────────────────────────────────────────────────────────────┐
│ PANEL SUPERIOR: Indicadores clave (KPIs)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Clientes    │  │   Pedidos    │  │  Facturas    │           │
│  │   activos    │  │   pendientes │  │  emitidas    │           │
│  │              │  │              │  │              │           │
│  │     87       │  │     12       │  │   €45.320    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ PANEL MEDIO: Gráfico de actividad                               │
│  [Gráfico de barras: Ventas por mes]                            │
├─────────────────────────────────────────────────────────────────┤
│ PANEL INFERIOR: Tareas y recordatorios                          │
│  Mis tareas pendientes: ...                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 5.3.3 Navegación por módulos

Cada módulo tiene una estructura similar con submenús. Para acceder:

**Paso 1:** En la barra lateral izquierda, haz clic en el nombre del módulo (ej: "CRM")

**Paso 2:** Se expande el menú mostrando los submenús del módulo

**Paso 3:** Haz clic en el submenú que deseas (ej: "Clientes")

**Resultado:** Se abre la vista lista del submenú seleccionado

---

#### 5.3.4 Las 5 vistas principales en Axelor

Axelor ofrece **5 tipos de vistas diferentes** para visualizar y trabajar con los datos. Cada una es útil para un propósito diferente.

**Vista 1: LISTA (☰)**
- **Propósito:** Ver múltiples registros en formato tabla
- **Apariencia:** Tabla con filas y columnas, como una hoja de cálculo
- **Acciones:** Ordenar por columnas, paginar, seleccionar múltiples registros
- **Ventaja:** Ves muchos registros de un vistazo

**Vista 2: KANBAN (⊞)**
- **Propósito:** Ver registros agrupados en **tarjetas por categoría**
- **Apariencia:** Columnas de tarjetas, una por cada estado
- **Acciones:** Arrastrar tarjetas de una columna a otra, hacer clic para abrir
- **Ventaja:** Visualizar el proceso de trabajo y ciclo de vida de registros

**Vista 3: FORMULARIO (📋)**
- **Propósito:** Ver **todos los detalles** de un registro individual
- **Apariencia:** Formulario con campos organizados en secciones y pestañas
- **Acciones:** Editar campos, acceder a relaciones en pestañas
- **Ventaja:** Acceso completo a toda la información de un registro

**Vista 4: CALENDARIO (📅)**
- **Propósito:** Ver registros con **componente de fecha/hora** en formato calendario
- **Apariencia:** Calendario con eventos marcados en los días
- **Acciones:** Hacer clic en días para ver eventos, navegar entre meses
- **Ventaja:** Visualizar cronograma de citas, reuniones, entregas

**Vista 5: GRÁFICO (📊)**
- **Propósito:** Visualizar datos en **formato gráfico** (barras, líneas, pie charts)
- **Apariencia:** Gráficos de análisis
- **Acciones:** Pasar el ratón para ver valores exactos, cambiar tipo de gráfico
- **Ventaja:** Visualizar tendencias y patrones en los datos

---

#### 5.3.5 Vista Lista — Exploración de datos

La **Vista Lista** es la más utilizada para exploración rápida.

**Estructura de una Vista Lista:**

```
┌─────────────────────────────────────────────────────────────────┐
│ BARRA DE HERRAMIENTAS                                           │
│ [+ Nuevo] [Editar] [🗑 Eliminar] [⋮ Más]                        │
│ [🔍 Buscar] [☰ Lista] [⊞ Kanban] [📅 Calendario] [📊 Gráfico]  │
├─────────────────────────────────────────────────────────────────┤
│ Clientes (5 registros)                                          │
│ ┌────┬─────────────────┬──────────────────┬────────────────┐   │
│ │ ☑  │ Nombre▲         │ Email            │ Tipo ▼         │   │
│ ├────┼─────────────────┼──────────────────┼────────────────┤   │
│ │ ☑  │ DataCorp        │ data@dc.com      │ ACTIVO         │   │
│ │ ☐  │ Global Trading  │ gt@gt.com        │ INACTIVO       │   │
│ │ ☐  │ Tech Solutions  │ info@techsol.es  │ ACTIVO         │   │
│ └────┴─────────────────┴──────────────────┴────────────────┘   │
│ ☐ Seleccionar todos                  [< Página 1 de 1 >] ▼    │
└─────────────────────────────────────────────────────────────────┘
```

**Botones de acción:**

| Botón | Función |
|---|---|
| **[+ Nuevo]** | Crear un registro nuevo |
| **[Editar]** | Editar el registro seleccionado |
| **[🗑 Eliminar]** | Eliminar registros seleccionados |
| **[⋮ Más]** | Acciones adicionales (exportar, duplicar, etc.) |
| **[🔍 Buscar]** | Mostrar/ocultar barra de búsqueda |

---

#### 5.3.6 Vista Formulario — Detalle de un registro

**Cómo abrir un formulario:**
- Hacer clic en cualquier registro en la vista lista
- Hacer clic en [+ Nuevo] para crear uno nuevo
- Desde la vista Kanban, hacer clic en una tarjeta

**Estructura de un formulario:**

```
┌────────────────────────────────────────────────────────────────┐
│ ENCABEZADO                                                     │
│ [◀ ▶] CLIENTE: Tech Solutions SL  [Editar] [⋮ Más] [✕]       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ▼ SECCIÓN 1: DATOS GENERALES                                  │
│  ├─ Código ..................... CLI-0001                     │
│  ├─ Nombre ..................... Tech Solutions SL            │
│  └─ Email ...................... info@techsol.es             │
│                                                                │
│  ▼ SECCIÓN 2: DIRECCIÓN                                        │
│  ├─ Calle ....................... C/ Mayor 5                  │
│  └─ Ciudad ....................... Alicante                   │
│                                                                │
│  PESTAÑAS (Relaciones):                                        │
│  ┌──────────┬──────────┬──────────┬──────────┐                │
│  │CONTACTOS │OPORTUNI. │ACTIVIDAD │DOCUMENTOS│                │
│  │   (2)    │    (1)   │   (3)    │   (0)    │                │
│  └──────────┴──────────┴──────────┴──────────┘                │
│                                                                │
│  [Guardar] [Cancelar] [Recargar]                              │
└────────────────────────────────────────────────────────────────┘
```

**Tipos de campos en un formulario:**

| Tipo | Ejemplo |
|---|---|
| **Texto** | `Tech Solutions SL` |
| **Número** | `45320` |
| **Email** | `info@techsol.es` |
| **Fecha** | `14/05/2024` |
| **Dropdown (▼)** | `[ACTIVO ▼]` |
| **Checkbox (☑)** | `☑ Activo` |
| **Área de texto** | Notas multilínea |
| **Lista relacional** | Tabla de contactos, oportunidades |

**Para editar un registro:**
1. Haz clic en [Editar] en la parte superior
2. Los campos pasan a modo edición (fondo blanco, bordes azules)
3. Realiza los cambios
4. Haz clic en [Guardar]

---

#### 5.3.7 Búsqueda, filtrado y ordenamiento

**Búsqueda global:** Desde cualquier parte de Axelor
- Haz clic en el icono [🔍] en la barra superior
- Escribe una palabra clave (ej: "Tech")
- Atajo de teclado: `Ctrl + K`

**Búsqueda en la vista lista:**
1. Haz clic en [🔍 Buscar] en la barra de herramientas
2. Se abre una barra de búsqueda
3. Escribe una palabra clave
4. Se filtran automáticamente los registros

**Ordenamiento por columnas:**
1. Haz clic en el encabezado de columna (ej: "Nombre")
2. Se ordena A→Z (▲ ascendente)
3. Haz clic de nuevo para Z→A (▼ descendente)
4. Haz clic una tercera vez para eliminar la ordenación

---

#### 5.3.8 Creación y edición de registros

**Crear un nuevo registro:**
1. Haz clic en [+ Nuevo] en la vista lista
2. Se abre un formulario en blanco
3. Rellena los campos obligatorios (marcados con *)
4. Haz clic en [Guardar]

**Editar un registro existente:**
1. Haz clic sobre el registro en la vista lista
2. Se abre el formulario en modo lectura
3. Haz clic en [Editar]
4. Realiza los cambios
5. Haz clic en [Guardar]

**Añadir registros relacionados (en una pestaña):**
1. Abre el formulario de un Cliente
2. Haz clic en la pestaña "CONTACTOS"
3. Haz clic en [+ Añadir nuevo]
4. Se añade una fila nueva en blanco
5. Rellena los datos
6. Haz clic en [Guardar] del formulario principal

---

#### 5.3.9 Relaciones entre entidades (pestañas)

Una de las características más importantes de un ERP es que **todos los módulos están interconectados**.

**Ejemplo: Relación Cliente ↔ Contacto (1→N)**

En el formulario de un Cliente, la pestaña CONTACTOS muestra todos los contactos relacionados:

```
Cliente (1)                    Contacto (N)
Tech Solutions SL     ←→    Ana García (Directora TI)
                       ←→    Paco López (Comercial)
```

En ERP Balmis se implementará como:

```java
@Entity
public class Cliente {
    @OneToMany(mappedBy = "cliente")
    private List<Contacto> contactos;  // Un cliente tiene muchos contactos
}

@Entity
public class Contacto {
    @ManyToOne
    private Cliente cliente;  // Cada contacto pertenece a un cliente
}
```

**Ejemplo: Ciclo de vida de un Pedido**

```
BORRADOR  →  CONFIRMADO  →  ENVIADO  →  FACTURADO
   (1)           (2)          (3)          (4)
```

En ERP Balmis:

```java
public enum EstadoPedido {
    BORRADOR,
    CONFIRMADO,
    ENVIADO,
    FACTURADO
}
```

---

#### 5.3.10 Cómo completar las Actividades usando este tutorial

**Para la Actividad 1 (Exploración):**
1. Sigue los pasos de la sección 5.3.3 para navegar a cada módulo
2. Usa la Vista Lista (sección 5.3.5) para explorar los registros
3. Toma capturas de pantalla de cada módulo (CRM, Ventas, Compras, RRHH)

**Para la Actividad 3 (Ficha del Cliente):**
1. Navega a CRM → Clientes
2. Haz clic en un cliente para abrir su formulario (sección 5.3.6)
3. Explora todas las secciones y pestañas
4. Identifica los campos usando la tabla de la sección 8.2

**Para completar cualquier búsqueda o filtrado:**
1. Usa los métodos de la sección 5.3.7
2. Combina búsqueda y ordenamiento para encontrar lo que necesitas

---

### 5.4 Descripción de la pantalla principal

Al iniciar sesión en Axelor se presenta el **escritorio** (*dashboard*) principal. Sus elementos son:

```
┌─────────────────────────────────────────────────────────────┐
│  BARRA SUPERIOR                                             │
│  [≡ Menú]  [🔍 Búsqueda global]  [🔔 Notificaciones] [👤]  │
├────────────────┬────────────────────────────────────────────┤
│  BARRA LATERAL │  ÁREA DE TRABAJO PRINCIPAL                 │
│  ───────────── │                                            │
│  CRM           │   ┌──────────┐  ┌──────────┐  ┌────────┐   │
│  Ventas        │   │ KPI 1    │  │ KPI 2    │  │ KPI 3  │   │
│  Compras       │   │ Clientes │  │ Pedidos  │  │ Total  │   │
│  Stock         │   │ activos  │  │ pend.    │  │ factur.│   │
│  Contabilidad  │   └──────────┘  └──────────┘  └────────┘   │
│  RRHH          │                                            │
│  Producción    │   [Gráfico de ventas del mes]              │
│  Proyectos     │                                            │
│  …             │   [Mis tareas pendientes]                  │
└────────────────┴────────────────────────────────────────────┘
```

> **📸 Captura requerida (Actividad 1):** Realizar una captura de la pantalla principal de Axelor con todos los módulos visibles en la barra lateral, anotando el nombre de cada módulo.

### 5.5 Tipos de vistas en Axelor

Axelor presenta los datos en cinco tipos de vistas que se intercambian con botones en la parte superior derecha:

| Vista | Icono | Descripción |
|---|---|---|
| **Lista** | ☰ | Tabla con todos los registros paginados, con columnas configurables |
| **Kanban / Cuadrícula** | ⊞ | Tarjetas agrupadas por estado (muy útil en CRM) |
| **Formulario** | 📋 | Ficha detallada de un solo registro con todos sus campos |
| **Calendario** | 📅 | Vista temporal de eventos y citas |
| **Gráfico** | 📊 | Visualización estadística de los datos |

Esta distinción entre las 5 vistas es fundamental: en el ERP Balmis tendremos equivalentes en la API REST:
- **Vista lista** = Endpoint `GET /api/clientes` → devuelve JSON array
- **Vista formulario** = Endpoint `GET /api/clientes/{id}` → devuelve JSON objeto
- **Filtrado** = Endpoint `GET /api/clientes?tipo=ACTIVO` → devuelve registros filtrados

---

## 6. Identificación de módulos en Axelor

Axelor organiza sus funcionalidades en más de 30 módulos. Para el ERP Balmis nos interesan los cuatro módulos principales:

### 6.1 Mapa de módulos de Axelor

![Módulos de la plataforma Axelor](https://axelor.com/wp-content/uploads/2022/11/applications_blanc-980x638.jpg)

*Vista general de todos los módulos disponibles en la plataforma Axelor.*

### 6.2 Los 4 módulos clave para el ERP Balmis

#### Módulo CRM
El módulo de **Gestión de la Relación con el Cliente** es el núcleo comercial de Axelor.

```
CRM
├── Prospectos          → contactos sin compras previas
├── Clientes            → empresas o personas con relación comercial
├── Contactos           → personas de contacto de cada cliente
├── Oportunidades       → negociaciones en curso
└── Actividades         → llamadas, reuniones, tareas de seguimiento
```

> **Equivalente en ERP Balmis:** Módulo CRM → entidades `Cliente.java` y `Contacto.java`, enum `TipoCliente`.

![CRM Axelor](https://axelor.com/wp-content/uploads/2022/11/crm_transparent-980x763.png)

*Módulo CRM de Axelor: gestión de oportunidades y ciclo de vida del cliente.*

> **📸 Captura requerida (Actividad 1a):** Captura del módulo CRM con la lista de prospectos/clientes visible.

---

#### Módulo Ventas
Gestiona todo el ciclo de venta desde el presupuesto hasta la facturación.

```
Ventas
├── Catálogo de productos   → referencias, precios, stock
├── Presupuestos            → ofertas al cliente (estado: borrador / enviado)
├── Pedidos                 → órdenes de venta confirmadas
├── Albaranes               → entrega de mercancía
└── Facturas de venta       → facturación al cliente
```

> **Equivalente en ERP Balmis:** Entidades `Producto.java`, `Pedido.java` y `LineaPedido.java`. Ciclo de estados: `BORRADOR → CONFIRMADO → ENVIADO → FACTURADO`.

> **📸 Captura requerida (Actividad 1b):** Captura del módulo Ventas con el catálogo de productos visible.

---

#### Módulo Compras
Gestiona la relación con los proveedores y las órdenes de compra.

```
Compras
├── Proveedores             → empresas suministradoras
├── Solicitudes de compra   → necesidad interna detectada
├── Órdenes de compra       → pedido formal al proveedor
└── Facturas de compra      → factura recibida del proveedor
```

> **Equivalente en ERP Balmis:** Entidades `Proveedor.java` y `OrdenCompra.java`. Ciclo de estados: `PENDIENTE → RECIBIDA → CANCELADA`.

> **📸 Captura requerida (Actividad 1c):** Captura del módulo Compras con la lista de proveedores o pedidos.

---

#### Módulo RRHH (Empleados)
Gestiona el capital humano de la empresa.

```
RRHH / Empleados
├── Empleados               → datos personales, cargo, departamento
├── Contratos               → tipo de contrato, fecha de incorporación
├── Nóminas                 → gestión salarial (módulo avanzado)
└── Ausencias               → vacaciones, bajas
```

> **Equivalente en ERP Balmis:** Entidad `Empleado.java`. Campos: `nombre`, `apellidos`, `cargo`, `departamento`, `fechaIncorporacion`.

> **📸 Captura requerida (Actividad 1d):** Captura del módulo RRHH con la lista de empleados.

---

### 6.3 Resumen de módulos y equivalencias

| Módulo Axelor | Entidades principales | Equivalente ERP Balmis |
|---|---|---|
| **CRM** | Cliente, Contacto, Oportunidad | `Cliente.java`, `Contacto.java` |
| **Ventas** | Producto, Pedido, Línea, Factura | `Producto.java`, `Pedido.java`, `LineaPedido.java` |
| **Compras** | Proveedor, OrdenCompra, Línea | `Proveedor.java`, `OrdenCompra.java` |
| **RRHH** | Empleado, Contrato, Ausencia | `Empleado.java` |
| **Core / Config.** | Usuario, Empresa, Roles | `Usuario.java`, `Empresa.java` |

---

## 7. El módulo CRM en Axelor

El módulo CRM es el que más se utilizará como referencia en los primeros retos del ERP Balmis. Veamos en detalle cómo funciona.

### 7.1 Acceder al módulo CRM

1. Hacer clic en **CRM** en la barra de navegación lateral
2. Se abre el panel del módulo con varios submenús
3. Seleccionar **Clientes** para ver la lista de clientes

### 7.2 Vista lista de Clientes

La vista lista muestra los clientes en una tabla con las columnas principales:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Clientes                                    [+ Nuevo] [🔍 Filtrar] │
├──────┬───────────────────┬──────────────┬──────────┬────────────────┤
│  #   │  Nombre           │  Email       │  Tipo    │  Fecha Alta    │
├──────┼───────────────────┼──────────────┼──────────┼────────────────┤
│  1   │  Tech Solutions   │  info@ts.com │  ACTIVO  │  12/03/2024    │
│  2   │  Innovate SL      │  hello@in.es │  PROSP.  │  28/01/2024    │
│  3   │  Global Trading   │  gt@gt.com   │  INACTIVO│  05/09/2023    │
└──────┴───────────────────┴──────────────┴──────────┴────────────────┘
                                            [< 1 de 3 >]
```

### 7.3 Vista Kanban de Clientes

Axelor permite ver los clientes en **vista Kanban**, agrupados por su estado:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PROSPECTO   │    │    ACTIVO    │    │   INACTIVO   │
│──────────────│    │──────────────│    │──────────────│
│ [Innovate]   │    │ [TechSolut.] │    │ [GlobalTrad.]│
│ [MedGroup]   │    │ [DataCorp]   │    │              │
│              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

> Esta vista Kanban nos inspirará para implementar el endpoint `GET /api/clientes?tipo=ACTIVO` en el Reto 4 del ERP Balmis.

---

## 8. Ficha de campos del Cliente en Axelor

Al hacer clic sobre un cliente en la lista, se abre su **formulario de detalle**. Este formulario es la referencia directa para diseñar la clase `Cliente.java` en el Reto 1 del ERP Balmis.

### 8.1 Esquema del formulario de Cliente

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CLIENTE: Tech Solutions SL                      [Editar] [Archivar]    │
├─────────────────────────────────────────────────────────────────────────┤
│  Código:       CLI-0001           │  Tipo:       [ ACTIVO ▼ ]           │
│  Nombre:       Tech Solutions SL  │  Fecha Alta: 12/03/2024             │
│  Email:        info@techsol.com   │                                     │
│  Teléfono:     +34 965 000 111    │                                     │
│  Dirección:    C/ Mayor 5, 03001 Alicante                               │
├─────────────────────────────────────────────────────────────────────────┤
│  PESTAÑA: Contactos                                                     │
│  ┌──────────────┬───────────────┬──────────────────────────────────┐    │
│  │  Nombre      │  Cargo        │  Email                           │    │
│  ├──────────────┼───────────────┼──────────────────────────────────┤    │
│  │  Ana García  │  Directora TI │  ana.garcia@techsol.com          │    │
│  │  Paco López  │  Comercial    │  paco.lopez@techsol.com          │    │
│  └──────────────┴───────────────┴──────────────────────────────────┘    │
│                                                          [+ Añadir]     │
├─────────────────────────────────────────────────────────────────────────┤
│  PESTAÑA: Oportunidades                                                 │
│  PESTAÑA: Actividades                                                   │
│  PESTAÑA: Documentos                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

> **📸 Captura requerida (Actividad 3):** Captura del formulario de Cliente con todos los campos visibles. Esta captura será la **referencia directa** para diseñar `Cliente.java` en el Reto 1.

### 8.2 Tabla de campos del Cliente en Axelor

Esta tabla es parte del **Cuaderno de Referencia Axelor** que elaborarás como entregable:

| Campo Axelor | Tipo de dato | Obligatorio | Observaciones | Campo en `Cliente.java` |
|---|---|---|---|---|
| Código | Texto (único) | Sí | Generado automáticamente (CLI-XXXX) | `codigoCliente: String` |
| Nombre | Texto | Sí | Nombre de la empresa o persona | `nombre: String` |
| Email | Email | Sí | Validación de formato | `email: String` |
| Teléfono | Texto | No | Formato libre | `telefono: String` |
| Tipo | Enumerado | Sí | PROSPECTO / ACTIVO / INACTIVO | `tipoCliente: TipoCliente` |
| Fecha de alta | Fecha | Sí | Se asigna automáticamente al crear | `fechaAlta: LocalDate` |
| Contactos | Lista (1→N) | No | Personas de contacto asociadas | `contactos: List<Contacto>` |
| Dirección | Texto | No | Dirección postal | *(Reto 4)* |

### 8.3 El ciclo de vida de un Cliente

Uno de los comportamientos más importantes que observamos en Axelor es el **ciclo de estados** del cliente:

```
                    ┌─────────────┐
                    │  PROSPECTO  │  ← Estado inicial
                    └──────┬──────┘
                           │ Primera compra realizada
                           ▼
                    ┌─────────────┐
                    │    ACTIVO   │  ← Cliente con actividad comercial
                    └──────┬──────┘
                           │ Sin actividad durante X meses
                           ▼
                    ┌─────────────┐
                    │  INACTIVO   │  ← Sin actividad reciente
                    └─────────────┘
```

Este ciclo lo implementaremos en el ERP Balmis mediante el enum `TipoCliente`:

```java
public enum TipoCliente {
    PROSPECTO,
    ACTIVO,
    INACTIVO
}
```

---

## 9. Comparativa de ERPs del mercado

Como parte de la contextualización del módulo, realizamos una comparativa de los tres ERPs más relevantes del mercado.

### 9.1 Tabla comparativa

| Criterio | **Axelor** | **Odoo** | **SAP ERP** |
|---|---|---|---|
| **Licencia** | GNU AGPL (Community gratuita) + versiones Pro/Enterprise | LGPL (Community gratuita) + versiones Enterprise de pago | Propietaria (licencia por usuario) |
| **Precio orientativo** | Gratuita (Community) / Consultar (Enterprise) | Gratuita (Community) / ~15-50 €/usuario/mes (Enterprise) | Miles de € por implantación + mantenimiento anual |
| **Lenguaje del backend** | Java (Spring-like framework propio) | Python (framework ORM propio) | ABAP (lenguaje propietario) + Java (SAP Java) |
| **Lenguaje del frontend** | Angular (TypeScript) | JavaScript / TypeScript (OWL framework) | SAP UI5 / Fiori (JavaScript) |
| **Base de datos** | PostgreSQL | PostgreSQL, MySQL, SQLite | SAP HANA / Oracle / SQL Server |
| **Módulos principales** | CRM, Ventas, Compras, Contabilidad, RRHH, Producción, BPM, BI | CRM, Ventas, Compras, Contabilidad, RRHH, Inventario, e-Commerce | FI (Finanzas), CO (Controlling), SD (Ventas), MM (Materiales), HR, PP (Producción) |
| **Tamaño de empresa objetivo** | PYME → Gran empresa | PYME → Gran empresa | Gran empresa / multinacional |
| **Instalación** | Cloud / On-Premise / Docker | Cloud / On-Premise | Cloud (SAP BTP) / On-Premise |
| **Low Code / No Code** | Sí (Studio + BPM integrado) | Parcialmente (Studio Enterprise) | No (requiere desarrollo ABAP) |
| **Open Source** | ✅ Código fuente público | ✅ Community version | ❌ Código propietario |
| **Comunidad** | Foro, GitHub activo | Gran comunidad, muchos tutoriales | SAP Community Network (muy extensa) |
| **Curva de aprendizaje** | Media | Media | Alta |
| **Referencia en ERP Balmis** | ✅ **Referencia principal** | Comparación | Comparación |

### 9.2 ¿Por qué Axelor como referencia y no Odoo o SAP?

| Razón | Detalle |
|---|---|
| **Mismo lenguaje** | Axelor usa Java, al igual que Spring Boot. Esto facilita entender su arquitectura interna. |
| **Open Source real** | Su código es público y consultable en GitHub, lo que permite estudiar cómo resuelve cada problema. |
| **Arquitectura similar** | Axelor sigue patrones MVC y capas (Entity, Repository, Service, Controller) que replicaremos en Spring Boot. |
| **Tamaño adecuado** | Odoo y SAP son mucho más complejos para el nivel del módulo. Axelor tiene el equilibrio ideal. |
| **Acceso gratuito** | La versión Community es completamente gratuita, sin limitaciones de tiempo de prueba. |

### 9.3 Posición en el mercado

```
Complejidad / Precio
         ▲
   ALTA  │                          ● SAP
         │
  MEDIA  │              ● Odoo
         │     ● Axelor
   BAJA  │
         └───────────────────────────────►
             PYME         MEDIANA    GRAN
                          EMPRESA    EMPRESA
```

---

## 10. Conexión con el ERP Balmis

Esta unidad sienta las bases conceptuales de todo lo que se construirá durante el curso. A continuación se muestra cómo cada concepto visto en Axelor se traducirá en código Spring Boot:

### 10.1 De Axelor al ERP Balmis

| Concepto en Axelor | Se convierte en... | Reto |
|---|---|---|
| Módulo **CRM → Cliente** | Clase `Cliente.java` + enum `TipoCliente` | Reto 0 y 1 |
| Módulo **CRM → Contacto** | Clase `Contacto.java` (relación ManyToOne con Cliente) | Reto 4 |
| Módulo **Ventas → Producto** | Clase `Producto.java` | Reto 0 y 1 |
| Módulo **Ventas → Pedido** | Clase `Pedido.java` + `LineaPedido.java` | Reto 5 |
| Módulo **Compras → Proveedor** | Clase `Proveedor.java` | Reto 7 |
| Módulo **RRHH → Empleado** | Clase `Empleado.java` | Reto 0 y 1 |
| **Roles** (Admin, Manager, User) | Enum `Rol` + Spring Security | Reto 6 |
| **Vista lista** en Axelor | Endpoint `GET /api/clientes` → devuelve JSON array | Reto 3 |
| **Vista formulario** en Axelor | Endpoint `GET /api/clientes/{id}` → devuelve JSON objeto | Reto 3 |
| **Filtrado por tipo** en Axelor | Endpoint `GET /api/clientes?tipo=ACTIVO` | Reto 4 |
| **Dashboard KPIs** de Axelor | Endpoint `GET /api/dashboard` | Reto Final |

### 10.2 Arquitectura paralela

La arquitectura en capas de Axelor y del ERP Balmis son equivalentes:

```
AXELOR                           ERP BALMIS (Spring Boot)
─────────────────────────────────────────────────────────
Vista (Angular)              ←→   @Controller / @RestController
Servicio de negocio          ←→   @Service
Repositorio (JPA interno)    ←→   @Repository (JpaRepository)
Entidad (Axelor Model)       ←→   @Entity (JPA)
Base de datos (PostgreSQL)   ←→   H2 (desarrollo) / MySQL (producción)
```

---

## 11. Actividades a realizar

### Actividad 1 — Exploración de la interfaz de Axelor (1h)

**Objetivo:** Identificar cada módulo de Axelor y entender para qué sirve.

**Pasos:**
1. Acceder a la instancia de Axelor (ver credenciales en sección 5.2)
2. Desde la pantalla principal, identificar todos los módulos disponibles en la barra lateral
3. Navegar a cada uno de los 4 módulos principales: CRM, Ventas, Compras, RRHH
4. En cada módulo, anotar:
   - Nombre del módulo
   - Submenús disponibles
   - Tipo de datos que gestiona

**Entrega:**
- 📸 **Captura 1:** Pantalla principal con la barra lateral de módulos visible, anotada con el nombre de cada módulo
- 📸 **Captura 2:** Vista lista del módulo CRM (clientes o prospectos)
- 📸 **Captura 3:** Vista lista del módulo Ventas (productos)
- 📸 **Captura 4:** Vista lista del módulo Compras (proveedores)
- 📸 **Captura 5:** Vista lista del módulo RRHH (empleados)

---

### Actividad 2 — Comparativa de ERPs (30 min)

**Objetivo:** Contextualizar Axelor dentro del panorama de ERPs del mercado.

**Pasos:**
1. Consultar las webs oficiales de los tres ERPs:
   - Axelor: [axelor.com](https://axelor.com)
   - Odoo: [odoo.com](https://odoo.com)
   - SAP: [sap.com](https://www.sap.com)
2. Completar la tabla comparativa (ver sección 9 como referencia)
3. Añadir una reflexión de 3-5 líneas explicando por qué Axelor es la referencia elegida para el ERP Balmis

**Entrega:**
- Tabla comparativa completa (puede ser la de la sección 9 revisada y ampliada)
- Párrafo de reflexión

---

### Actividad 3 — Ficha del Cliente en Axelor (30 min)

**Objetivo:** Identificar los campos del formulario de Cliente en Axelor para usarlos como referencia al diseñar `Cliente.java`.

**Pasos:**
1. Navegar a **CRM → Clientes** en Axelor
2. Hacer clic en cualquier cliente para abrir su formulario de detalle
3. Explorar todas las pestañas del formulario: datos generales, contactos, oportunidades, actividades
4. Para cada campo visible, anotar:
   - Nombre del campo
   - Tipo de dato (texto, número, fecha, enumerado, lista)
   - Si es obligatorio o no
   - Si tiene validación especial (formato email, longitud mínima, etc.)

**Entrega:**
- 📸 **Captura 6:** Formulario de detalle de un Cliente en Axelor, con todos los campos del formulario principal visibles
- 📸 **Captura 7:** Pestaña "Contactos" de ese mismo cliente
- Tabla de campos rellenada (ver plantilla en sección 8.2)

---

### Actividad 4 — Mapa mental del ERP Balmis (1h)

**Objetivo:** Relacionar los módulos de Axelor con las clases Java que se construirán en el ERP Balmis.

**Pasos:**
1. Con la información recopilada en las actividades anteriores, crear un mapa mental o diagrama que relacione:
   - Cada módulo de Axelor → con sus entidades Java equivalentes en ERP Balmis
   - Cada campo del formulario de Axelor → con su atributo Java correspondiente
2. Incluir los tipos de dato Java (String, Long, LocalDate, enum, List...)
3. Herramientas sugeridas:
   - **[draw.io](https://draw.io)** — editor de diagramas y diagramas de flujo, gratuito, disponible online y también como aplicación de escritorio descargable.
   - **Papel y bolígrafo** — perfectamente válido; lo importante es la relación entre conceptos, no la herramienta.
   - **[Miro](https://miro.com)** — pizarra colaborativa digital online. Permite crear mapas mentales, diagramas y esquemas arrastrando y soltando elementos. Tiene plan gratuito y no requiere instalación. Es especialmente útil si se quiere trabajar en grupo de forma simultánea desde distintos equipos.
   - **Cualquier otra herramienta** — se puede utilizar cualquier herramienta similar (Lucidchart, Canva, FigJam, XMind, etc.). Lo importante es el resultado del mapa conceptual entregado, no la herramienta empleada.

**Entrega:**
- Diagrama exportado como imagen (PNG o PDF)

---

## 12. Entregable: Cuaderno de Referencia Axelor

El entregable de esta unidad es la **Sección 1 del Cuaderno de Referencia Axelor**, que usarás activamente durante los retos de Spring Boot.

### Plantilla del Cuaderno — Sección 1

```markdown
## SECCIÓN 1 — Identificación de Módulos y Entidades

### 1.1 Mapa de módulos de Axelor
[Pegar Captura 1 de pantalla principal anotada]

### 1.2 Módulo CRM
Submenús identificados: ...
Entidad principal: Cliente
[Pegar Captura 2]

### 1.3 Módulo Ventas
Submenús identificados: ...
Entidad principal: Producto
[Pegar Captura 3]

### 1.4 Módulo Compras
Submenús identificados: ...
Entidad principal: Proveedor
[Pegar Captura 4]

### 1.5 Módulo RRHH
Submenús identificados: ...
Entidad principal: Empleado
[Pegar Captura 5]

### 1.6 Ficha de campos del Cliente
[Pegar Capturas 6 y 7]
[Tabla de campos completada]

### 1.7 Comparativa ERPs
[Tabla comparativa completada]
[Reflexión personal]

### 1.8 Mapa de equivalencias Axelor → ERP Balmis
[Diagrama o tabla de equivalencias]
```

### Criterios de evaluación

| Criterio | Peso | Descripción |
|---|---|---|
| Capturas de pantalla correctas | 30% | 7 capturas con las anotaciones requeridas |
| Tabla de campos del Cliente | 25% | Todos los campos identificados correctamente |
| Comparativa de ERPs | 20% | Tabla completa con los 3 ERPs y reflexión |
| Mapa mental de equivalencias | 25% | Relaciona correctamente Axelor con ERP Balmis |

---

## Glosario

| Término | Definición |
|---|---|
| **ERP** | Enterprise Resource Planning. Software de gestión integral de una empresa. |
| **CRM** | Customer Relationship Management. Gestión de la relación con clientes. |
| **Módulo** | Conjunto de funcionalidades agrupadas por área de negocio (CRM, Ventas, RRHH…). |
| **Entidad** | Objeto del dominio de negocio con identidad propia (Cliente, Producto, Empleado). |
| **Prospecto** | Cliente potencial que aún no ha realizado ninguna compra. |
| **Oportunidad** | Proceso de venta en curso con un prospecto o cliente. |
| **KPI** | Key Performance Indicator. Indicador clave de rendimiento (ej: total facturado). |
| **POJO** | Plain Old Java Object. Clase Java sin anotaciones especiales, solo atributos y métodos. |
| **JPA** | Java Persistence API. Estándar Java para mapear clases Java a tablas de base de datos. |
| **Open Source** | Software con código fuente disponible públicamente para su estudio y modificación. |
| **GNU AGPL** | Licencia Open Source que obliga a publicar el código modificado si se distribuye el software. |
| **Low Code** | Paradigma de desarrollo que minimiza el código manual mediante herramientas visuales. |

---

## Recursos y enlaces

| Recurso | URL |
|---|---|
| Web oficial de Axelor | https://axelor.com |
| Documentación Axelor | https://docs.axelor.com |
| Demo Axelor (solicitar acceso) | https://axelor.com/demo-access-request |
| Descarga Axelor Community | https://axelor.com/downloads |
| Vídeos tutoriales en YouTube | https://www.youtube.com/c/AxelorApps |
| Foro de la comunidad | https://forum.axelor.com |
| GitHub de Axelor Open Suite | https://github.com/axelor/axelor-open-suite |
| Web oficial de Odoo | https://odoo.com |
| Web oficial de SAP | https://www.sap.com |

---

*Documento elaborado para el módulo SGE · DAM · IES Doctor Balmis · Curso 2026-2027*  
*Proyecto ERP Balmis — En homenaje a Francisco Javier Balmis (1753-1819), médico alicantino impulsor de la primera expedición vacunadora global de la historia.*
