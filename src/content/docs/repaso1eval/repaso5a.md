---
title: "Repaso 2: UD5a + Reto 2"                                
description: Añadir una capa de presentación web usando Thymeleaf y el patrón MVC.
---

> **Teoría requerida:** [UD5a — Spring MVC y Thymeleaf](/sge/spring/ud5a)                           
> **Reto anterior:** [Repaso 1: UD4 + Reto 0 + Reto 1](/sge/repaso1eval/repaso4)

## 📌 Resumen del trabajo a realizar

En esta segunda parte añadiremos lo siguiente:
- **Thymeleaf:** Motor de plantillas HTML integrado con Spring Boot
- **Controladores MVC:** `@Controller` con `@GetMapping` y `Model`
- **Layout reutilizable:** Fragmento base con navbar y Bootstrap 5
- **Tema académico:** Hoja de estilos propia (`xarxallibres.css`)
- **Vistas de listado:** Alumnos, Cursos y Libros
- **Panel de Inicio:** Página de Inicio con contadores

> **Conceptos teóricos:** El patrón MVC, Thymeleaf y los atributos `th:*` se explican en detalle en [UD5a — secciones 1, 2 y 3](/sge/spring/ud5a).

## 1. Preparación

### Abrir el proyecto anterior para continuarlo
- Continuaremos el proyecto anterior desde tu carpeta de trabajo **workspace-spring**, llamado **spring**, por lo que no tendremos que hacer nada. 
- Desde el IDE de VSCode, añadiremos la capa de presentación

## 2. Comprobar Thymeleaf en el proyecto

En el `pom.xml`, comprobaremos que tenemos la dependencia de Thymeleaf:

```xml
<!-- Thymeleaf: motor de plantillas HTML -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

> Con esta dependencia, Spring Boot autoconfigura Thymeleaf para que resuelva las vistas en `src/main/resources/templates/`.

## 3. Iniciación a la Plantilla Thymeleaf

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
    <title th:replace="${title}">Xarxallibres</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
    <link rel="stylesheet" th:href="@{/css/xarxallibres.css}" />
</head>
<body class="xarxa-body">
    <div class="container-fluid h-custom">
        <div class="row d-flex justify-content-center h-100">
            <div style="text-align: left;" class="col-md-8 col-lg-6 col-xl-2">
                <img id="logo_IES" src="/img/Logo_IES.png" class="img-fluid" alt="Logo_IES" />
            </div>
            <div class="col-md-8 col-lg-6 col-xl-8">
                <div class="jumbotron">
                    <p><i class="bi bi-book-half"></i> Xarxallibres</p>
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
    <footer class="xarxa-footer text-center py-3">
        <p class="mb-0">📚 Xarxallibres — IES Doctor Balmis</p>
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

- Descargamos el fichero <a href="/sge/repaso5a/repaso5a_static.zip" target="_blank" style="display: inline-block; margin-top: 1rem; padding: 0rem 0.25rem; background-color: #3f51b5; color: white; border-radius: 4px; text-decoration: none;">repaso5a_static.zip</a>
- Después de descomprimirlo, copiamos el contenido a la carpeta `static` del proyecto, que se encuentra dentro de `resources`. Allí se encuentra la carpeta `css` con la hoja de estilo `xarxallibres.css` y la carpeta `img` con los logos de cabecera y las imágenes de los libros. 

### Usar el layout para el Panel de control (index.html)

Dentro de la carpeta `templates`, creamos el fichero `index.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Inicio — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico del Panel de Inicio -->
</th:block>
</body>
</html>
```

**Más adelante crearemos más ficheros html a partir del layout que tenemos.**

## 4. Expresiones Thymeleaf

| Sintaxis | Tipo | Uso |
|---|---|---|
| `${...}` | Variable | Accede a atributos del Model |
| `@{...}` | URL | Genera URLs contextuales de Spring |
| `~{...}` | Fragmento | Referencia a un fragmento de otra plantilla |

## 5. Iniciación a Controladores MVC

Un `@Controller` en Spring MVC es una clase que:
1. Recibe peticiones HTTP mediante `@GetMapping`, `@PostMapping`, etc.
2. Recupera datos de los repositorios.
3. Los pone en el `Model` para que la plantilla los use.
4. Devuelve el nombre de la plantilla a renderizar.

Creamos la carpeta o package `controller` desde `com.iesdoctorbalmis.spring`.

### HomeController

Dentro de `controller` creamos el fichero `HomeController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

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


