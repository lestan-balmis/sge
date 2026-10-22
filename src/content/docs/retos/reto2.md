---
title: "Reto 2: La Vista"
description: Añadir una capa de presentación web al ERP Balmis usando Thymeleaf y el patrón MVC.
---

> **Reto anterior:** [Reto 1 — De la Semilla a la Raíz](/docs/retos/reto1)

---

## 📌 Resumen del Reto

Transformarás el Reto 1 añadiendo:
- **Thymeleaf:** Motor de plantillas HTML integrado con Spring Boot
- **Controladores MVC:** `@Controller` con `@GetMapping` y `Model`
- **Layout reutilizable:** Fragmento base con navbar estilo Odoo y Bootstrap 5
- **Tema marítimo:** Hoja de estilos propia (`balmis.css`) con la paleta de Balmis
- **Vistas de listado:** Clientes, Empleados y Productos
- **Panel de control:** Página de inicio con contadores

---

> **Conceptos teóricos:** El patrón MVC, Thymeleaf y los atributos `th:*` se explican en detalle en [UD5a — secciones 1, 2 y 3](/sge/spring/ud5a).

---

## 1. Preparación

### Crea una copia del proyecto
- Desde tu carpeta de trabajo **workspace-spring**, haz una copia de tu carpeta **spring**, manteniendo el nombre por defecto de **spring - copia**. Cambia el nombre del proyecto original **spring** por **reto1**, y cambia también el nombre de **spring - copia** por **spring**. 
- Desde el IDE de VSCode, añadiremos la capa de presentación

La estructura final del proyecto será:

```
src/
└── main/
    ├── java/com/iesdoctorbalmis/spring/
    │   ├── Application.java
    │   ├── controller/             ← NUEVO en Reto 2
    │   │   ├── HomeController.java
    │   │   ├── ClienteController.java
    │   │   ├── EmpleadoController.java
    │   │   └── ProductoController.java
    │   ├── entity/                 (sin cambios)
    │   └── repository/             (sin cambios)
    └── resources/
        ├── application.properties  (sin cambios)
        ├── import.sql              (sin cambios)
        ├── static/                 ← NUEVO en Reto 2
        │   ├── css/
        │   │   └── balmis.css
        │   └── img/
        │       ├── Logo_IES.png
        │       └── gva.png    
        └── templates/              ← NUEVO en Reto 2
            ├── fragments/
            │   └── layout.html
            ├── index.html
            ├── clientes/
            │   └── lista.html
            ├── empleados/
            │   └── lista.html
            └── productos/
                └── lista.html
```

---

## 2. Añadir Thymeleaf al proyecto

En el `pom.xml`, añade la dependencia de Thymeleaf:

```xml
<!-- Thymeleaf: motor de plantillas HTML (Reto 2) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

> **¿Por qué no estaba antes?** En el Reto 1 ya teníamos `spring-boot-starter-webmvc` (Tomcat embebido), pero sin Thymeleaf no hay motor de plantillas. Con esta dependencia, Spring Boot autoconfigura Thymeleaf para que resuelva las vistas en `src/main/resources/templates/`.

---

## 3. Controladores MVC

Un `@Controller` en Spring MVC es una clase que:
1. Recibe peticiones HTTP mediante `@GetMapping`, `@PostMapping`, etc.
2. Recupera datos de los repositorios.
3. Los pone en el `Model` para que la plantilla los use.
4. Devuelve el nombre de la plantilla a renderizar.

### HomeController

El controlador de inicio muestra el panel de control con los totales de cada entidad.

```java
package com.iesdoctorbalmis.spring.controller;

