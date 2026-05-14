---
title: "Reto 2: La Vista"
description: Añadir una capa de presentación web al ERP Balmis usando Thymeleaf y el patrón MVC.
---

### Reto 2 · La Vista
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 6 horas  
> **Reto anterior:** [Reto 1 — De la Semilla a la Raíz](/docs/retos/reto1)

---

## 📌 Resumen del Reto

Transformarás el Reto 1 añadiendo:
- **Thymeleaf:** Motor de plantillas HTML integrado con Spring Boot
- **Controladores MVC:** `@Controller` con `@GetMapping` y `Model`
- **Layout reutilizable:** Fragmento base con navbar y Bootstrap 5
- **Vistas de listado:** Clientes, Empleados y Productos
- **Panel de control:** Página de inicio con contadores

---

## 1. El patrón MVC en Spring Boot

**MVC** (Model-View-Controller) es el patrón arquitectónico que Spring MVC implementa para aplicaciones web.

```
Navegador
    │
    │  HTTP GET /clientes
    ▼
Controller (@Controller)
    │
    │  clienteRepository.findAll()
    ▼
Repository (JpaRepository)
    │
    │  List<Cliente>
    ▼
Controller
    │
    │  model.addAttribute("clientes", lista)
    │  return "clientes/lista"
    ▼
Thymeleaf (Motor de plantillas)
    │
    │  HTML generado
    ▼
Navegador (respuesta HTML)
```

### Los tres elementos

| Elemento | Responsabilidad | En nuestro proyecto |
|---|---|---|
| **Model** | Datos que se pasan a la vista | `Model model` en el controlador |
| **View** | Presentación HTML | Plantillas `.html` en `templates/` |
| **Controller** | Lógica de petición HTTP | Clases con `@Controller` |

---

## 2. ¿Qué es Thymeleaf?

**Thymeleaf** es el motor de plantillas oficial de Spring Boot para generar HTML dinámico en el servidor. Sus plantillas son **HTML válido** que puede abrirse en un navegador sin servidor (modo estático), pero cuando Spring lo procesa, sustituye los valores dinámicos.

### Atributos `th:*` más habituales

| Atributo | Función | Ejemplo |
|---|---|---|
| `th:text` | Reemplaza el texto del elemento | `th:text="${cliente.nombre}"` |
| `th:each` | Bucle sobre una colección | `th:each="c : ${clientes}"` |
| `th:href` | URL generada por Spring | `th:href="@{/clientes}"` |
| `th:if` | Condición para mostrar | `th:if="${#lists.isEmpty(lista)}"` |
| `th:classappend` | Añade clase CSS condicional | `th:classappend="${activo} ? 'bg-success'"` |
| `th:replace` | Sustituye con un fragmento | `th:replace="~{fragments/layout :: layout(...)}"` |
| `th:fragment` | Declara un fragmento reutilizable | `th:fragment="layout(title, content)"` |

---

## 3. Preparación

### Crea una copia del proyecto

1. Copia la carpeta `erpbalmis_1` (del Reto 1) y nómbrala `erpbalmis_2`
2. Trabajaremos sobre `erpbalmis_2` añadiendo la capa de presentación

La estructura final del proyecto será:

```
erpbalmis_2/
└── src/
    └── main/
        ├── java/com/iesdoctorbalmis/spring/
        │   ├── Application.java
        │   ├── controller/              ← NUEVO en Reto 2
        │   │   ├── HomeController.java
        │   │   ├── ClienteController.java
        │   │   ├── EmpleadoController.java
        │   │   └── ProductoController.java
        │   ├── entity/                  (sin cambios)
        │   └── repository/             (sin cambios)
        └── resources/
            ├── application.properties  (sin cambios)
            ├── import.sql              (sin cambios)
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

## 4. Añadir Thymeleaf al proyecto

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

## 5. Controladores MVC

Un `@Controller` en Spring MVC es una clase que:
1. Recibe peticiones HTTP mediante `@GetMapping`, `@PostMapping`, etc.
2. Recupera datos de los repositorios.
3. Los pone en el `Model` para que la plantilla los use.
4. Devuelve el nombre de la plantilla a renderizar.

### HomeController

El controlador de inicio muestra el panel de control con los totales de cada entidad.

```java
@Controller
public class HomeController {

    private final ClienteRepository clienteRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ProductoRepository productoRepository;

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
@Controller
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

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

### EmpleadoController y ProductoController

Siguen exactamente el mismo patrón que `ClienteController`, adaptando el repositorio y la plantilla correspondientes.

---

## 6. Plantillas Thymeleaf

### Layout base con fragmentos

El **fragmento de layout** es una plantilla maestra que define la estructura HTML común (navbar, footer, Bootstrap) y se reutiliza en todas las páginas. Evita repetir el mismo HTML en cada vista.

```html
<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:fragment="layout(title, content)">
<head>
    <meta charset="UTF-8" />
    <title th:replace="${title}">ERP Balmis</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" th:href="@{/}">ERP Balmis</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/clientes}">Clientes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/empleados}">Empleados</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:href="@{/productos}">Productos</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container py-4">
        <th:block th:replace="${content}" />
    </main>

    <footer class="text-center py-3 border-top">
        <p class="mb-0">ERP Balmis — IES Doctor Balmis · Módulo SGE</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

**Cómo funciona:**
- `th:fragment="layout(title, content)"` — declara el fragmento con dos parámetros.
- `th:replace="${title}"` — inserta el título que pase cada página.
- `th:replace="${content}"` — inserta el bloque de contenido de cada página.

### Cómo usar el layout en cada página

```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Clientes — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- Aquí va el contenido específico de cada página -->
</th:block>
</body>
</html>
```

### Lista de clientes

Fragmento clave de la tabla con iteración y badge de tipo:

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

### Lista de productos

Incluye formateo de números decimales para los precios:

```html
<td class="text-end"
    th:text="${#numbers.formatDecimal(producto.precioVenta, 1, 2)} + ' €'"></td>
```

---

## 7. Expresiones Thymeleaf

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

## 8. Verificación

```bash
# Compilar
mvn clean compile

# Ejecutar
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

El proyecto `erpbalmis_2` debe tener:
- `pom.xml` con la dependencia `spring-boot-starter-thymeleaf`
- Cuatro controladores en el paquete `controller/`
- Fragmento de layout en `templates/fragments/layout.html`
- Página de inicio `templates/index.html` con contadores
- Tres plantillas de lista: `clientes/lista.html`, `empleados/lista.html`, `productos/lista.html`
- Servidor ejecutándose en `http://localhost:9000` mostrando el panel de control
- Navegación funcional entre todas las secciones

<!-- 
## Repositorio

[github.com/lestan-balmis/sge-reto2](https://github.com/lestan-balmis/sge-reto2)
-->