## 6. Ejecución Parte 1

Ahora ya podemos ejecutarlo, de forma gráfica, desde el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Si todo va bien, desde el navegador ponemos `localhost:9000` o `localhost:9000/` y tendrá que aparecer la cabecera.

![Inicio](/sge/repaso5a/repaso5a_06_index.png)

## 7. Continuación a Controladores MVC

### AlumnosController

Dentro de `controller` creamos el fichero `AlumnosController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/alumnos")
public class AlumnosController {

    @GetMapping
    public String lista() {
        return "alumnos/lista";  // → templates/alumnos/lista.html
    }

}
```

`@RequestMapping("/alumnos")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /alumnos`.

### CursosController

Dentro de `controller` creamos el fichero `CursosController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/cursos")
public class CursosController {

    @GetMapping
    public String lista() {
        return "cursos/lista";  // → templates/cursos/lista.html
    }

}
```

`@RequestMapping("/cursos")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /cursos`.


### LibrosController

Dentro de `controller` creamos el fichero `LibrosController.java` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequestMapping("/libros")
public class LibrosController {

    @GetMapping
    public String lista() {
        return "libros/lista";  // → templates/libros/lista.html
    }

}
```

`@RequestMapping("/libros")` en la clase define el prefijo de ruta para todos los métodos del controlador. El `@GetMapping` sin parámetro responde a `GET /libros`.

## 8. Crear más Plantillas Thymeleaf

### Usar el layout para Alumnos (alumnos/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `alumnos`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Alumnos — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de alumnos -->
</th:block>
</body>
</html>
```

### Usar el layout para Cursos (cursos/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `cursos`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Cursos — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de cursos -->
</th:block>
</body>
</html>
```

### Usar el layout para Libros (libros/lista.html)

Dentro de la carpeta `templates`, creamos la carpeta `libros`, y dentro el fichero `lista.html` con el siguiente contenido básico por ahora, que **luego ampliaremos**:

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Libros — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de libros -->
</th:block>
</body>
</html>
```

## 9. Ejecución Parte 2

Volvemos a ejecutar de forma gráfica desde el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000/alumnos` y tendrá que aparecer la página básica de Alumnos.

![Alumnos](/sge/repaso5a/repaso5a_09_alumnos.png)

Desde el navegador ponemos `localhost:9000/cursos` y tendrá que aparecer la página básica de Cursos.

![Cursos](/sge/repaso5a/repaso5a_09_cursos.png)

Desde el navegador ponemos `localhost:9000/libros` y tendrá que aparecer la página básica de Libros.

![Libros](/sge/repaso5a/repaso5a_09_libros.png)

## 10. Ampliar las Plantillas Thymeleaf

### Cabecera para Alumnos (alumnos/lista.html)

Ampliaremos la página de Alumnos incluyendo contenido específico de Alumnos en el bloque del fragmento.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Alumnos — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de alumnos -->
    <div class="table-responsive rounded-3 shadow-sm">
        <table class="table table-hover xarxa-table mb-0" id="miTabla">
            <thead>
                <tr>
                    <th style="text-align: center; width: 6%;">Id</th>
                    <th style="width: 23%;">Apellido1</th>
                    <th style="width: 23%;">Apellido2</th>
                    <th style="width: 23%;">Nombre</th>
                    <th style="width: 15%;">Tipo</th>
                    <th style="width: 10%;">Curso</th>
                </tr>
            </thead>
            <tbody>
                <!-- Aquí van las filas de cada Alumno -->
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Cabecera para Cursos (cursos/lista.html)

Ampliaremos la página de Cursos incluyendo contenido específico de Cursos en el bloque del fragmento.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Cursos — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de cursos -->
    <div class="table-responsive rounded-3 shadow-sm">
        <table class="table table-hover xarxa-table mb-0" id="miTabla">
            <thead>
                <tr>
                    <th style="text-align: center; width: 6%;">Id</th>
                    <th style="width: 20%;">Curso</th>
                    <th style="width: 36%;">Descripción</th>
                    <th style="width: 15%; text-align: center;">Num. Grupos</th>
                    <th style="width: 15%; text-align: center;">Num. Alumnos</th>
                </tr>
            </thead>
            <tbody>
                <!-- Aquí van las filas de cada Curso -->
            </tbody>
        </table>
    </div>
</th:block>
</body>
</html>
```