import com.iesdoctorbalmis.spring.repository.ClienteRepository;
import com.iesdoctorbalmis.spring.repository.EmpleadoRepository;
import com.iesdoctorbalmis.spring.repository.ProductoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;

    // Inyección por constructor
    public HomeController(ClienteRepository clienteRepository,
                          EmpleadoRepository empleadoRepository,
                          ProductoRepository productoRepository) {
        this.clienteRepository = clienteRepository;
        this.empleadoRepository = empleadoRepository;
        this.productoRepository = productoRepository;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("totalClientes", clienteRepository.count());
        model.addAttribute("totalEmpleados", empleadoRepository.count());
        model.addAttribute("totalProductos", productoRepository.count());
        return "index";  // → templates/index.html
    }
}
```

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `clienteRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "index"` indica a Thymeleaf que busque `templates/index.html`.

### ClienteController

```java
package com.iesdoctorbalmis.spring.controller;

import com.iesdoctorbalmis.spring.repository.ClienteRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    // Inyección por constructor
    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("clientes", clienteRepository.findAll());
        return "clientes/lista";  // → templates/clientes/lista.html
    }
}
```

`@RequestMapping("/clientes")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /clientes`.

### ProductoController y EmpleadoController

Siguen exactamente el mismo patrón que `ClienteController`, adaptando el repositorio y la plantilla correspondientes.

```java
package com.iesdoctorbalmis.spring.controller;

import com.iesdoctorbalmis.spring.repository.ProductoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoRepository productoRepository;

    // Inyección por constructor
    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("productos", productoRepository.findAll());
        return "productos/lista";
    }
}
```

```java
package com.iesdoctorbalmis.spring.controller;

import com.iesdoctorbalmis.spring.repository.EmpleadoRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/empleados")
public class EmpleadoController {

    private final EmpleadoRepository empleadoRepository;

    // Inyección por constructor
    public EmpleadoController(EmpleadoRepository empleadoRepository) {
        this.empleadoRepository = empleadoRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("empleados", empleadoRepository.findAll());
        return "empleados/lista";
    }
}

```
---

## 4. Plantillas Thymeleaf

### Inspiración visual: Odoo y tema marítimo

Odoo organiza su interfaz con una barra superior oscura, un panel de control con migas de pan y botones, vistas de lista con cabecera clara y tarjetas en la pantalla de inicio. Replicamos esa estructura con Bootstrap 5, cambiando el morado de Odoo por tonos marítimos. El nombre del tema hace referencia a la expedición de Balmis, que llevó la vacuna de la viruela a bordo de un barco.

| Elemento de Odoo | Equivalente en ERP Balmis |
|---|---|
| Barra superior oscura | `navbar balmis-navbar` (degradado azul marino) |
| Menú de aplicaciones | Enlaces de la navbar con iconos de Bootstrap Icons |
| Panel de control (migas, título, botones, búsqueda) | `breadcrumb` y `d-flex` en la cabecera de cada página |
| Vista lista | `table table-hover balmis-table` (cabecera arena) |
| Tarjetas de la pantalla de inicio | `card balmis-card` |
| Botón principal | `btn btn-primary` en turquesa |

### Layout base con fragmentos

El **fragmento de layout** es una plantilla maestra que define la estructura HTML común (navbar, footer, Bootstrap) y se reutiliza en todas las páginas. Evita repetir el mismo HTML en cada vista.

```html
<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:fragment="layout(title, content)">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title th:replace="${title}">ERP Balmis</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" th:href="@{/css/balmis.css}" />
</head>
<body class="balmis-body">
    <div class="container-fluid h-custom">
        <div class="row d-flex justify-content-center h-100">      
            <div style="text-align: left;" class="col-md-8 col-lg-6 col-xl-2">
                <img id="logo_IES" src="/img/Logo_IES.png" class="img-fluid" alt="Logo_IES" />
            </div>
            <div class="col-md-8 col-lg-6 col-xl-8">
                <div class="jumbotron">
                    <p><i class="bi bi-compass"></i> ERP Balmis</p>
                </div>
            </div>
            <div style="text-align: right;" class="col-md-8 col-lg-6 col-xl-2">
                <img id="logo_GVA" src="/img/gva.png" class="img-fluid" alt="Logo_GVA" />
            </div>
        </div>
    </div>
    <nav class="navbar navbar-expand-lg navbar-dark balmis-navbar sticky-top">
        <div class="container-fluid px-3">
            <a class="navbar-brand d-flex align-items-center gap-2" th:href="@{/}">
                <i class="bi bi-compass-fill"></i> ERP Balmis
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#menuPrincipal" aria-controls="menuPrincipal"
                    aria-expanded="false" aria-label="Mostrar menú">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menuPrincipal">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/clientes}"><i class="bi bi-people"></i> Clientes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/empleados}"><i class="bi bi-person-badge"></i> Empleados</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/productos}"><i class="bi bi-box-seam"></i> Productos</a>
                    </li>
                </ul>
                <span class="balmis-avatar" title="Usuario"><i class="bi bi-person-fill"></i></span>
            </div>
        </div>
    </nav>
    <main class="container-fluid px-4 py-4">
        <th:block th:replace="${content}" />
    </main>
    <footer class="balmis-footer text-center py-3">
        <p class="mb-0">⚓ ERP Balmis — IES Doctor Balmis · Módulo SGE</p>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

