---
title: "Reto 2: La Vista"
description: Añadir una capa de presentación web al ERP Balmis usando Thymeleaf y el patrón MVC.
---

> **Reto anterior:** [Reto 1 — De la Semilla a la Raíz](/docs/retos/reto1)

## 📌 Resumen del Reto

Transformarás el Reto 1 añadiendo:
- **Thymeleaf:** Motor de plantillas HTML integrado con Spring Boot
- **Controladores MVC:** `@Controller` con `@GetMapping` y `Model`
- **Layout reutilizable:** Fragmento base con navbar estilo Odoo y Bootstrap 5
- **Tema marítimo:** Hoja de estilos propia (`balmis.css`) con la paleta de Balmis
- **Vistas de listado:** Clientes, Empleados y Productos
- **Panel de control:** Página de inicio con contadores

> **Conceptos teóricos:** El patrón MVC, Thymeleaf y los atributos `th:*` se explican en detalle en [UD5a — secciones 1, 2 y 3](/sge/spring/ud5a).

## 1. Preparación

### Crea una copia del proyecto
- Desde tu carpeta de trabajo **workspace-spring**, haz una copia de tu carpeta **spring**, manteniendo el nombre por defecto de **spring - copia**. Cambia el nombre del proyecto original **spring** por **reto1**, y cambia también el nombre de **spring - copia** por **spring**. 
- Desde el IDE de VSCode, añadiremos la capa de presentación

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

## 3. Iniciación a Controladores MVC

Un `@Controller` en Spring MVC es una clase que:
1. Recibe peticiones HTTP mediante `@GetMapping`, `@PostMapping`, etc.
2. Recupera datos de los repositorios.
3. Los pone en el `Model` para que la plantilla los use.
4. Devuelve el nombre de la plantilla a renderizar.

Creamos la carpeta o package `controller` desde `com.iesdoctorbalmis.spring`.

### HomeController

Dentro de `controller`creamos el fichero `HomeController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";
    }
    
}
```

**Puntos clave:**
- La anotación `@Controller` para indicar que vamos a realizar un controlador.
- La anotación `@GetMapping` para indicar que vamos a mostrar una página.
- `("/")` que nos indica el recurso implicado.
- `public String home()` recoge las acciones que se van a hacer.
- `return "index"` indica a Thymeleaf que busque y muestre `templates/index.html`.
- En general, cuando el recurso sea el directorio raíz del proyecto `/`, tan solo se cargará la página `index.html`

**Más adelante crearemos más controladores.**

## 4. Iniciación a Plantillas Thymeleaf

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

Dentro de la carpeta `templates`, que se encuentra en `resources`, creamos la carpeta `fragments`, y dentro de esa carpeta, creamos el fichero `layout.html` con el siguiente contenido, que **luego ampliaremos**:

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

### Usar el layout para el Panel de control (index.html)

Dentro de la carpeta `templates`, creamos el fichero `index.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Panel de control — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico del Panel de control -->
</th:block>
</body>
</html>
```

**Más adelante crearemos más ficheros html a partir del layout que tenemos.**

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

## 6. Ejecución Parte 1

Ahora ya podemos ejecutarlo, de forma gráfica, desde el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Si todo va bien, desde el navegador ponemos `localhost:9000` o `localhost:9000/` y tendrá que aparecer la cabecera.

![Panel de control del reto 2](/sge/ud5/reto2_06_index.png)

## 7. Continuación a Controladores MVC

### ClienteController

Dentro de `controller` creamos el fichero `ClienteController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/clientes")
public class ClienteController {

    @GetMapping
    public String lista() {
        return "clientes/lista";  // → templates/clientes/lista.html
    }

}
```

`@RequestMapping("/clientes")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /clientes`.

### EmpleadoController

Dentro de `controller` creamos el fichero `EmpleadoController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/empleados")
public class EmpleadoController {

    @GetMapping
    public String lista() {
        return "empleados/lista";  // → templates/empleados/lista.html
    }

}
```

`@RequestMapping("/empleados")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /empleados`.


### ProductoController

Dentro de `controller` creamos el fichero `ProductoController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/productos")
public class ProductoController {

    @GetMapping
    public String lista() {
        return "productos/lista";  // → templates/productos/lista.html
    }

}
```

`@RequestMapping("/productos")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /productos`.