### Cabecera para Libros (libros/lista.html)

Ampliaremos la página de Libros incluyendo contenido específico de Libros en el bloque del fragmento.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Libros — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de la lista de libros -->
    <div class="table-responsive rounded-3 shadow-sm">
        <table class="table table-hover xarxa-table mb-0" id="miTabla">
            <thead>
                <tr>
                    <th style="text-align: center; width: 6%;">Id</th>
                    <th style="width: 10%;">Curso</th>
                    <th style="width: 20%;">Área</th>
                    <th style="width: 14%;">ISBN</th>
                    <th style="width: 25%;">Título</th>
                    <th style="width: 15%;">Observaciones</th>
                    <th style="text-align: center; width: 10%;">Cantidad</th>
                </tr>
            </thead>
            <tbody>
                <!-- Aquí van las filas de cada Libro -->
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

Desde el navegador ponemos `localhost:9000/alumnos` y tendrá que aparecer la cabecera de Alumnos sin los datos.

![Alumnos](/sge/repaso5a/repaso5a_11_alumnos.png)

Desde el navegador ponemos `localhost:9000/cursos` y tendrá que aparecer la cabecera de Cursos sin los datos.

![Cursos](/sge/repaso5a/repaso5a_11_cursos.png)

Desde el navegador ponemos `localhost:9000/libros` y tendrá que aparecer la cabecera de Libros sin los datos.

![Libros](/sge/repaso5a/repaso5a_11_libros.png)

## 12. Terminar los Controladores MVC

### AlumnosController

Dentro de `controller` terminamos el fichero `AlumnosController.java` incluyendo los datos de alumnos.

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import com.iesdoctorbalmis.spring.repository.AlumnosRepository;

@Controller 
@RequestMapping ("/alumnos")
public class AlumnosController {
    
    private final AlumnosRepository alumnosRepository;

    // Inyección por constructor
    public AlumnosController(AlumnosRepository alumnosRepository) {
        this.alumnosRepository = alumnosRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("alumnos", alumnosRepository.findAll());
        return "alumnos/lista";  // → templates/alumnos/lista.html
    }
    
}
```

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `alumnosRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "alumnos/lista"` indica a Thymeleaf que busque `templates/alumnos/lista.html`.

### CursosController

Dentro de `controller` terminamos el fichero `CursosController.java` incluyendo los datos de cursos.

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.iesdoctorbalmis.spring.repository.CursosRepository;

@Controller
@RequestMapping("/cursos")
public class CursosController {
    
    private final CursosRepository cursosRepository;

    // Inyección por constructor
    public CursosController(CursosRepository cursosRepository) {
        this.cursosRepository = cursosRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("cursos", cursosRepository.findAll());
        return "cursos/lista";  // → templates/cursos/lista.html
    }
    
}
```

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `cursosRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "cursos/lista"` indica a Thymeleaf que busque `templates/cursos/lista.html`.

### LibrosController

Dentro de `controller` terminamos el fichero `LibrosController.java` incluyendo los datos de libros.

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import com.iesdoctorbalmis.spring.repository.LibrosRepository;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
@RequestMapping ("/libros")
public class LibrosController {
    
    private final LibrosRepository librosRepository;