**Cómo funciona:**
- `th:fragment="layout(title, content)"` — declara el fragmento con dos parámetros.
- `th:replace="${title}"` — inserta el título que pase cada página.
- `th:replace="${content}"` — inserta el bloque de contenido de cada página.

### Contenido de la carpeta static

- Descargamos el fichero <a href="/sge/ud5/reto2_static.zip" target="_blank" style="display: inline-block; margin-top: 1rem; padding: 0rem 0.25rem; background-color: #3f51b5; color: white; border-radius: 4px; text-decoration: none;">reto2_static.zip</a>
- Después de descomprimirlo, copiamos el contenido de la carpeta `static` a la del proyecto, que se encuentra dentro de `resources`.

### Hoja de estilos del tema

En `static/css/balmis.css`, Spring Boot sirve automáticamente los archivos de `static/`, y como se carga después de Bootstrap, sus reglas sobrescriben los colores por defecto.

| Variable | Color | Uso |
|---|---|---|
| `--balmis-navy` | `#0B2545` | Barra superior y títulos (azul marino) |
| `--balmis-ocean` | `#13315C` | Segundo tono del degradado (mar profundo) |
| `--balmis-teal` | `#1B998B` | Botones principales y avatar (turquesa) |
| `--balmis-sand` | `#F4EBD9` | Cabeceras de tablas (arena) |
| `--balmis-foam` | `#F5F9FC` | Fondo de página (espuma) |

