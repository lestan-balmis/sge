---
title: UD2 — Implantación de Axelor
description: Configuración de empresa, ciclo de negocio completo y prácticas de gestión integrada
---

### Implantación de una Empresa Ficticia en Axelor
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 6 horas  
> **Herramienta:** Axelor (referencia funcional del ERP Balmis)  
> **Objetivo:** Recorrer el ciclo de negocio completo del ERP Axelor configurando una empresa ficticia: desde la creación de clientes hasta la generación de una factura, comprendiendo cómo todos los módulos (CRM, Ventas, Compras, Inventario) trabajan de forma integrada.

---

## Índice

1. [Conceptos de Implantación ERP](#1-conceptos-de-implantación-erp)
2. [La Empresa Ficticia: Balmis Tech Solutions](#2-la-empresa-ficticia-balmis-tech-solutions)
3. [Módulo de Configuración: Datos Maestros](#3-módulo-de-configuración-datos-maestros)
4. [Módulo CRM: Gestión de Clientes y Prospectos](#4-módulo-crm-gestión-de-clientes-y-prospectos)
5. [Módulo de Inventario: Productos y Catálogo](#5-módulo-de-inventario-productos-y-catálogo)
6. [Módulo de Compras: Proveedores y Órdenes de Compra](#6-módulo-de-compras-proveedores-y-órdenes-de-compra)
7. [Módulo de Ventas: Ciclo Pedido-Factura](#7-módulo-de-ventas-ciclo-pedido-factura)
8. [Ciclo Completo: Prospecto → Pedido → Factura](#8-ciclo-completo-prospecto--pedido--factura)
9. [Dashboard y Seguimiento](#9-dashboard-y-seguimiento)
10. [Actividades Prácticas](#10-actividades-prácticas)
11. [Entregable y Documentación](#11-entregable-y-documentación)

---

## 1. Conceptos de Implantación ERP

### ¿Qué es una Implantación ERP?

Una **implantación ERP** es el proceso de configurar, adaptar e integrar un sistema ERP en una organización real. No es simplemente instalar el software: implica:

- **Diseño de datos maestros**: definir qué empresas, clientes, productos y proveedores manejará el sistema.
- **Integración de procesos**: conectar los módulos de forma que cada decisión en ventas afecte al almacén, contabilidad y compras.
- **Definición de flujos de trabajo**: establecer cómo avanza un documento (pedido, factura, orden de compra) a través de los estados.
- **Asignación de roles y permisos**: definir quién puede ver, crear y modificar cada tipo de información.

En una empresa real, una implantación ERP puede durar meses o años. En esta UD, haremos una implantación **simulada** de una empresa ficticia en unas pocas horas, pero con toda la estructura real de un ERP profesional.

### Ciclo de Vida de la Implantación

| Fase | Duración | Objetivo |
|---|---|---|
| **Configuración** | 1h | Crear la empresa, definir moneda, ejercicio fiscal |
| **Datos Maestros** | 2h | Dar de alta clientes, proveedores, productos |
| **Flujos de Negocio** | 2h | Crear documentos reales: pedidos, órdenes de compra |
| **Validación** | 1h | Verificar que todo funciona integrado |

---

## 2. La Empresa Ficticia: Balmis Tech Solutions

Para esta UD, trabajaremos con una empresa ficticia que llamaremos **Balmis Tech Solutions**. Los datos son ficticios, pero realistas:

**Datos de la Empresa:**

| Campo | Valor |
|---|---|
| **Nombre** | Balmis Tech Solutions S.L. |
| **CIF** | B98765432 |
| **Correo** | info@balmistech.es |
| **Teléfono** | +34 96 123 45 67 |
| **Dirección** | Calle Médico Javier Balmis, 42, Alicante |
| **Código Postal** | 03004 |
| **Población** | Alicante |
| **País** | España |
| **Moneda** | EUR (Euro) |
| **Ejercicio Fiscal** | Año calendario (1 enero - 31 diciembre) |

Esta empresa se dedica a la **venta de soluciones tecnológicas** (software, hosting, consultoría). Su ciclo de negocio es:

1. Identifica prospectos interesados en sus servicios
2. Genera propuestas y presupuestos
3. Convierte prospectos en clientes
4. Emite pedidos de servicio
5. Genera facturas

---

## 3. Módulo de Configuración: Datos Maestros

### ¿Qué son los Datos Maestros?

Los **datos maestros** son la información base que usará todo el ERP. Son como los **archivos de un hospital**: si los datos del paciente son incorrectos, todo el historial clínico será incorrecto.

En Axelor, los datos maestros incluyen:
- Empresa
- Moneda y tasas de cambio
- Ejercicios fiscales
- Almacenes
- Centros de coste
- Categorías de productos

### Tutorial: Crear la Empresa en Axelor

#### Paso 1: Acceder a Configuración

1. En la **pantalla principal de Axelor**, haz clic en el **menú hamburguesa** (≡) en la esquina superior izquierda.
2. Navega a: `Administración` → `Configuración Empresarial` → `Empresas`

Alternativamente, usa la **barra de búsqueda rápida** (arriba a la derecha):
- Escribe "Empresa" y selecciona el módulo de Empresas.

#### Paso 2: Crear Nueva Empresa

1. Haz clic en el botón **"Nuevo"** (+ verde en la esquina superior derecha).
2. Se abrirá un formulario vacío con los siguientes campos:

**Información General:**
- **Nombre**: `Balmis Tech Solutions S.L.`
- **Código**: `BTS` (identificador único de la empresa)
- **Descripción**: `Empresa ficticia para prácticas SGE`

**Información Fiscal y Legal:**
- **CIF/NIF**: `B98765432`
- **Código DUNS**: (opcional, dejar en blanco)
- **Descripción fiscal**: `Empresa especializada en soluciones tecnológicas`

**Contacto:**
- **Correo electrónico**: `info@balmistech.es`
- **Teléfono**: `+34 96 123 45 67`
- **Página web**: `www.balmistech.es` (opcional)

**Dirección:**
- **Calle**: `Calle Médico Javier Balmis, 42`
- **Código Postal**: `03004`
- **Población**: `Alicante`
- **Departamento**: `Alicante`
- **País**: `España`

**Datos Administrativos:**
- **Moneda de la empresa**: `EUR` (Euro)
- **Ejercicio fiscal**: Selecciona o crea uno nuevo (01/01 - 31/12)

#### Paso 3: Guardar

Haz clic en **"Guardar"** (Ctrl+S o el icono de disquete).

**Resultado esperado**: La empresa queda registrada en Axelor. Aparecerá un mensaje: "Empresa creada exitosamente".

---

## 4. Módulo CRM: Gestión de Clientes y Prospectos

### Entidades del Módulo CRM

En el módulo CRM, trabajaremos con tres conceptos clave:

| Entidad | Descripción | Ejemplos |
|---|---|---|
| **Prospecto** | Contacto potencial aún no convertido | "Una empresa que vio nuestro anuncio" |
| **Cliente Activo** | Ha comprado al menos una vez | "Ya tiene pedidos registrados" |
| **Cliente Inactivo** | No ha comprado en X tiempo | "Compró hace 2 años, no ha vuelto" |

### Tutorial: Dar de Alta Clientes en CRM

#### Acceso al Módulo CRM

1. En el menú, navega a: `CRM` → `Clientes y Contactos` → `Clientes`
2. O busca "Cliente" en la barra de búsqueda rápida.

#### Cliente 1: Prospecto (TechStart Innovadores)

1. Haz clic en **"Nuevo"**.
2. Rellena los siguientes campos:

**Información del Cliente:**
- **Nombre**: `TechStart Innovadores S.L.`
- **Código de Cliente**: (Axelor lo genera automáticamente)
- **Tipo de Cliente**: `Prospecto` (selecciona en el desplegable)
- **Fecha de Alta**: `[Fecha actual]`

**Contacto:**
- **Correo Electrónico**: `contacto@techstart.es`
- **Teléfono**: `+34 93 987 65 43`

**Dirección:**
- **País**: `España`
- **Departamento**: `Barcelona`
- **Población**: `Barcelona`

**Notas de Seguimiento:**
- Agrega una nota: `"Primera reunión programada para la próxima semana. Cliente interesado en solución Cloud"`

Haz clic en **"Guardar"**.

#### Cliente 2: Cliente Activo (Iberdrolatech)

1. Haz clic en **"Nuevo"**.
2. Rellena los campos:

**Información del Cliente:**
- **Nombre**: `Iberdrolatech S.A.`
- **Tipo de Cliente**: `Activo`
- **Fecha de Alta**: `01/03/2026` (hace unos meses)

**Contacto:**
- **Correo Electrónico**: `ventas@iberdrolatech.es`
- **Teléfono**: `+34 91 234 56 78`

**Dirección:**
- **País**: `España`
- **Departamento**: `Madrid`
- **Población**: `Madrid`

Haz clic en **"Guardar"**.

#### Cliente 3: Cliente Inactivo (Mobiliario Vintage)

1. Haz clic en **"Nuevo"**.
2. Rellena los campos:

**Información del Cliente:**
- **Nombre**: `Mobiliario Vintage S.L.`
- **Tipo de Cliente**: `Inactivo`
- **Fecha de Alta**: `15/06/2024` (hace más de un año)

**Contacto:**
- **Correo Electrónico**: `contacto@mobvintage.es`
- **Teléfono**: `+34 94 456 78 90`

**Dirección:**
- **País**: `España`
- **Departamento**: `Bilbao`
- **Población**: `Bilbao`

**Notas:**
- Agrega una nota: `"Cliente no ha realizado compras desde hace 18 meses. Considerar campaña de reactivación"`

Haz clic en **"Guardar"**.

#### Verificación

Navega a la lista de clientes. Deberías ver:
- **3 clientes** registrados
- Filtrados correctamente por tipo: Prospecto, Activo, Inactivo

---

## 5. Módulo de Inventario: Productos y Catálogo

### Estructura de Productos en Axelor

En Axelor, los productos se organizan en:
- **Categorías** (ejemplo: "Soluciones Cloud", "Consultoría")
- **Productos** (ejemplo: "Hosting Básico", "Auditoría de Seguridad")

Cada producto tiene:
- **Referencia** (código único)
- **Descripción**
- **Precio de venta** (PVP)
- **Precio de coste** (coste interno)
- **Stock disponible**
- **Unidad de medida** (unidad, hora, mes, etc.)

### Tutorial: Crear Productos

#### Paso 1: Crear Categorías (opcional pero recomendado)

1. Navega a: `Inventario` → `Configuración` → `Categorías de Productos`
2. Crea 2 categorías:

**Categoría 1:**
- **Nombre**: `Soluciones Cloud`
- **Descripción**: `Servicios en la nube y hosting`

**Categoría 2:**
- **Nombre**: `Consultoría`
- **Descripción**: `Servicios de asesoramiento y consultoría tecnológica`

#### Paso 2: Crear Productos

Navega a: `Inventario` → `Productos` → `Productos`

**Producto 1: Hosting Básico**

1. Haz clic en **"Nuevo"**.
2. Rellena los campos:

- **Nombre**: `Hosting Básico - 1 año`
- **Referencia**: `HOST-BASIC-1Y` (código único)
- **Descripción**: `Alojamiento web básico con 50 GB de almacenamiento, soporte 24/7`
- **Categoría**: `Soluciones Cloud`
- **Tipo de Producto**: `Servicio` (o `Bien`, dependiendo de la configuración)
- **Precio de Venta**: `120.00 EUR`
- **Precio de Coste**: `35.00 EUR`
- **Stock Inicial**: `999` (servicios ilimitados)
- **Unidad de Medida**: `Año`

Haz clic en **"Guardar"**.

**Producto 2: Hosting Premium - 1 año**

- **Nombre**: `Hosting Premium - 1 año`
- **Referencia**: `HOST-PREM-1Y`
- **Descripción**: `Alojamiento web premium con 500 GB, CDN, SSL incluido, soporte prioritario`
- **Categoría**: `Soluciones Cloud`
- **Precio de Venta**: `299.00 EUR`
- **Precio de Coste**: `85.00 EUR`
- **Stock Inicial**: `999`
- **Unidad de Medida**: `Año`

Haz clic en **"Guardar"**.

**Producto 3: Auditoría de Seguridad**

- **Nombre**: `Auditoría de Seguridad Completa`
- **Referencia**: `AUDIT-SEC-FULL`
- **Descripción**: `Análisis exhaustivo de vulnerabilidades, penetration testing y reporte detallado`
- **Categoría**: `Consultoría`
- **Precio de Venta**: `1500.00 EUR`
- **Precio de Coste**: `450.00 EUR`
- **Stock Inicial**: `999`
- **Unidad de Medida**: `Servicio`

Haz clic en **"Guardar"**.

**Producto 4: Consultoría Cloud (por hora)**

- **Nombre**: `Consultoría Cloud - Hora`
- **Referencia**: `CONSULT-CLOUD-H`
- **Descripción**: `Asesoramiento especializado en migraciones a cloud y arquitectura escalable`
- **Categoría**: `Consultoría`
- **Precio de Venta**: `150.00 EUR`
- **Precio de Coste**: `50.00 EUR`
- **Stock Inicial**: `999`
- **Unidad de Medida**: `Hora`

Haz clic en **"Guardar"**.

**Producto 5: Mantenimiento Preventivo (mensual)**

- **Nombre**: `Mantenimiento Preventivo - Mes`
- **Referencia**: `MAINT-PREV-M`
- **Descripción**: `Mantenimiento mensual: actualizaciones, parches de seguridad, optimización`
- **Categoría**: `Soluciones Cloud`
- **Precio de Venta**: `85.00 EUR`
- **Precio de Coste**: `25.00 EUR`
- **Stock Inicial**: `999`
- **Unidad de Medida**: `Mes`

Haz clic en **"Guardar"**.

---

## 6. Módulo de Compras: Proveedores y Órdenes de Compra

### Concepto de Proveedores

Un **proveedor** es una entidad externa que suministra productos o servicios a nuestra empresa. En el caso de Balmis Tech Solutions, necesitamos proveedores para:
- Servicios en la nube (AWS, Google Cloud)
- Certificados SSL
- Soporte técnico especializado

### Tutorial: Crear Proveedores

Navega a: `Compras` → `Proveedores y Contactos` → `Proveedores`

**Proveedor 1: CloudServices Global**

1. Haz clic en **"Nuevo"**.
2. Rellena los campos:

- **Nombre**: `CloudServices Global Inc.`
- **Código de Proveedor**: `CSG-001` (único)
- **Correo Electrónico**: `sales@cloudservicesglobal.com`
- **Teléfono**: `+1 415 555 0123` (proveedor internacional)
- **Dirección**: `San Francisco, California, USA`
- **País**: `Estados Unidos`

Haz clic en **"Guardar"**.

**Proveedor 2: SeguridadWeb Ibérica**

- **Nombre**: `SeguridadWeb Ibérica S.L.`
- **Código de Proveedor**: `SWI-001`
- **Correo Electrónico**: `contacto@seguridadwebiberica.es`
- **Teléfono**: `+34 93 123 45 67`
- **Dirección**: `Barcelona, España`
- **País**: `España`

Haz clic en **"Guardar"**.

### Tutorial: Crear una Orden de Compra

Navega a: `Compras` → `Órdenes de Compra`

#### Orden de Compra 1: Adquisición de Servicios Cloud

1. Haz clic en **"Nuevo"**.
2. Rellena los campos principales:

**Cabecera del Documento:**
- **Proveedor**: `CloudServices Global Inc.` (selecciona de la lista)
- **Fecha de Orden**: `[Fecha actual]`
- **Referencia**: Se genera automáticamente
- **Estado**: Inicialmente aparecerá como `Borrador`

**Líneas de la Orden:**

Haz clic en **"Agregar línea"** y rellena:

| Campo | Valor |
|---|---|
| Producto | (Busca en tu catálogo) — aquí podrías usar servicios Cloud internos |
| Cantidad | 1 |
| Precio unitario | (Axelor lo sugiere según el proveedor) |

3. El total se calcula automáticamente.

4. Haz clic en **"Guardar"**, luego en **"Confirmar"** (o **"Validar"** según la configuración).

**Resultado**: La orden pasa a estado `Confirmada` o `Recibida` según el flujo configurado.

---

## 7. Módulo de Ventas: Ciclo Pedido-Factura

### Concepto del Ciclo Completo

El ciclo de ventas en Axelor sigue estos pasos:

```
PRESUPUESTO (cotización)
      ↓
  CONFIRMACIÓN (Cliente acepta)
      ↓
  PEDIDO DE VENTA
      ↓
  ALBARÁN (Salida de almacén)
      ↓
  FACTURA (Documento fiscal)
      ↓
  COBRO (Pago recibido)
```

Para esta UD, nos enfocamos en los primeros pasos: presupuesto → pedido → factura.

### Tutorial: Crear un Presupuesto (Cotización)

Navega a: `Ventas` → `Presupuestos y Pedidos` → `Presupuestos`

#### Presupuesto para TechStart Innovadores

1. Haz clic en **"Nuevo"**.
2. Rellena los campos:

**Información del Presupuesto:**
- **Cliente**: `TechStart Innovadores S.L.` (el prospecto que dimos de alta)
- **Fecha**: `[Fecha actual]`
- **Referencia**: Se genera automáticamente

**Líneas del Presupuesto:**

Haz clic en **"Agregar línea"** e incluye 2 servicios:

| Línea | Producto | Cantidad | Precio Unitario | Subtotal |
|---|---|---|---|---|
| 1 | Hosting Básico - 1 año | 2 | 120.00 EUR | 240.00 EUR |
| 2 | Consultoría Cloud - Hora | 5 | 150.00 EUR | 750.00 EUR |

El total se calcula automáticamente: **990.00 EUR**

3. **Información adicional** (opcional):
   - **Condiciones de pago**: "Neto 30"
   - **Notas**: "Presupuesto válido por 30 días. Incluye prueba gratuita de 7 días."

4. Haz clic en **"Guardar"**.

5. Haz clic en **"Validar"** o **"Confirmar"** para generar el presupuesto oficial.

**Resultado esperado**: El presupuesto aparece en estado `Confirmado` y se genera un documento PDF descargable.

### Tutorial: Convertir Presupuesto en Pedido

1. En el presupuesto `TechStart Innovadores`, busca el botón **"Convertir a Pedido"** (o similar, según la versión de Axelor).
2. Axelor genera automáticamente un **Pedido de Venta** con las mismas líneas.

**Resultado**: Se crea un nuevo documento en `Ventas` → `Presupuestos y Pedidos` → `Pedidos` con el cliente y las líneas copiadas.

### Tutorial: Crear Factura desde el Pedido

Una vez que el Pedido está confirmado:

1. Navega a: `Ventas` → `Facturas Clientes`
2. Haz clic en **"Nuevo"** o busca el botón **"Generar Factura"** desde el Pedido.
3. Rellena los campos:

**Información de la Factura:**
- **Cliente**: `TechStart Innovadores S.L.`
- **Fecha de Facturación**: `[Fecha actual]`
- **Referencia**: Se genera automáticamente (ej: `FAC-2026-001`)
- **Período**: `Abril 2026` (o el mes actual)

**Líneas**:
Las líneas se copian automáticamente del Pedido:
- 2x Hosting Básico: 240.00 EUR
- 5x Consultoría Cloud: 750.00 EUR

**Totales** (calculados automáticamente):
- **Base Imponible**: 990.00 EUR
- **IVA (21%)**: 207.90 EUR
- **Total**: 1,197.90 EUR

4. Haz clic en **"Guardar"** y luego **"Validar"** para emitir la factura.

**Resultado**: La factura queda registrada, se puede descargar como PDF y aparece en los informes de ventas.

---

## 8. Ciclo Completo: Prospecto → Pedido → Factura

### Resumen del Proceso Integrado

A continuación se muestra cómo todos los módulos se conectan automáticamente:

| Paso | Módulo | Acción | Efecto en otros módulos |
|---|---|---|---|
| 1 | CRM | Cliente prospecto registrado | — |
| 2 | Ventas | Presupuesto creado | — |
| 3 | Ventas | Presupuesto validado | El cliente ve la propuesta oficial |
| 4 | Ventas | Convertir a Pedido | Se crea un Pedido con estado Borrador |
| 5 | Inventario | Reservar stock (automático) | El stock disponible se reduce |
| 6 | Ventas | Confirmar Pedido | El inventario registra el movimiento |
| 7 | Ventas | Generar Factura | Se crea el documento fiscal |
| 8 | Contabilidad | Factura validada | Se genera el asiento contable automáticamente |

### Diagrama del Flujo

```
PROSPECTO (CRM)
    ↓
PRESUPUESTO (Ventas)
    ↓
CLIENTE ACTIVO (CRM) ← [Si cliente acepta presupuesto]
    ↓
PEDIDO DE VENTA (Ventas)
    ↓
RESERVA DE STOCK (Inventario)
    ↓
FACTURA (Ventas)
    ↓
ASIENTO CONTABLE (Contabilidad) [automático]
    ↓
COBRO / PAGO (Tesorería)
```

---

## 9. Dashboard y Seguimiento

### Acceso al Dashboard de Ventas

1. En el menú principal, selecciona **Ventas**.
2. Aparecerá un **Dashboard** con widgets que muestran:

| Widget | Descripción |
|---|---|
| **Presupuestos Pendientes** | Cotizaciones sin confirmar |
| **Pedidos Recientes** | Últimos pedidos creados |
| **Ingresos Mensuales** | Total facturado en el mes |
| **Clientes Activos** | Número de clientes con pedidos |

### Consultas y Filtros

En Axelor, puedes filtrar documentos por:
- **Estado** (Borrador, Confirmado, Facturado)
- **Fecha** (rango personalizado)
- **Cliente** (un cliente específico)
- **Importe** (mayor que, menor que)

**Ejemplo de uso**: Para ver todos los presupuestos confirmados de abril:
1. Navega a Presupuestos
2. Haz clic en el icono de **Filtro**
3. Añade condiciones: Estado = Confirmado, Fecha entre 01/04 y 30/04
4. Haz clic en **Aplicar**

---

## 10. Actividades Prácticas

### Actividad 1: Configurar la Empresa Ficticia (1 hora)

**Objetivo**: Crear la estructura base de Balmis Tech Solutions.

**Pasos**:
1. Accede a Configuración → Empresas
2. Crea una nueva empresa con los datos especificados en la sección 2
3. Verifica que la empresa aparece en la lista

**Entregable**: Captura de pantalla del formulario completo de la empresa guardada.

---

### Actividad 2: Crear Clientes en el CRM (1 hora)

**Objetivo**: Registrar 3 clientes en diferentes estados del ciclo de vida.

**Pasos**:
1. Navega a CRM → Clientes
2. Crea 3 clientes (Prospecto, Activo, Inactivo) con los datos de la sección 4
3. Verifica que cada cliente tiene el tipo correcto

**Entregable**: Captura de pantalla de la lista de clientes con los 3 registros.

---

### Actividad 3: Crear Catálogo de Productos (1 hora)

**Objetivo**: Definir los productos/servicios que venderá Balmis Tech Solutions.

**Pasos**:
1. Navega a Inventario → Productos
2. Crea 5 productos (Hosting Básico, Hosting Premium, Auditoría, Consultoría, Mantenimiento)
3. Verifica que cada producto tiene precio, coste y stock

**Entregable**: Captura de pantalla del catálogo completo con los 5 productos.

---

### Actividad 4: Registrar Proveedores (0.5 horas)

**Objetivo**: Dar de alta 2 proveedores de servicios.

**Pasos**:
1. Navega a Compras → Proveedores
2. Crea 2 proveedores (CloudServices Global, SeguridadWeb Ibérica)
3. Verifica que aparecen en la lista

**Entregable**: Captura de pantalla de los 2 proveedores creados.

---

### Actividad 5: Ciclo Completo Presupuesto-Factura (1.5 horas)

**Objetivo**: Ejecutar el ciclo completo de ventas desde presupuesto hasta factura.

**Pasos**:
1. Crea un **Presupuesto** para TechStart Innovadores con al menos 2 líneas de productos
2. Valida el presupuesto
3. Convierte el presupuesto en **Pedido de Venta**
4. Confirma el pedido
5. Genera una **Factura** desde el pedido
6. Valida la factura

**Entregable**: 4 capturas de pantalla mostrando:
   - Presupuesto validado
   - Pedido generado
   - Factura generada
   - Dashboard de Ventas mostrando los documentos

---

### Actividad 6: Crear Orden de Compra (0.5 horas)

**Objetivo**: Registrar una compra a CloudServices Global.

**Pasos**:
1. Navega a Compras → Órdenes de Compra
2. Crea una nueva orden seleccionando CloudServices Global como proveedor
3. Agrega al menos 1 línea con un producto/servicio
4. Valida la orden

**Entregable**: Captura de pantalla de la orden confirmada.

---

## 11. Entregable y Documentación

### Entregable Final: Cuaderno de Implementación Axelor

Prepara un documento (PDF) con las siguientes secciones:

#### 1. Portada
- Título: "Cuaderno de Implementación Axelor — Balmis Tech Solutions"
- Estudiante, fecha, curso

#### 2. Datos de la Empresa
- Tabla con: Nombre, CIF, Dirección, Correo, Teléfono, Moneda
- Captura de pantalla del formulario de empresa en Axelor

#### 3. Catálogo de Productos
- Tabla con todos los productos: Referencia, Descripción, Precio Venta, Precio Coste
- Captura de pantalla de la lista de productos

#### 4. Clientes Registrados
- Tabla con: Nombre, Tipo (Prospecto/Activo/Inactivo), Correo, Teléfono
- Captura de pantalla de la lista de clientes

#### 5. Proveedores
- Tabla con: Nombre, Código, Contacto
- Captura de pantalla de la lista de proveedores

#### 6. Ciclo de Ventas Completo
- Capturas del Presupuesto, Pedido y Factura generados
- Para cada documento: referencia, cliente, líneas, total

#### 7. Reflexión Personal (1 página)
- ¿Qué observaste sobre cómo Axelor integra los módulos de CRM, Ventas e Inventario?
- ¿Cómo crees que esto será similar/diferente al construir el ERP Balmis con Spring Boot?
- ¿Qué fue lo más difícil de la implantación?

### Estructura de Archivos a Entregar

```
Entrega_UD2_[TuNombre]/
    ├── Cuaderno_Implementacion_Axelor.pdf
    ├── Capturas/
    │   ├── 01_empresa.png
    │   ├── 02_productos.png
    │   ├── 03_clientes.png
    │   ├── 04_proveedores.png
    │   ├── 05_presupuesto.png
    │   ├── 06_pedido.png
    │   └── 07_factura.png
    └── README.md (con instrucciones para reproducir)
```

### Criterios de Evaluación

| Criterio | Puntuación |
|---|---|
| Empresa configurada correctamente | 15% |
| 5 productos con datos completos | 15% |
| 3 clientes (Prospecto, Activo, Inactivo) | 15% |
| Ciclo completo (Presupuesto → Pedido → Factura) | 30% |
| Calidad de las capturas y documentación | 15% |
| Reflexión personal sobre la implantación | 10% |

---

## Conclusión

Al completar esta UD, habrás experimentado **en primera persona** cómo funciona una implantación ERP real, aunque a escala pequeña. Cada decisión que tomaste (crear clientes, configurar productos, generar facturas) es exactamente lo que hace un consultor ERP profesional en una empresa real.

Este conocimiento es la base que necesitarás cuando, en las próximas UDs, construyas tu propio ERP Balmis con Spring Boot: sabrás QUÉ estás programando y PARA QUÉ lo estás programando.

---

**Siguiente paso**: En UD3, aprenderemos a **consultar y analizar** los datos que acabas de crear en Axelor: filtros, búsquedas, informes y dashboards. Estos datos formarán la base de las consultas JPQL y endpoints REST que implementarás más adelante.