    // Inyección por constructor
    public LibrosController(LibrosRepository librosRepository) {
        this.librosRepository = librosRepository;
    }

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("libros", librosRepository.findAll());
        return "libros/lista";  // → templates/libros/lista.html
    }
    
}
```

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `librosRepository.findAll()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "libros/lista"` indica a Thymeleaf que busque `templates/libros/lista.html`.

## 13. Completamos las Plantillas Thymeleaf

### Lista de Alumnos (alumnos/lista.html)

Completamos la página de Alumnos incluyendo la fila de cada alumno en `<tbody>`.

```html
<tbody>
    <!-- Aquí van las filas de cada alumno -->
    <tr th:each="alumno : ${alumnos}">
        <td style="text-align: center;" th:text="${alumno.id}"></td>
        <td th:text="${alumno.apellido1}"></td>
        <td th:text="${alumno.apellido2}"></td>
        <td th:text="${alumno.nombre}"></td>                 
        <td>
            <span class="badge" th:classappend="${alumno.tipoAlumno.name() == 'X' 
                                                    ? 'bg-success' 
                                                    : (alumno.tipoAlumno.name() == 'B' 
                                                        ? 'bg-danger' 
                                                        : (alumno.tipoAlumno.name() == 'M' 
                                                            ? 'bg-warning text-dark' 
                                                            : 'bg-secondary'))}"
                th:text="${alumno.tipoAlumno.descripcion}">
            </span>
        </td>
        <td th:text="${alumno.curso}"></td>
    </tr>
</tbody>
```

### Lista de Cursos (cursos/lista.html)

Completamos la página de Cursos incluyendo la fila de cada curso en `<tbody>`.

```html
<tbody>
    <!-- Aquí van las filas de cada Curso -->
    <tr th:each="curso : ${cursos}">
        <td style="text-align: center;" th:text="${curso.id}"></td>
        <td th:text="${curso.curso}"></td>
        <td th:text="${curso.descripcion}"></td>
        <td style="text-align: center;" th:text="${curso.numGrupos}"></td>
        <td style="text-align: center;" th:text="${curso.numAlumnos}"></td>
    </tr>
</tbody>
```

### Lista de Libros (libros/lista.html)

Completamos la página de Libros incluyendo la fila de cada libro en `<tbody>`.

```html
<tbody>
    <!-- Aquí van las filas de cada Libro -->
    <tr th:each="libro : ${libros}">
        <td style="text-align: center;" th:text="${libro.id}"></td>
        <td th:text="${libro.curso}"></td>
        <td th:text="${libro.area}"></td>
        <td th:text="${libro.isbn}"></td>
        <td th:text="${libro.titulo}"></td>
        <td th:text="${libro.observaciones}"></td>
        <td style="text-align: center;" th:text="${libro.cantidad}"></td>
    </tr>
</tbody>
```

## 14. Ejecución Parte 4

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000/alumnos` y tendrá que aparecer la página completa de Alumnos con los datos.

![Alumnos](/sge/repaso5a/repaso5a_14_alumnos.png)

Desde el navegador ponemos `localhost:9000/cursos` y tendrá que aparecer la página completa de Cursos con los datos.

![Cursos](/sge/repaso5a/repaso5a_14_cursos.png)

Desde el navegador ponemos `localhost:9000/libros` y tendrá que aparecer la página completa de Libros con los datos.

![Libros](/sge/repaso5a/repaso5a_14_libros.png)

## 15. Completamos el Repaso 2

Desde aquí nos falta la última parte 5 incluyendo el menú en el layout, la ubicación de cada página y añadiendo la carga de datos en el fichero `index.html` del Panel de Inicio.

### Incluir un menú en la plantilla (fragments/layout.html)

Completamos la plantilla `layout.html` incluyendo el menú de navegación, para que aparezca en todas las páginas.