```css
/* static/css/balmis.css: tema marítimo inspirado en Odoo */
:root {
    --balmis-navy: #0B2545;
    --balmis-ocean: #13315C;
    --balmis-teal: #1B998B;
    --balmis-teal-dark: #158077;
    --balmis-sand: #F4EBD9;
    --balmis-foam: #F5F9FC;
    --balmis-line: #D9E2EC;
}

#logo_IES {
	width: 50%;
	margin-bottom: 10px;
}

#logo_GVA {
	margin-top: 10px;
	margin-bottom: 10px;
}

.jumbotron {
  font-size: 60px;
  font-weight: bold;
  text-align: center;
  margin-top: 15px;
  color: var(--balmis-navy);
}

body.balmis-body {
    background-color: var(--balmis-foam);
    color: #1F2D3D;
}

/* Barra superior oscura con degradado */
.balmis-navbar {
    background: linear-gradient(90deg, var(--balmis-navy), var(--balmis-ocean));
}
.balmis-navbar .navbar-brand,
.balmis-navbar .navbar-nav .nav-link {
    color: #FFFFFF;
}
.balmis-navbar .navbar-nav .nav-link:hover,
.balmis-navbar .navbar-nav .nav-link.active {
    color: var(--balmis-sand);
}
.balmis-avatar {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--balmis-teal);
    color: #FFFFFF;
}

/* Botón principal en turquesa */
.btn-primary {
    --bs-btn-bg: var(--balmis-teal);
    --bs-btn-border-color: var(--balmis-teal);
    --bs-btn-hover-bg: var(--balmis-teal-dark);
    --bs-btn-hover-border-color: var(--balmis-teal-dark);
    --bs-btn-active-bg: var(--balmis-teal-dark);
    --bs-btn-active-border-color: var(--balmis-teal-dark);
}

/* Panel de control: migas y título */
.balmis-breadcrumb .breadcrumb-item a {
    color: var(--balmis-ocean);
    text-decoration: none;
}
.balmis-title {
    color: var(--balmis-navy);
    font-weight: 600;
}

/* Vista lista: cabecera arena y fila resaltada */
.balmis-table {
    --bs-table-hover-bg: #E3F4F1;
}
.balmis-table thead th {
    background-color: var(--balmis-sand);
    color: var(--balmis-navy);
    border-bottom: 2px solid var(--balmis-navy);
}

/* Tarjetas del panel de control */
.balmis-card {
    border: 1px solid var(--balmis-line);
    border-radius: .5rem;
    box-shadow: 0 1px 3px rgba(11, 37, 69, .08);
    font-size: 2rem;
    transition: transform .15s ease, box-shadow .15s ease;
}
.balmis-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(11, 37, 69, .15);
}
.balmis-card .bi {
    font-size: 3.5rem;
    color: var(--balmis-teal);
}
.balmis-card-total {
    font-size: 2rem;
    font-weight: 700;
    color: var(--balmis-navy);
}

/* Pie de página */
.balmis-footer {
    background-color: var(--balmis-navy);
    color: #CFE3F1;
}
```

### Cómo usar el layout en cada página

Dentro de `resources` creamos la carpeta `clientes`, y dentro el fichero `lista.html` con el siguiente contenido.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Clientes — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de clientes -->
</th:block>
</body>
</html>
```

Dentro de `resources` creamos la carpeta `empleados`, y dentro el fichero `lista.html` con el siguiente contenido.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Empleados — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de empleados -->
</th:block>
</body>
</html>
```

Dentro de `resources` creamos la carpeta `productos`, y dentro el fichero `lista.html` con el siguiente contenido.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Productos — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de productos -->
</th:block>
</body>
</html>
```

### Lista de clientes

En `clientes/lista` completamos el contenido específico de la lista de clientes:

```html
<nav aria-label="breadcrumb" class="balmis-breadcrumb">
    <ol class="breadcrumb mb-1">
        <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
        <li class="breadcrumb-item active" aria-current="page">Clientes</li>
    </ol>
</nav>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <h2 class="balmis-title h4 mb-0">Clientes</h2>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar cliente…" />
        <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Nuevo</button>
    </div>
</div>
<div class="table-responsive bg-white rounded-3 shadow-sm">
    <table class="table table-hover balmis-table mb-0">
        <thead>
            <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Tipo</th>
                <th>Alta</th>
            </tr>
        </thead>
        <tbody>
            <!-- Aquí van las filas de cada cliente -->
        </tbody>
    </table>
</div>
```

Fila de cada cliente, con iteración y badge de tipo (va dentro de `<tbody>`):

```html
<tr th:each="cliente : ${clientes}">
    <td th:text="${cliente.codigoCliente}"></td>
    <td th:text="${cliente.nombre}"></td>
    <td th:text="${cliente.email}"></td>
    <td th:text="${cliente.telefono}"></td>
    <td>
        <span class="badge"
              th:classappend="${cliente.tipoCliente.name() == 'ACTIVO'}
                             ? 'bg-success'
                             : (${cliente.tipoCliente.name() == 'PROSPECTO'}
                                ? 'bg-warning text-dark'
                                : 'bg-secondary')"
              th:text="${cliente.tipoCliente}"></span>
    </td>
    <td th:text="${#temporals.format(cliente.fechaAlta, 'dd/MM/yyyy')}"></td>