## 8. Crear más Plantillas Thymeleaf

### Usar el layout para Clientes (clientes/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `clientes`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

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

### Usar el layout para Empleados (empleados/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `empleados`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

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

### Usar el layout para Productos (productos/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `productos`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

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

## 9. Ejecución Parte 2

Volvemos a ejecutar de forma gráfica desde el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000/clientes` y tendrá que aparecer la página básica de Clientes.

![Clientes del reto 2](/sge/ud5/reto2_09_clientes.png)

Desde el navegador ponemos `localhost:9000/empleados` y tendrá que aparecer la página básica de Empleados.

![Empleados del reto 2](/sge/ud5/reto2_09_empleados.png)

Desde el navegador ponemos `localhost:9000/productos` y tendrá que aparecer la página básica de Productos.

![Productos del reto 2](/sge/ud5/reto2_09_productos.png)

## 10. Ampliar las Plantillas Thymeleaf

### Cabecera para Clientes (clientes/lista.html)

Ampliaremos la página de Clientes incluyendo contenido específico de Clientes en el bloque del fragmento.

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
</th:block>
</body>
</html>
```

### Cabecera para Empleados (empleados/lista.html)

Ampliaremos la página de Empleados incluyendo contenido específico de Empleados en el bloque del fragmento.

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
</th:block>
</body>
</html>
```

### Cabecera para Productos (productos/lista.html)

Ampliaremos la página de Productos incluyendo contenido específico de Productos en el bloque del fragmento.

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
</th:block>
</body>
</html>
```

## 11. Ejecución Parte 3

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000/clientes` y tendrá que aparecer la cabecera de Clientes sin los datos.

![Clientes del reto 2](/sge/ud5/reto2_11_clientes.png)

Desde el navegador ponemos `localhost:9000/empleados` y tendrá que aparecer la cabecera de Empleados sin los datos.

![Empleados del reto 2](/sge/ud5/reto2_11_empleados.png)

Desde el navegador ponemos `localhost:9000/productos` y tendrá que aparecer la cabecera de Productos sin los datos.

![Productos del reto 2](/sge/ud5/reto2_11_productos.png)

## 12. Terminar los Controladores MVC

### ClienteController

Dentro de `controller` terminamos el fichero `ClienteController.java` incluyendo los datos de clientes.

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

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `clienteRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "clientes/lista"` indica a Thymeleaf que busque `templates/clientes/lista.html`.

### EmpleadoController

Dentro de `controller` terminamos el fichero `EmpleadoController.java` incluyendo los datos de empleados.

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

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `empleadoRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "empleados/lista"` indica a Thymeleaf que busque `templates/empleados/lista.html`.

### ProductoController

Dentro de `controller` terminamos el fichero `ProductoController.java` incluyendo los datos de productos.

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

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `productoRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "productos/lista"` indica a Thymeleaf que busque `templates/productos/lista.html`.

## 13. Terminar las Plantillas Thymeleaf

### Lista de Clientes (clientes/lista.html)

Terminamos la página de Clientes incluyendo la fila de cada cliente, con iteración y badge de tipo.

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
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Lista de Empleados (empleados/lista.html)

Terminamos la página de Empleados incluyendo la fila de cada empleado, con iteración y badge de si está activo.

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
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Lista de Productos (productos/lista.html)

Terminamos la página de Productos incluyendo la fila de cada producto, con iteración, formateo de números decimales para los precios y badge de si está activo.

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
            </tbody>
        </table>
    </div>     
</th:block>
</body>
</html>
```