```html
    <div class="container-fluid h-custom"><!-- Etiqueta contraída -->
    </div>
    <!-- Menú de navegación con navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark xarxa-navbar sticky-top">
        <div class="container-fluid px-3">
            <a class="navbar-brand d-flex align-items-center gap-2" th:href="@{/}">
                <i class="bi bi-book-half"></i> Xarxallibres
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#menuPrincipal" aria-controls="menuPrincipal"
                    aria-expanded="false" aria-label="Mostrar menú">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="menuPrincipal">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/alumnos}"><i class="bi bi-mortarboard"></i> Alumnos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/cursos}"><i class="bi bi-people"></i> Cursos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/libros}"><i class="bi bi-journals"></i> Libros</a>
                    </li>                    
                </ul>
                <span class="xarxa-avatar" title="Usuario"><i class="bi bi-person-fill"></i></span>
            </div>
        </div>
    </nav>
    <main class="container-fluid px-4 py-4"><!-- Etiqueta contraída -->
    </main>
```

### Incluir la ubicación en Alumnos (alumnos/lista.html)

Se añadirá al comenzar el bloque de contenido específico, junto con el buscador y el botón `Nuevo`.

```html
<!-- Aquí va el contenido específico de la lista de alumnos -->
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <!-- Ubicación de la página -->
    <nav aria-label="breadcrumb" class="xarxa-breadcrumb h4 mb-0">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page">Alumnos</li>
        </ol>
    </nav>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar alumno…" />
        <button class="btn btn-primary btn-sm"> Nuevo</button>
    </div>
</div>
<div class="table-responsive rounded-3 shadow-sm"><!-- Etiqueta contraída -->
</div> 
```

### Incluir la ubicación en Cursos (cursos/lista.html)

Se añadirá al comenzar el bloque de contenido específico, junto con el buscador y el botón `Nuevo`.

```html
<!-- Aquí va el contenido específico de la lista de cursos -->
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <!-- Ubicación de la página -->
    <nav aria-label="breadcrumb" class="xarxa-breadcrumb h4 mb-0">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page">Cursos</li>
        </ol>
    </nav>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar libro…" />
        <button class="btn btn-primary btn-sm"> Nuevo</button>
    </div>
</div>
<div class="table-responsive rounded-3 shadow-sm"><!-- Etiqueta contraída -->
</div>
```

### Incluir la ubicación en Libros (libros/lista.html)

Se añadirá al comenzar el bloque de contenido específico, junto con el buscador y el botón `Nuevo`.

```html
<!-- Aquí va el contenido específico de la lista de libros -->
<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
    <!-- Ubicación de la página -->
    <nav aria-label="breadcrumb" class="xarxa-breadcrumb h4 mb-0">
        <ol class="breadcrumb mb-1">
            <li class="breadcrumb-item"><a th:href="@{/}">Inicio</a></li>
            <li class="breadcrumb-item active" aria-current="page">Libros</li>
        </ol>
    </nav>
    <div class="d-flex gap-2">
        <input class="form-control form-control-sm" type="search" placeholder="Buscar libro…" />
        <button class="btn btn-primary btn-sm"> Nuevo</button>
    </div>
</div>
<div class="table-responsive rounded-3 shadow-sm"><!-- Etiqueta contraída -->
</div>
```

### Terminar el HomeController del Panel de Inicio

Dentro de `controller` terminamos el fichero `HomeController.java` incluyendo en el Panel de Inicio los totales de cada entidad.

```java
package com.iesdoctorbalmis.spring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import com.iesdoctorbalmis.spring.repository.AlumnosRepository;
import com.iesdoctorbalmis.spring.repository.CursosRepository;
import com.iesdoctorbalmis.spring.repository.LibrosRepository;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
public class HomeController {

    private final AlumnosRepository alumnosRepository;
    private final CursosRepository cursosRepository;
    private final LibrosRepository librosRepository;

    // Inyección por constructor
    public HomeController(AlumnosRepository alumnosRepository, 
                          CursosRepository cursosRepository, 
                          LibrosRepository librosRepository) {
        this.alumnosRepository = alumnosRepository;
        this.cursosRepository = cursosRepository;
        this.librosRepository = librosRepository;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("totalAlumnos", alumnosRepository.count());
        model.addAttribute("totalCursos", cursosRepository.count());    
        model.addAttribute("totalLibros", librosRepository.count());
        return "index";
    }
    
}
```