</tr>
```

### Lista de empleados

En `empleados/lista` completamos el contenido específico de la lista de empleados:

```html
<nav aria-label="breadcrumb" class="balmis-breadcrumb">
    <ol class="breadcrumb mb-1">
        <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
        <li class="breadcrumb-item active" aria-current="page">Empleados</li>
    </ol>
</nav>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <h2 class="balmis-title h4 mb-0">Empleados</h2>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar empleado…" />
        <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Nuevo</button>
    </div>
</div>
<div class="table-responsive bg-white rounded-3 shadow-sm">
    <table class="table table-hover balmis-table mb-0">
        <thead>
            <tr>
                <th>Nº Empleado</th>
                <th>Nombre completo</th>
                <th>Cargo</th>
                <th>Departamento</th>
                <th>Email</th>
                <th>Incorporación</th>
                <th>Activo</th>
            </tr>
        </thead>
        <tbody>
            <!-- Aquí van las filas de cada empleado -->
        </tbody>
    </table>
</div>
```

Fila de cada empleado, con iteración y badge de si está activo (va dentro de `<tbody>`):

```html
<tr th:each="empleado : ${empleados}">
    <td th:text="${empleado.numeroEmpleado}"></td>
    <td th:text="${empleado.nombre + ' ' + empleado.apellidos}"></td>
    <td th:text="${empleado.cargo}"></td>
    <td th:text="${empleado.departamento}"></td>
    <td th:text="${empleado.email}"></td>
    <td th:text="${#temporals.format(empleado.fechaIncorporacion, 'dd/MM/yyyy')}"></td>
    <td>
        <span class="badge"
              th:classappend="${empleado.activo} ? 'bg-success' : 'bg-secondary'"
              th:text="${empleado.activo} ? 'Sí' : 'No'"></span>
    </td>
</tr>
```

### Lista de productos

En `productos/lista` completamos el contenido específico de la lista de productos:

```html
<nav aria-label="breadcrumb" class="balmis-breadcrumb">
    <ol class="breadcrumb mb-1">
        <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
        <li class="breadcrumb-item active" aria-current="page">Productos</li>
    </ol>
</nav>
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <h2 class="balmis-title h4 mb-0">Productos</h2>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar producto…" />
        <button class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> Nuevo</button>
    </div>
</div>
<div class="table-responsive bg-white rounded-3 shadow-sm">
    <table class="table table-hover balmis-table mb-0">
        <thead>
            <tr>
                <th>Referencia</th>
                <th>Descripción</th>
                <th class="text-end">Precio venta</th>
                <th class="text-end">Precio coste</th>
                <th class="text-end">Stock</th>
                <th>Fecha alta</th>
                <th>Activo</th>
            </tr>
        </thead>
        <tbody>
            <!-- Aquí van las filas de cada producto -->
        </tbody>
    </table>
</div>
```

Fila de cada empleado, con formateo de números decimales para los precios y badge de si está activo (va dentro de `<tbody>`):

```html
<tr th:each="producto : ${productos}">
    <td th:text="${producto.referencia}"></td>
    <td th:text="${producto.descripcion}"></td>
    <td class="text-end" th:text="${#numbers.formatDecimal(producto.precioVenta, 1, 2)} + ' €'"></td>
    <td class="text-end" th:text="${#numbers.formatDecimal(producto.precioCoste, 1, 2)} + ' €'"></td>
    <td class="text-end" th:text="${producto.stock}"></td>
    <td th:text="${#temporals.format(producto.fechaAlta, 'dd/MM/yyyy')}"></td>
    <td>
        <span class="badge"
              th:classappend="${producto.activo} ? 'bg-success' : 'bg-secondary'"
              th:text="${producto.activo} ? 'Sí' : 'No'"></span>
        </td>