## 14. Ejecución Parte 4

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000/clientes` y tendrá que aparecer la página completa de Clientes con los datos.

![Clientes del reto 2](/sge/ud5/reto2_14_clientes.png)

Desde el navegador ponemos `localhost:9000/empleados` y tendrá que aparecer la página completa de  Empleados con los datos.

![Empleados del reto 2](/sge/ud5/reto2_14_empleados.png)

Desde el navegador ponemos `localhost:9000/productos` y tendrá que aparecer la página completa de  Productos con los datos.

![Productos del reto 2](/sge/ud5/reto2_14_productos.png)

## 15. Terminar el Reto 2

Desde aquí nos falta la última parte 5 incluyendo el menú en el layout, la ubicación de cada página y añadiendo la carga de datos en el fichero `index.html` del Panel de Control.

### Incluir un menú en la plantilla (fragments/layout.html)

Terminamos la plantilla `layout.html` incluyendo el menú de navegación, para que aparezca en todas las paginas, quedando la plantilla como se indica a continuación.

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
    <!-- Menú de navegación con navbar -->
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

### Incluir la ubicación en Clientes (clientes/lista.html)

Se añadirá al comenzar el bloque de contenido específico.

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
    <nav aria-label="breadcrumb" class="balmis-breadcrumb">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
            <li class="breadcrumb-item active" aria-current="page">Clientes</li>
        </ol>
    </nav>
    <!-- Ubicación de la página añadida -->
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
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Incluir la ubicación en Empleados (empleados/lista.html)

Se añadirá al comenzar el bloque de contenido específico.

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
    <nav aria-label="breadcrumb" class="balmis-breadcrumb">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
            <li class="breadcrumb-item active" aria-current="page">Empleados</li>
        </ol>
    </nav>
    <!-- Ubicación de la página añadida -->
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
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Incluir la ubicación en Productos (productos/lista.html)

Se añadirá al comenzar el bloque de contenido específico.

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
    <nav aria-label="breadcrumb" class="balmis-breadcrumb">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Panel</a></li>
            <li class="breadcrumb-item active" aria-current="page">Productos</li>
        </ol>
    </nav>
    <!-- Ubicación de la página añadida -->
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
            </tbody>
        </table>
    </div>     
</th:block>
</body>
</html>
```

### Terminar el HomeController del Panel de Control

Dentro de `controller` terminamos el fichero `HomeController.java` incluyendo en el panel de control los totales de cada entidad.

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
- `empleadoRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `productoRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "index"` indica a Thymeleaf que busque `templates/index.html`.

### Terminar el index.html del Panel de Control

Descargamos el fichero <a href="/sge/ud5/Mision_Tecnica.png" target="_blank" style="display: inline-block; margin-top: 1rem; padding: 0rem 0.25rem; background-color: #3f51b5; color: white; border-radius: 4px; text-decoration: none;">Mision_Tecnica.png</a> y lo copiamos en la carpeta `img` que está dentro de `static`, junto con las otras imágenes.

Dentro de `templates` terminamos el fichero `index.html` mostrando una tarjeta por entidad, con su contador de registros y un enlace a su lista. Después mostramos la imagen que hemos descargado.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Panel de control — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico del Panel de control -->
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
    <div class="container-fluid p-0">
        <img id="portada" src="/img/Mision_Tecnica.png" class="img-fluid w-100" alt="Misión Técnica" />
    </div>
</th:block>
</body>
</html>
```

Añadimos el identificador `portada` en la hoja de estilos `balmis.css` que está en la carpeta `css` de `static`.

```css
#logo_GVA {
    margin-top: 10px;
	margin-bottom: 10px;
}

#portada {
    margin-top: 20px;
    height: 400px;
    object-fit: cover;
}

.jumbotron {
  font-size: 60px;
  font-weight: bold;
  text-align: center;
  margin-top: 15px;
  color: #0B2545;
}
```

## 16. Ejecución Parte 5 con el Reto 2 completo

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000` y tendrá que aparecer la página principal con el Panel de control completo.

![Index del reto 2](/sge/ud5/reto2_16_index.png)

Ahora para ver el resto de páginas no hace falta que escribamos nada en el cuadro del navegador, ya que podemos usar los enlaces de las tarjetas y el menú de navegación.

![Clientes del reto 2](/sge/ud5/reto2_16_clientes.png)


![Empleados del reto 2](/sge/ud5/reto2_16_empleados.png)


![Productos del reto 2](/sge/ud5/reto2_16_productos.png)

## 17. Entrega del Reto 2

### Estructura esperada

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
        │       ├── gva.png
        │       └── Mision_Tecnica.png    
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

### Requisitos de entrega

1. **Repositorio Git:** Crea un repositorio en tu organización con el nombre **Reto2_Apellido1_Nombre** (ejemplo: **Reto2_Estañ_Luis**)

2. **Commits en Git:** 
   - Realiza commits necesarios conforme avanzas en el reto.
   - Usa mensajes descriptivos (ej: "Añadir anotaciones JPA", "Configurar H2 database", etc.)
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

---