**Puntos clave:**
- La inyección de dependencias se hace por constructor (recomendado frente a `@Autowired` en campo).
- `alumnosRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `cursosRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `librosRepository.count()` viene heredado de `JpaRepository` — no lo hemos escrito nosotros.
- `return "index"` indica a Thymeleaf que busque `templates/index.html`.

### Completar el index.html del Panel de Inicio

Dentro de `templates` completamos el fichero `index.html` mostrando una tarjeta por entidad, con su contador de registros y un enlace a su lista, distribuidas una debajo de otra y ocupando el lado derecho de la pantalla.

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Inicio — Xarxallibres</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico del Panel de Inicio  -->
    <br>
    <div class="container-fluid h-custom">
      <div class="row d-flex justify-content-center">
        <!-- Lado Izquierdo -->
        <div style="text-align: center;" class="col-md-5 col-lg-5 col-xl-5">
        </div>
        <!-- Lado Derecho -->
        <div style="text-align: center; align-content: center;" class="col-md-7 col-lg-7 col-xl-7">
            <!-- Fila 1 -->
            <div class="row mb-3 justify-content-center">
                <div class="col-8">
                    <!-- Tu primera Card aquí -->
                    <a class="card xarxa-card text-decoration-none my-3" th:href="@{/alumnos}">
                        <div class="card-body d-flex align-items-center gap-3">
                            <!-- Lado Izquierdo -->
                            <div style="text-align: center;" class="col-md-2 col-lg-2 col-xl-2">
                                <i class="bi bi-mortarboard"></i>
                            </div>
                            <!-- Lado Central-->
                            <div style="text-align: center;" class="col-md-6 col-lg-6 col-xl-6">
                                <div class="xarxa-card-total">Alumnos</div>
                            </div>
                            <!-- Lado Derecho -->
                            <div style="text-align: center;" class="col-md-4 col-lg-4 col-xl-4">
                                <div class="xarxa-card-total" th:text="${totalAlumnos}">0</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <!-- Fila 2 -->
            <div class="row mb-3 justify-content-center">
                <div class="col-8">
                    <!-- Tu segunda Card aquí -->
                    <a class="card xarxa-card text-decoration-none my-3" th:href="@{/cursos}">
                        <div class="card-body d-flex align-items-center gap-3">
                            <!-- Lado Izquierdo -->
                            <div style="text-align: center;" class="col-md-2 col-lg-2 col-xl-2">
                                <i class="bi bi-people"></i>
                            </div>
                            <!-- Lado Central-->
                            <div style="text-align: center;" class="col-md-6 col-lg-6 col-xl-6">
                                <div class="xarxa-card-total">Cursos</div>
                            </div>
                            <!-- Lado Derecho -->
                            <div style="text-align: center;" class="col-md-4 col-lg-4 col-xl-4">
                                <div class="xarxa-card-total" th:text="${totalCursos}">0</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <!-- Fila 3 -->
            <div class="row justify-content-center">
                <div class="col-8">
                    <!-- Tu tercera Card aquí -->
                    <a class="card xarxa-card text-decoration-none my-3" th:href="@{/libros}">
                        <div class="card-body d-flex align-items-center gap-3">
                            <!-- Lado Izquierdo -->
                            <div style="text-align: center;" class="col-md-2 col-lg-2 col-xl-2">
                                <i class="bi bi-journals"></i>
                            </div>
                            <!-- Lado Central-->
                            <div style="text-align: center;" class="col-md-6 col-lg-6 col-xl-6">
                                <div class="xarxa-card-total">Libros</div>
                            </div>
                            <!-- Lado Derecho -->
                            <div style="text-align: center;" class="col-md-4 col-lg-4 col-xl-4">
                                <div class="xarxa-card-total" th:text="${totalLibros}">0</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
    <br>
