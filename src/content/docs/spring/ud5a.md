---
title: "UD5a: Spring MVC y Thymeleaf"
description: Patrón MVC, Thymeleaf y layout reutilizable con Bootstrap. Base teórica para el Reto 2.
---

> **Herramientas:** Spring MVC, Thymeleaf, Bootstrap  
> **Prerequisito:** [UD4 — Introducción a Spring Boot](/sge/spring/ud4) (Retos 0 y 1)  
> **Objetivo:** Construir la capa de presentación HTML de una aplicación web con Spring MVC, Thymeleaf y Bootstrap.

---

## Índice

1. [El patrón MVC en Spring Boot](#1-el-patrón-mvc-en-spring-boot)
2. [Thymeleaf: Motor de plantillas](#2-thymeleaf-motor-de-plantillas)
3. [Bootstrap y layout reutilizable](#3-bootstrap-y-layout-reutilizable)
4. [🎯 PAUSA: Aquí puedes hacer el **Reto 2** ](#4--pausa-aquí-puedes-hacer-el-reto-2)

---

## 1. El patrón MVC en Spring Boot

**MVC** (Model-View-Controller) separa una aplicación en tres responsabilidades:

```
Navegador
    │  HTTP GET /clientes
    ▼
Controller (@Controller)         ← recibe la petición, llama al repositorio
    │  clienteRepository.findAll()
    ▼
Repository (JpaRepository)       ← accede a la base de datos
    │  List<Cliente>
    ▼
Controller
    │  model.addAttribute("clientes", lista)
    │  return "clientes/lista"
    ▼
Thymeleaf (Motor de plantillas)  ← combina datos + plantilla HTML
    │  HTML generado
    ▼
Navegador                        ← recibe la página HTML
```

### Los tres elementos

| Elemento | Responsabilidad | En Spring Boot |
|---|---|---|
| **Model** | Datos que se pasan a la vista | `Model model` en el controlador |
| **View** | Presentación HTML | Plantillas `.html` en `src/main/resources/templates/` |
| **Controller** | Lógica de petición HTTP | Clases con `@Controller` |

### Anotaciones clave de un `@Controller`

```java
@Controller
@RequestMapping("/clientes")       // Prefijo de ruta para todos los métodos
public class ClienteController {

    private final ClienteRepository clienteRepository;

    // Inyección por constructor (mejor práctica)
    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping                    // HTTP GET /clientes
    public String listar(Model model) {
        model.addAttribute("clientes", clienteRepository.findAll());
        return "clientes/lista";   // → src/main/resources/templates/clientes/lista.html
    }

    @GetMapping("/{id}")           // HTTP GET /clientes/3
    public String detalle(@PathVariable Long id, Model model) {
        model.addAttribute("cliente", clienteRepository.findById(id).orElseThrow());
        return "clientes/detalle";
    }
}
```

### Comparación de anotaciones de mapeo

| Anotación | Método HTTP | Uso habitual |
|---|---|---|
| `@GetMapping` | GET | Mostrar página o recurso |
| `@PostMapping` | POST | Enviar formulario |
| `@PutMapping` | PUT | Actualización completa (REST) |
| `@PatchMapping` | PATCH | Actualización parcial (REST) |
| `@DeleteMapping` | DELETE | Eliminar recurso (REST) |

---

## 2. Thymeleaf: Motor de plantillas

**Thymeleaf** genera HTML dinámico en el servidor. Sus plantillas son **HTML estándar válido** con atributos especiales `th:*` que Spring reemplaza con datos reales antes de enviar la respuesta.

### Atributos `th:*` más usados

| Atributo | Función | Ejemplo |
|---|---|---|
| `th:text` | Sustituye el texto del elemento | `<span th:text="${cliente.nombre}">placeholder</span>` |
| `th:each` | Bucle sobre una colección | `<tr th:each="c : ${clientes}">` |
| `th:href` | URL dinámica generada por Spring | `<a th:href="@{/clientes/{id}(id=${c.id})}">Ver</a>` |
| `th:if` / `th:unless` | Renderizado condicional | `<p th:if="${#lists.isEmpty(lista)}">Sin resultados</p>` |
| `th:classappend` | Añade clase CSS de forma condicional | `th:classappend="${activo} ? 'bg-success'"` |
| `th:replace` | Sustituye el elemento con un fragmento | `th:replace="~{fragments/layout :: navbar}"` |
| `th:fragment` | Declara un fragmento reutilizable | `th:fragment="navbar"` |
| `th:action` | URL del formulario | `<form th:action="@{/clientes}" method="post">` |
| `th:object` | Objeto ligado al formulario | `<form th:object="${cliente}">` |
| `th:field` | Campo ligado a propiedad del objeto | `<input th:field="*{nombre}">` |

### Ejemplo: listado de clientes

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head><title>Clientes</title></head>
<body>
  <h1>Lista de Clientes</h1>

  <!-- Mensaje cuando no hay clientes -->
  <p th:if="${#lists.isEmpty(clientes)}" class="text-muted">
    No hay clientes registrados.
  </p>

  <!-- Tabla cuando sí hay clientes -->
  <table th:unless="${#lists.isEmpty(clientes)}">
    <thead>
      <tr><th>Código</th><th>Nombre</th><th>Email</th><th>Tipo</th></tr>
    </thead>
    <tbody>
      <!-- th:each genera una fila por cada elemento de la lista -->
      <tr th:each="c : ${clientes}">
        <td th:text="${c.codigoCliente}">CLI001</td>
        <td th:text="${c.nombre}">Nombre</td>
        <td th:text="${c.email}">email@ejemplo.com</td>
        <td th:text="${c.tipoCliente.descripcion}">Activo</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
```

### URLs con `@{...}`

Thymeleaf gestiona automáticamente el contexto de la aplicación con la sintaxis `@{...}`:

```html
<!-- Ruta simple -->
<a th:href="@{/clientes}">Ver todos</a>

<!-- Ruta con variable de path -->
<a th:href="@{/clientes/{id}(id=${c.id})}">Detalle</a>

<!-- Ruta con parámetro de query -->
<a th:href="@{/clientes(tipo='ACTIVO')}">Activos</a>
```

---

## 3. Bootstrap y layout reutilizable

En lugar de repetir la barra de navegación y el pie en cada página, Thymeleaf permite definir **fragmentos** (`th:fragment`) que se incluyen en otras plantillas.

### Fragmento de layout base

```html
<!-- templates/fragments/layout.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
  <!--
    th:fragment="layout(title, content)" define un fragmento parametrizado.
    Cada página pasa su título y su bloque de contenido.
  -->
  <div th:fragment="layout(title, content)">
    <nav class="navbar navbar-dark bg-dark">
      <a class="navbar-brand" th:href="@{/}">ERP Balmis</a>
    </nav>
    <main class="container mt-4">
      <h2 th:text="${title}">Título</h2>
      <!-- th:replace inserta aquí el contenido de cada página -->
      <div th:replace="${content}"></div>
    </main>
  </div>
</body>
</html>
```

### Uso del layout en una página

```html
<!-- templates/clientes/lista.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
  <!-- Llama al layout con título y el contenido de este archivo -->
  <div th:replace="~{fragments/layout :: layout(
        title='Clientes',
        content=~{::main-content})}">
  </div>

  <!-- Bloque de contenido específico de esta página -->
  <th:block th:fragment="main-content">
    <table class="table">
      <!-- ... filas de clientes ... -->
    </table>
  </th:block>
</body>
</html>
```

---

## 4. 🎯 PAUSA: Aquí puedes hacer el **Reto 2**

Con los conceptos de MVC, Thymeleaf y layout reutilizable ya tienes las bases para construir la capa visual del ERP.

> **[→ Ir al Reto 2: La Vista](/sge/retos/reto2)**
>
> - Añadir Thymeleaf al proyecto del Reto 1
> - Crear controladores MVC: Home, Cliente, Empleado, Producto
> - Construir layout con Bootstrap 5
> - Páginas de listado con contadores en el panel de control