</tr>
```

### Panel de control (index.html)

La página de inicio muestra una tarjeta por entidad, con el contador del Model y un enlace a su lista:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Panel de control — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <h1 class="balmis-title h3 mb-4">Panel de control</h1>
    <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col">
            <a class="card balmis-card h-100 text-decoration-none" th:href="@{/clientes}">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi bi-people"></i>
                    <div>
                        <div class="text-muted">Clientes</div>
                        <div class="balmis-card-total" th:text="${totalClientes}">0</div>
                    </div>
                </div>
            </a>
        </div>
        <div class="col">
            <a class="card balmis-card h-100 text-decoration-none" th:href="@{/empleados}">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi bi-person-badge"></i>
                    <div>
                        <div class="text-muted">Empleados</div>
                        <div class="balmis-card-total" th:text="${totalEmpleados}">0</div>
                    </div>
                </div>
            </a>
        </div>
        <div class="col">
            <a class="card balmis-card h-100 text-decoration-none" th:href="@{/productos}">
                <div class="card-body d-flex align-items-center gap-3">
                    <i class="bi bi-box-seam"></i>
                    <div>
                        <div class="text-muted">Productos</div>
                        <div class="balmis-card-total" th:text="${totalProductos}">0</div>
                    </div>
                </div>
            </a>
        </div>
    </div>
</th:block>
</body>
</html>
```

---

## 5. Expresiones Thymeleaf

| Sintaxis | Tipo | Uso |
|---|---|---|
| `${...}` | Variable | Accede a atributos del Model |
| `@{...}` | URL | Genera URLs contextuales de Spring |
| `~{...}` | Fragmento | Referencia a un fragmento de otra plantilla |

### Utilidades incorporadas

| Utilidad | Ejemplos de uso |
|---|---|
| `#lists` | `#lists.isEmpty(lista)`, `#lists.size(lista)` |
| `#temporals` | `#temporals.format(fecha, 'dd/MM/yyyy')` |
| `#numbers` | `#numbers.formatDecimal(num, 1, 2)` |

---

## 6. Ejecución

```bash
mvn spring-boot:run
```

### URLs disponibles

| URL | Vista |
|---|---|
| `http://localhost:9000/` | Panel de control con contadores |
| `http://localhost:9000/clientes` | Tabla de clientes |
| `http://localhost:9000/empleados` | Tabla de empleados |
| `http://localhost:9000/productos` | Tabla de productos |
| `http://localhost:9000/h2-console` | Consola H2 (sin cambios) |

---

## ✅ Entregable

El proyecto debe tener:
- `pom.xml` con la dependencia `spring-boot-starter-thymeleaf`
- Cuatro controladores en el paquete `controller/`
- Fragmento de layout en `templates/fragments/layout.html`
- Hoja de estilos `static/css/balmis.css` con la paleta marítima
- Página de inicio `templates/index.html` con contadores
- Tres plantillas de lista: `clientes/lista.html`, `empleados/lista.html`, `productos/lista.html`
- Servidor ejecutándose en `http://localhost:9000` mostrando el panel de control
- Navegación funcional entre todas las secciones

### Requisitos de entrega

1. **Repositorio Git:** Crea un repositorio en tu organización con el nombre **Reto2_Apellido1_Nombre** (ejemplo: **Reto2_Estañ_Luis**)

2. **Commits en Git:** 
   - Realiza commits necesarios conforme avanzas en el reto.
   - Usa mensajes descriptivos (ej: "Reto 2: La Vista")
   - Usa Control de Código Fuente en VSCode para hacer commit y push

3. **.gitignore:** Asegúrate de que tu repositorio incluya un `.gitignore` con contenido mínimo:
   ```
   target/
   .DS_Store
   .vscode/
   .idea/
   *.log
   ```

4. **README.md:** Incluye un archivo `README.md` con:
   - Título del reto
   - Descripción breve
   - Instrucciones para ejecutar la aplicación

5. **Push al repositorio:** Sube todos tus cambios a la rama `main` de tu repositorio remoto antes de la fecha de entrega

6. **Acceso al profesor:** Asegúrate de que tu profesor tiene acceso a tu organización para revisar el trabajo