</th:block>
</body>
</html>
```

## 16. Ejecución Parte 5 con el Repaso 2 completo

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
mvn spring-boot:run
```

Desde el navegador ponemos `localhost:9000` y tendrá que aparecer la página principal con el Panel de Inicio completo.

![Inicio](/sge/repaso5a/repaso5a_16_index.png)

Ahora para ver el resto de páginas no hace falta que escribamos nada en el cuadro del navegador, ya que podemos usar los enlaces de las tarjetas y el menú de navegación.

![Alumnos](/sge/repaso5a/repaso5a_16_alumnos.png)

![Cursos](/sge/repaso5a/repaso5a_16_cursos.png)

![Libros](/sge/repaso5a/repaso5a_16_libros.png)

## 17. Terminar con un par de mejoras

Aunque el proyecto ya se puede dar por terminado tal y como esta, vamos a mejorarlo un poco más para que nos quede mejor visualmente.

### Componente de paginación

Lo primero que necesitaremos es un fichero JavaScript llamado `paginacion.js` para que haga funcionar todo lo necesario. Crearemos en `static` una nueva carpeta llamada `js` y dentro pondremos el JavaScript que puedes descargar desde este enlace: <a href="/sge/repaso5a/paginacion.js" target="_blank" style="display: inline-block; margin-top: 0rem; padding: 0rem 0.25rem; background-color: #3f51b5; color: white; border-radius: 4px; text-decoration: none;">paginacion.js</a>

Al final de la plantilla `fragments/layout.html` añadiremos el enlace a ese JavaScript, para que lo podamos usar en cualquier plantilla html.

```html
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/js/paginacion.js"></script> <!-- Nuevo para añadir -->
</body>
```
Lo añadiremos al final, después de la etiqueta `</footer>`, entre el `<script>` existente y el final del `</body>`.

Después en cada plantilla de listado, `alumnos/lista.html`, `cursos/lista.html` y `libros/lista.html` añadiremos estos dos bloques de líneas.

**Bloque 1:**

```html
    </tbody>
    <!-- Cambia el fondo del pie usando variables solo para esta zona -->
    <tfoot style="--bs-table-bg: var(--xarxa-green-light)">
        <tr>
            <td colspan="100%" class="py-2">
                <!-- Componente de Paginación de Bootstrap -->
                <nav aria-label="Paginación de la tabla">
                    <ul class="pagination  mb-0 justify-content-center" id="paginacion">
                        <!-- Los botones se generarán dinámicamente con JavaScript -->
                    </ul>
                </nav>
            </td>
        </tr>
    </tfoot>
</table>
```

Entre el `</tbody>` y el `</table>` añadiremos un pie de tabla en donde irán los botones de paginación.

**Bloque 2:**

```html
        </table>
    </div>
    <!-- Enlazas el script externo común -->
    <script src="paginacion.js"></script>
    <!-- Lo activas pasando los IDs de esta página específica -->
    <script>
        // Asegúrate de que el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            // Puedes cambiar el último número para ajustar las filas por página de este HTML
            inicializarPaginacion('miTabla', 'paginacion', 10);
        });
    </script>
</th:block>
```

Entre el final del contenedor que contiene la tabla `</table></div>`, y el final del bloque del fragmento `</th:block>`, pondremos las líneas para enlazar con el script externo, cargar el DOM y ajustar las filas por página, en nuestro caso, 10 líneas.

### Componente de carrusel de imágenes

Vamos a utilizar el componente de carrusel para que se muestren las imágenes de cada libro en el Panel de Inicio, en el lado izquierdo de la pantalla, al lado de las tarjetas con contadores de entidades.

Primero modificamos el `HomeController.java`, para pasarle todos los datos de `Libros` a la plantilla `index.html`.

```java
public String home(Model model) {
    model.addAttribute("libros", librosRepository.findAll());  /* Añadimos está línea */
    model.addAttribute("totalAlumnos", alumnosRepository.count());
```

Añadiremos ese `model.addAttribute` entre el principio del método `home` y el paso del contador de alumnos.

