---
title: UD3 — Gestión y Consultas en Axelor
description: Consultas avanzadas, filtros, informes y dashboard - Especificación para Reto Final del ERP Balmis
---

### Consultas, Informes y Dashboard de Axelor
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 4 horas  
> **Herramienta:** Axelor (referencia funcional del ERP Balmis)  
> **Objetivo:** Aprender a extraer información consolidada de los datos del ERP mediante filtros, consultas, informes y dashboards. Comprender los KPIs y cómo se visualizan, para posteriormente implementarlos en el endpoint `GET /api/dashboard` del ERP Balmis en el Reto Final.

---

## Índice

1. [Introducción: El Valor de los Datos Consolidados](#1-introducción-el-valor-de-los-datos-consolidados)
2. [Filtros y Consultas Avanzadas en Axelor](#2-filtros-y-consultas-avanzadas-en-axelor)
   - 2.1 [Concepto: La Barra de Filtrado](#21-concepto-la-barra-de-filtrado)
   - 2.2 [Filtrado Básico de Clientes por Estado](#22-filtrado-básico-de-clientes-por-estado)
   - 2.3 [Búsqueda Avanzada: Filtro Combinado](#23-búsqueda-avanzada-filtro-combinado)
3. [Dashboard de Ventas: Visualización de KPIs](#3-dashboard-de-ventas-visualización-de-kpis)
   - 3.1 [¿Qué es el Dashboard de Axelor?](#31-qué-es-el-dashboard-de-axelor)
   - 3.2 [Acceder al Dashboard de Ventas](#32-acceder-al-dashboard-de-ventas)
4. [Informes y Exportaciones](#4-informes-y-exportaciones)
   - 4.1 [Concepto: Informes de Negocio](#41-concepto-informes-de-negocio)
   - 4.2 [Generar Informe de Ventas: Paso a Paso](#42-generar-informe-de-ventas-paso-a-paso)
5. [Gestión de Usuarios y Roles](#5-gestión-de-usuarios-y-roles)
   - 5.1 [Concepto: Control de Acceso Basado en Roles (RBAC)](#51-concepto-control-de-acceso-basado-en-roles-rbac)
   - 5.2 [Tutorial: Explorar la Gestión de Roles en Axelor](#52-tutorial-explorar-la-gestión-de-roles-en-axelor)
6. [Actividades Prácticas: UD3](#6-actividades-prácticas-ud3)
   - 6.1 [Actividad 1: Filtrado de Clientes por Estado (0.5h)](#actividad-1-filtrado-de-clientes-por-estado-05h)
   - 6.2 [Actividad 2: Exploración del Dashboard (0.5h)](#actividad-2-exploración-del-dashboard-05h)
   - 6.3 [Actividad 3: Generación de Informe de Ventas (1h)](#actividad-3-generación-de-informe-de-ventas-1h)
   - 6.4 [Actividad 4: Análisis de Roles y Permisos (0.5h)](#actividad-4-análisis-de-roles-y-permisos-05h)
   - 6.5 [Actividad 5: Exportación de Datos a Excel (0.5h)](#actividad-5-exportación-de-datos-a-excel-05h)
7. [Cuaderno de Referencia Axelor: Resumen para ERP Balmis](#7-cuaderno-de-referencia-axelor-resumen-para-erp-balmis)
   - 7.1 [Sección 1: Ficha de Entidades](#71-sección-1-ficha-de-entidades)
   - 7.2 [Sección 2: Flujo de Negocio Completo](#72-sección-2-flujo-de-negocio-completo)
   - 7.3 [Sección 3: Dashboard — Especificación](#73-sección-3-dashboard--especificación)
   - 7.4 [Sección 4: Matriz de Roles y Permisos](#74-sección-4-matriz-de-roles-y-permisos)
8. [Entregable: Cuaderno de Referencia Axelor (PDF)](#8-entregable-cuaderno-de-referencia-axelor-pdf)
   - 8.1 [Requisitos del Entregable](#81-requisitos-del-entregable)
   - 8.2 [Criterios de Evaluación](#82-criterios-de-evaluación)
9. [Conexión con el ERP Balmis: Referencia para Retos Futuros](#9-conexión-con-el-erp-balmis-referencia-para-retos-futuros)
10. [Conclusión: UD3 como Puente hacia Spring Boot](#10-conclusión-ud3-como-puente-hacia-spring-boot)

---

## 1. Introducción: El Valor de los Datos Consolidados

En las unidades anteriores (UD1 y UD2) hemos construido la base del ERP Balmis:
- **UD1**: Entendimos qué es un ERP y exploramos la estructura de Axelor (módulos, conceptos, navegación).
- **UD2**: Implementamos un ciclo de negocio completo en Axelor (empresa, clientes, productos, pedidos, proveedores).

Ahora en **UD3**, tenemos datos. Muchos datos. La pregunta que se plantea todo gerente es: **¿Cómo extraer información útil de esos datos?**

En Axelor esto se hace mediante:
- **Filtros y consultas**: para buscar datos específicos (ej: "clientes activos de la región de Levante").
- **Informes**: para agregar y presentar datos (ej: "ventas por mes").
- **Dashboard**: para visualizar KPIs en tiempo real (ej: "ingresos de hoy", "pedidos pendientes").
- **Exportaciones**: para llevar los datos a Excel, PDF o enviarlos a otros sistemas.

Al final de esta unidad, tu **Cuaderno de Referencia Axelor** tendrá toda la información que necesitas para diseñar e implementar el **Dashboard del Reto Final** del ERP Balmis.

---

## 2. Filtros y Consultas Avanzadas en Axelor

### 2.1 Concepto: La Barra de Filtrado

En Axelor, cada listado (Clientes, Productos, Pedidos, etc.) incluye una **barra de filtrado** en la parte superior. Esta barra permite:
- Búsqueda de texto libre (busca en campos configurados).
- Filtros por campos específicos (tipo de cliente, estado, rango de fechas).
- Búsqueda avanzada con operadores (mayor que, menor que, contiene, etc.).
- Guardado de filtros personalizados para uso futuro.

### 2.2 Filtrado Básico de Clientes por Estado

**Tutorial paso a paso:**

1. **Acceder al módulo CRM**
   - Desde la pantalla principal de Axelor, haz clic en **CRM** (icono con personas).
   - Se abrirá el menú del módulo CRM.

2. **Abrir el listado de Clientes**
   - En el menú CRM, selecciona **Clientes** (o **Prospects** según la versión).
   - Verás el listado completo de clientes que creaste en UD2 (empresa ficticia + 3 clientes: Prospecto, Activo, Inactivo).

3. **Aplicar Filtro por Estado**
   - En la barra de filtrado (parte superior izquierda), localiza el campo de **búsqueda rápida** (cuadro de texto con lupa).
   - Alternativamente, busca el botón **"Filtro"** o icono de embudo (⊕ icono).
   - **Opción A**: Haz clic en el desplegable que dice "Todos" o "Todos los clientes".
   - **Opción B**: Usa el panel lateral izquierdo si existe un árbol de filtros precargados (ej: "Activos", "Inactivos", "Prospectos").

4. **Seleccionar Clientes Activos**
   - Si aparece un panel de filtros, marca la casilla **"Activos"**.
   - Si no aparece, busca un campo llamado `tipoCliente` o `Type` y selecciona **"ACTIVO"**.
   - El listado se actualizará automáticamente mostrando solo los clientes con estado Activo.

5. **Captura de la pantalla**
   - Realiza una captura de pantalla del listado filtrado (mostrando solo clientes activos).
   - **Nota para el Cuaderno**: Etiqueta esta captura como "Clientes Filtrados por Estado — Solo Activos" e incluye una nota: "Este filtro es la base para la consulta `findByTipoCliente()` en el Reto 4".

### 2.3 Búsqueda Avanzada: Filtro Combinado

**Objetivo**: Practicar filtros más complejos (múltiples criterios).

**Tutorial**:

1. **Acceder a Búsqueda Avanzada**
   - En el listado de clientes, busca un botón **"Búsqueda Avanzada"** (generalmente un icono de tres líneas o un botón etiquetado).
   - O presiona **Ctrl+Shift+F** (atajo de teclado en algunas interfaces).

2. **Aplicar Múltiples Criterios**
   - Añade un filtro: `tipoCliente = ACTIVO`
   - Añade otro criterio: `ciudad = "Tu ciudad ficticia"` (si tienes este campo).
   - Haz clic en **"Buscar"** o **"Aplicar"**.

3. **Guardar el Filtro Personalizado**
   - Una vez aplicado el filtro, busca una opción **"Guardar filtro"** o **"Guardar búsqueda"**.
   - Dale un nombre: `"Clientes Activos — Mi Ciudad"`.
   - Este filtro aparecerá la próxima vez que abras el listado de clientes.

4. **Captura**
   - Captura del filtro avanzado aplicado.
   - Nota en el Cuaderno: "Los filtros guardados permiten acceso rápido a datos frecuentes — análogo a endpoints con @Query en Spring Boot".

---

## 3. Dashboard de Ventas: Visualización de KPIs

### 3.1 ¿Qué es el Dashboard de Axelor?

El **Dashboard** es una página que consolida KPIs (Key Performance Indicators) en tiempo real. En Axelor, el dashboard de Ventas típicamente muestra:
- Número de **pedidos por estado** (BORRADOR, CONFIRMADO, ENVIADO, FACTURADO).
- **Total facturado** del mes/trimestre/año.
- **Top productos** más vendidos.
- **Clientes activos** vs. **prospectos**.
- Gráficos de tendencias.

### 3.2 Acceder al Dashboard de Ventas

**Tutorial paso a paso**:

1. **Desde la pantalla principal**
   - En la pantalla de inicio de Axelor, busca un apartado llamado **"Dashboard"** o un icono de gráfico.
   - O navega a través del menú: **Módulo Ventas** → **Dashboard**.

2. **Explorar el Dashboard predeterminado**
   - El dashboard mostrará gráficos como:
     - **Gráfico de barras**: Pedidos por estado.
     - **Gráfico circular**: Distribución de clientes por tipo.
     - **Tabla**: Últimos pedidos creados.
     - **Contador**: "Total facturado en lo que va de mes".

3. **Interactuar con los gráficos**
   - Haz clic en un segmento de un gráfico (ej: el segmento "Activos" en el gráfico circular).
   - El sistema **filtrada** el listado de clientes asociados al segmento seleccionado.
   - Esta interactividad es lo que queremos replicar en el **Reto Final** del ERP Balmis.

4. **Captura del Dashboard**
   - Realiza varias capturas del dashboard de Ventas.
   - **Captura 1**: Vista completa del dashboard (todos los gráficos y contadores).
   - **Captura 2**: Detalles de un gráfico (zoom en un KPI específico).
   - **Captura 3** (opcional): Resultado después de hacer clic en un elemento del gráfico.

5. **Nota en el Cuaderno**
   ```
   DASHBOARD DE AXELOR — REFERENCIA PARA ERP BALMIS:
   
   KPIs Observados:
   - Clientes Activos: [número]
   - Prospectos: [número]
   - Pedidos por Estado:
     * Borrador: [número]
     * Confirmado: [número]
     * Enviado: [número]
     * Facturado: [número]
   - Total Facturado (mes): [cantidad]
   - Productos con Stock Bajo: [número]
   
   Implementación en ERP Balmis (Reto Final):
   Endpoint: GET /api/dashboard
   Response: JSON con estructura idéntica a estos KPIs.
   ```

---

## 4. Informes y Exportaciones

### 4.1 Concepto: Informes de Negocio

Un **informe** es un documento generado a partir de los datos del ERP, diseñado para:
- Presentación gerencial (reportes ejecutivos).
- Auditoría (prueba de transacciones).
- Análisis de negocio (tendencias, predicciones).
- Exportación a terceros (proveedores, clientes, administración).

Axelor permite generar informes en **PDF** y **Excel**, y los datos pueden personalizarse mediante filtros.

### 4.2 Generar Informe de Ventas: Paso a Paso

**Tutorial**:

1. **Acceder al generador de informes**
   - Desde el módulo **Ventas**, busca una opción **"Informes"** o **"Reports"**.
   - Selecciona **"Informe de Ventas"** o **"Sales Report"** (si existe predefinido).

2. **Configurar parámetros del informe**
   - Si no existe un informe predefinido, crea uno:
     - **Período**: Selecciona el mes actual (o mes de UD2).
     - **Tipo de grupo**: Por Cliente / Por Producto / Por Estado.
     - **Incluir**: Totales, subtotales, descuentos.

3. **Generar el informe**
   - Haz clic en **"Generar"** o **"Generate Report"**.
   - El sistema procesará los datos y creará un documento temporal.

4. **Exportar a PDF**
   - Una vez generado, busca el botón **"Exportar"** o **"Download PDF"**.
   - Guarda el archivo como `Informe_Ventas_[MesAño].pdf`.

5. **Exportar a Excel** (alternativa)
   - En muchos listados (ej: Pedidos, Clientes), existe un botón **"Exportar a Excel"**.
   - Esto es útil para análisis posterior en hojas de cálculo.

6. **Captura y Notas**
   - Captura del informe generado (o primera página del PDF).
   - Captura del proceso de exportación.
   - Nota en el Cuaderno:
     ```
     INFORME DE VENTAS AXELOR:
     - Período: [mes/año]
     - Número de pedidos: [cantidad]
     - Ingresos totales: [cantidad]
     - Producto más vendido: [nombre]
     - Cliente con mayor compra: [nombre]
     
     Análisis para ERP Balmis:
     - Endpoint de estadísticas: GET /api/pedidos/estadisticas
     - Endpoint de Dashboard: GET /api/dashboard
     ```

---

## 5. Gestión de Usuarios y Roles

### 5.1 Concepto: Control de Acceso Basado en Roles (RBAC)

En Axelor (como en cualquier ERP profesional), no todos los usuarios pueden hacer todo. El sistema controla el acceso mediante:
- **Roles**: Grupos de permisos (ADMIN, MANAGER, EMPLEADO, AUDITOR, etc.).
- **Permisos**: Acciones específicas (crear cliente, eliminar pedido, ver reportes).
- **Grupos de acceso**: Conjuntos de usuarios con el mismo rol.

Esto es lo que implementaremos en el **Reto 6** (Spring Security + JWT) del ERP Balmis.

### 5.2 Tutorial: Explorar la Gestión de Roles en Axelor

**Objetivo**: Entender qué puede hacer cada rol en Axelor.

**Tutorial paso a paso**:

1. **Acceder a Administración**
   - En la pantalla principal de Axelor, busca un icono de **"Engranaje"** o **"Administración"**.
   - Haz clic para abrir el menú de administración.

2. **Acceder a Usuarios y Grupos**
   - En el menú de administración, selecciona **"Usuarios"** o **"Users"**.
   - Verás el listado de usuarios del sistema (incluyendo el usuario de UD2 que creaste).

3. **Seleccionar un usuario y revisar su rol**
   - Haz clic en un usuario (ej: el que creaste en UD2 con rol MANAGER).
   - En el formulario del usuario, localiza el campo **"Rol"** o **"Role"**.
   - Este campo puede mostrar un rol simple (ej: "Manager") o un árbol de permisos detallado.

4. **Explorar Permisos por Rol**
   - Busca una sección **"Roles y Permisos"** o **"Permissions"**.
   - Compara los permisos de diferentes roles:
     - **ADMIN**: Acceso completo a todo (crear, leer, actualizar, eliminar, configurar).
     - **MANAGER**: Leer y crear, pero no eliminar. Acceso a reportes.
     - **EMPLEADO**: Solo lectura. Sin acceso a precios ni márgenes de beneficio.
   - Típicamente hay una matriz de permisos mostrando estas diferencias.

5. **Captura y Análisis**
   - Captura de la página de Roles y Permisos en Axelor.
   - Captura de los permisos específicos de cada rol.

6. **Tabla Comparativa en el Cuaderno**
   ```
   | Acción         | ADMIN | MANAGER | EMPLEADO |
   |---|---|---|---|
   | Ver Clientes   | ✓     | ✓       | ✓        |
   | Crear Clientes | ✓     | ✓       | ✗        |
   | Editar Cliente | ✓     | ✓ (suyo) | ✗      |
   | Eliminar       | ✓     | ✗       | ✗        |
   | Ver Reportes   | ✓     | ✓       | ✗        |
   | Ver Precios    | ✓     | ✓       | ✗        |
   | Crear Pedidos  | ✓     | ✓       | ✗        |
   | Configurar     | ✓     | ✗       | ✗        |
   ```

7. **Conexión con Reto 6**
   - Nota en el Cuaderno:
     ```
     REFERENCIAS PARA RETO 6 (Spring Security + JWT):
     
     Diseño de Roles en ERP Balmis:
     - ADMIN: Acceso total.
     - MANAGER: CRUD completo, lecturas.
     - EMPLEADO: Solo lecturas.
     
     Protección de Endpoints:
     GET /api/clientes - ADMIN, MANAGER, EMPLEADO (lectura)
     POST /api/clientes - ADMIN, MANAGER (crear)
     DELETE /api/clientes/{id} - ADMIN (eliminar)
     GET /api/dashboard - ADMIN, MANAGER (reportes)
     ```

---

## 6. Actividades Prácticas: UD3

### Actividad 1: Filtrado de Clientes por Estado (0.5h)

**Objetivo**: Practicar el filtrado en listados.

**Pasos**:
1. Abre el módulo CRM y el listado de Clientes.
2. Aplica un filtro para mostrar **solo clientes Activos**.
3. Cuenta cuántos clientes activos hay en la base de datos.
4. Guarda el filtro personalizado como **"Clientes Activos"**.
5. Realiza una captura del listado filtrado.

**Entregable**: Captura del filtro aplicado + número de clientes activos.

**Utilidad para ERP Balmis**: Esta actividad es el equivalente funcional de la consulta `findByTipoCliente(TipoCliente.ACTIVO)` que implementarás en el Reto 4.

---

### Actividad 2: Exploración del Dashboard (0.5h)

**Objetivo**: Entender los KPIs que mostrar en el Dashboard del Reto Final.

**Pasos**:
1. Accede al Dashboard de Ventas en Axelor.
2. Identifica y documenta todos los KPIs visibles:
   - Clientes por tipo (Prospecto / Activo / Inactivo).
   - Pedidos por estado.
   - Total facturado.
   - Cualquier otro gráfico o contador.
3. Realiza capturas de cada KPI.
4. Haz clic en un elemento del gráfico (ej: segmento "Activos") para ver cómo filtra.

**Entregable**: Capturas del dashboard + tabla con lista de KPIs identificados.

**Utilidad para ERP Balmis**: Esta tabla será la **especificación funcional** del endpoint `GET /api/dashboard` en el Reto Final.

---

### Actividad 3: Generación de Informe de Ventas (1h)

**Objetivo**: Crear un informe de ventas que documente el estado actual de la empresa ficticia.

**Pasos**:
1. Accede al módulo Ventas → Informes.
2. Genera un informe de ventas del mes (período de UD2).
3. Configura el informe para incluir:
   - Todos los pedidos creados.
   - Total de ventas por cliente.
   - Productos más vendidos.
4. Exporta el informe a **PDF** con el nombre `Informe_Ventas_ERP_Balmis_[Fecha].pdf`.
5. Si no existe opción de informe automático, genera manualmente un listado de Pedidos y exporta a Excel.

**Entregable**: Archivo PDF o Excel con el informe de ventas.

**Utilidad para ERP Balmis**: Referencia de la información que mostrará en reportes avanzados.

---

### Actividad 4: Análisis de Roles y Permisos (0.5h)

**Objetivo**: Entender la matriz de permisos para diseñar el Reto 6.

**Pasos**:
1. Accede a Administración → Usuarios y Roles.
2. Crea o consulta al menos 2 roles diferentes (ej: MANAGER y EMPLEADO).
3. Para cada rol, documenta:
   - Qué módulos puede ver.
   - Qué acciones puede realizar (crear, editar, eliminar).
   - Acceso a reportes y dashboards.
4. Crea una tabla comparativa de permisos (ver Sección 5).

**Entregable**: Tabla comparativa de permisos por rol.

**Utilidad para ERP Balmis**: Especificación de autorización para el Reto 6 (Spring Security).

---

### Actividad 5: Exportación de Datos a Excel (0.5h)

**Objetivo**: Practicar la exportación de datos (herramienta útil para análisis posterior).

**Pasos**:
1. Abre el listado de **Productos**.
2. Haz clic en el botón **"Exportar a Excel"** (si está disponible).
3. Guarda el archivo como `Productos_ERP_Balmis.xlsx`.
4. Abre el archivo en Excel y verifica que contiene:
   - Referencia, descripción, precio, stock, categoría.
5. Realiza una captura de la hoja de Excel.

**Entregable**: Archivo Excel exportado + captura.

**Utilidad para ERP Balmis**: Familiarización con exportaciones de datos (pueden implementarse en el Reto Final como descarga de reportes).

---

## 7. Cuaderno de Referencia Axelor: Resumen para ERP Balmis

Al completar UD1, UD2 y UD3, tu **Cuaderno de Referencia Axelor** debe incluir estas secciones:

### 7.1 Sección 1: Ficha de Entidades
Una tabla con los campos de cada entidad en Axelor → Referencia para las clases JPA en Reto 1.

**Ejemplo**:
```
| Entidad | Campo | Tipo | Validación | Referencia JPA |
|---|---|---|---|---|
| Cliente | codigoCliente | String | Único | @Column(unique=true) |
| Cliente | nombre | String | NotBlank | @NotBlank |
| Cliente | tipoCliente | Enum | PROSPECTO/ACTIVO/INACTIVO | @Enumerated |
| Producto | referencia | String | Único | @Column(unique=true) |
| Pedido | estado | Enum | BORRADOR/CONFIRMADO/... | @Enumerated |
```

### 7.2 Sección 2: Flujo de Negocio Completo
Diagrama o descripción del ciclo Prospecto → Cliente → Pedido → Factura, con capturas de cada paso en Axelor.

### 7.3 Sección 3: Dashboard — Especificación
Capturas del dashboard de Axelor + tabla de KPIs que debe incluir el endpoint `GET /api/dashboard` en Reto Final.

### 7.4 Sección 4: Matriz de Roles y Permisos
Tabla comparativa de permisos por rol (ADMIN, MANAGER, EMPLEADO) → Referencia para Reto 6 (Spring Security).

---

## 8. Entregable: Cuaderno de Referencia Axelor (PDF)

### Requisitos del Entregable

Tu **Cuaderno de Referencia Axelor** debe ser un documento PDF que incluya:

1. **Portada** con título, nombre, fecha y referencia a UD1-UD3.

2. **Tabla de Contenidos**.

3. **Sección 1: Ficha de Entidades** (3-5 páginas)
   - Tabla con campos de cada entidad.
   - Capturas de formularios en Axelor.
   - Notas sobre tipos de datos y validaciones.

4. **Sección 2: Flujo de Negocio** (4-6 páginas)
   - Diagrama del ciclo Prospecto → Cliente → Pedido → Factura.
   - Capturas de cada paso en Axelor.
   - Estados y transiciones de documentos.

5. **Sección 3: Dashboard y KPIs** (2-3 páginas)
   - Capturas del dashboard de Axelor.
   - Tabla de KPIs (clientes por tipo, pedidos por estado, etc.).
   - Especificación de estructura JSON para ERP Balmis.

6. **Sección 4: Roles y Permisos** (2 páginas)
   - Tabla matriz de permisos.
   - Capturas de la configuración de roles.
   - Especificación de roles para Spring Security.

7. **Apéndice**: Capturas de todas las actividades + notas pedagógicas.

### Criterios de Evaluación

| Criterio | Peso | Descripción |
|---|---|---|
| **Completitud** | 30% | Incluye todas las secciones requeridas y capturas. |
| **Precisión técnica** | 40% | Las entidades, flujos y permisos descritos coinciden con la implementación en Axelor. |
| **Claridad y presentación** | 20% | Documento bien estructurado, legible, con buen diseño. |
| **Utilidad para ERP Balmis** | 10% | El documento puede usarse como especificación para implementar los Retos. |

**Puntuación**: 0-100 puntos.
- 80+ puntos: Excelente. Documento listo para usar como referencia en los Retos.
- 60-79 puntos: Aceptable. Contiene lo esencial pero puede mejorar en detalle.
- < 60 puntos: Requiere mejoras significativas.

---

## 9. Conexión con el ERP Balmis: Referencia para Retos Futuros

### De Axelor a Spring Boot

La tabla siguiente muestra cómo cada elemento de UD3 (Axelor) se traduce a código en los Retos:

| Concepto en Axelor | Implementación en ERP Balmis | Reto |
|---|---|---|
| Filtro de clientes por estado | `ClienteRepository.findByTipoCliente(tipo)` | Reto 4 |
| Dashboard de ventas | Endpoint `GET /api/dashboard` | Reto Final |
| KPI: Clientes activos | `clienteRepository.countByTipoCliente(ACTIVO)` | Reto Final |
| KPI: Pedidos por estado | `pedidoRepository.findByEstado(...)` | Reto Final |
| Informe de ventas | `GET /api/pedidos/estadisticas` | Reto 5 |
| Gestión de roles | Spring Security + `@PreAuthorize` | Reto 6 |
| Matriz de permisos | `SecurityConfig` + roles ADMIN/MANAGER/EMPLEADO | Reto 6 |

### Ejemplo: De Axelor Dashboard a API REST

**En Axelor** (UD3):
- Ves un gráfico de "Pedidos por Estado" en el Dashboard.
- Clicas en el segmento "Confirmado" y el sistema filtra el listado.

**En ERP Balmis** (Reto Final):
```json
GET /api/dashboard

{
  "clientesActivos": 15,
  "prospectos": 8,
  "pedidosPorEstado": {
    "BORRADOR": 2,
    "CONFIRMADO": 5,
    "ENVIADO": 3,
    "FACTURADO": 12
  },
  "totalFacturado": 45000.00,
  "productosStockBajo": 3,
  "top5Productos": [
    {"nombre": "Producto A", "vendidos": 150},
    {"nombre": "Producto B", "vendidos": 120},
    ...
  ]
}
```

---

## 10. Conclusión: UD3 como Puente hacia Spring Boot

UD3 cierra el ciclo de **referencia funcional** en Axelor. A partir del **Reto 0** (UD4), comenzaremos a **implementar** lo que hemos visto:

- UD1: "Esto es un ERP" → Conceptos.
- UD2: "Este es el ciclo de negocio" → Procesos.
- **UD3: "Estos son los datos consolidados y cómo se usan" → Información y decisiones** ← **Aquí estamos ahora.**

El **Cuaderno de Referencia Axelor** que completes será tu **"especificación funcional"** para los próximos 10 retos de Spring Boot. Cada vez que implementes un endpoint REST, una consulta JPQL o una protección de seguridad, volverás a este cuaderno y dirás: "Esto ya lo vi en Axelor."

Al terminar el **Reto Final**, tu ERP Balmis no será una copia de Axelor (que tiene años de desarrollo), pero será lo suficientemente **parecido funcionalmente** para que el proceso de aprendizaje haya sido coherente y significativo.

**Bienvenido a la última unidad de referencia funcional. Ahora toca programar.** 🚀
