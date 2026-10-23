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

## 3. Controladores MVC

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
- `public String home()` recoge las acciones que se van a hacer.
- El recurso `("/")` que nos indica el recurso implicado.
- `return "index"` indica a Thymeleaf que busque y muestre `templates/index.html`.
- En general, cuando el recurso sea el directorio raíz del proyecto `/`, tan solo se cargará la página `index.html`

**Más adelante crearemos más controladores.**

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

Dentro de la carpeta `templates`, creamos el fichero `index.html` con el siguiente contenido:

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

## 6. Ejecución

Ahora ya podemos ejecutarlo, de forma gráfica, desde el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Si todo va bien, desde el navegador ponemos `localhost:9000` o `localhost:9000/` y tendrá que aparecer la cabecera.

![Cabecera del reto 2](/sge/ud5/reto2_cabecera.png)

**Más adelante continuaremos ampliando este Reto 2.**