Después, modificaremos la plantilla `index.html` para insertar el carrusel de imágenes.

```html
<!-- Lado Izquierdo -->
<div style="text-align: center;" class="col-md-5 col-lg-5 col-xl-5">
    <!-- Carrusel de portadas de libros -->
    <div id="carouselLibros" class="carousel slide" data-bs-ride="carousel">
        <!-- Indicadores -->
        <div class="carousel-indicators">
            <button type="button"
                    th:each="libro, iterStat : ${libros}"
                    data-bs-target="#carouselLibros"
                    th:data-bs-slide-to="${iterStat.index}"
                    th:classappend="${iterStat.first} ? 'active' : ''"
                    th:aria-current="${iterStat.first} ? 'true' : null"
                    th:aria-label="'Slide ' + ${iterStat.index + 1}">
            </button>
        </div>
        <!-- Imágenes (portadas desde static/img, nombre guardado en la entidad) -->
        <div class="carousel-inner">
            <div th:each="libro, iterStat : ${libros}"
                class="carousel-item"
                th:classappend="${iterStat.first} ? 'active' : ''">
                <img th:src="@{'/img/' + ${libro.imagen}}"
                    class="d-block mx-auto"
                    style="max-height: 500px; width: auto; max-width: 100%; object-fit: contain;"
                    th:alt="${libro.imagen}">
            </div>
        </div>
        <!-- Controles de navegación -->
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselLibros" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselLibros" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
        </button>
    </div>
</div>
<!-- Lado Derecho -->
```

Pondremos estas líneas entre el primer contenedor `<div>` que se encuentra entre los comentarios de `<!-- Lado Izquierdo -->` y `<!-- Lado Derecho -->`, cuya primera línea es el comentario `<!-- Carrusel de portadas de libros -->`, para realizar las tareas del carrusel de imágenes, como la gestión de **indicadores**, la **carga de imágenes** y los **controles de navegación**.

## 18. Ejecución Parte 6 con el Repaso 2 mejorado y terminado

Desde el navegador ponemos `localhost:9000` y tendrá que aparecer el carruse de imágen en la página principal.

![Inicio](/sge/repaso5a/repaso5a_18_index.png)

En el resto de páginas comprobaremos que se ha insertado el componenete de paginación.

![Alumnos](/sge/repaso5a/repaso5a_18_alumnos.png)

![Cursos](/sge/repaso5a/repaso5a_18_cursos.png)

![Libros](/sge/repaso5a/repaso5a_18_libros.png)


## 19. Entrega del Repaso 2

### Estructura esperada

La estructura final del proyecto será:

```
src/
└── main/
    ├── java/com/iesdoctorbalmis/spring/
    │   ├── Application.java
    │   ├── controller/             ← NUEVO en Repaso 2
    │   │   ├── HomeController.java
    │   │   ├── AlumnosController.java
    │   │   ├── CursosController.java
    │   │   └── LibrosController.java
    │   ├── entity/                 (sin cambios)
    │   └── repository/             (sin cambios)
    └── resources/
        ├── application.properties  (sin cambios)
        ├── import.sql              (sin cambios)
        ├── static/                 ← NUEVO en Repaso 2
        │   ├── css/
        │   │   └── xarxallibres.css
        │   ├── img/
        │   │   ├── Logo_IES.png
        │   │   ├── gva.png
        │   │   ├── ?eso-0?.jpg
        │   │   └── ?pdc-0?.jpg        
        │   └── js/
        │       └── paginacion.js           
        └── templates/              ← NUEVO en Repaso 2
            ├── fragments/
            │   └── layout.html
            ├── index.html
            ├── alumnos/
            │   └── lista.html
            ├── cursos/
            │   └── lista.html
            └── libros/
                └── lista.html
```

### Requisitos de entrega

1. **Repositorio Git:** Actualiza el repositorio en tu organización con el nombre **Repaso1ev_Apellido1_Nombre** (ejemplo: **Repaso1ev_Estañ_Luis**)

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
