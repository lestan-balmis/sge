---
title: "UD5 — Spring MVC, REST y Arquitectura por Capas"
description: MVC, Thymeleaf, REST, DTOs, Bean Validation, capa de servicio y manejo de excepciones. Base teórica para los Retos 2 y 3.
---

### UD5 — Spring MVC, REST y Arquitectura por Capas
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 20 horas teóricas + prácticas  
> **Herramientas:** Spring MVC, Thymeleaf, Bootstrap, Jackson, Bean Validation, SpringDoc OpenAPI  
> **Prerequisito:** [UD4 — Introducción a Spring Boot](/sge/spring/ud4) (Retos 0 y 1)  
> **Objetivo:** Construir una aplicación web completa con vistas HTML y API REST, aplicando arquitectura por capas, DTOs y gestión de errores.

---

## Índice

1. [El patrón MVC en Spring Boot](#1-el-patrón-mvc-en-spring-boot)
2. [Thymeleaf: Motor de plantillas](#2-thymeleaf-motor-de-plantillas)
3. [Bootstrap y layout reutilizable](#3-bootstrap-y-layout-reutilizable)
4. [🎯 PAUSA: Aquí puedes hacer el **Reto 2** ](#4--pausa-aquí-puedes-hacer-el-reto-2)
5. [De MVC a REST: `@RestController`](#5-de-mvc-a-rest-restcontroller)
6. [HTTP: Verbos y códigos de estado](#6-http-verbos-y-códigos-de-estado)
7. [ResponseEntity: Control total de la respuesta HTTP](#7-responseentity-control-total-de-la-respuesta-http)
8. [Jackson: Serialización JSON](#8-jackson-serialización-json)
9. [🎯 PAUSA: Aquí puedes hacer el **Reto 3** ](#9--pausa-aquí-puedes-hacer-el-reto-3)
10. [El patrón DTO](#10-el-patrón-dto)
11. [Bean Validation: Validar la entrada](#11-bean-validation-validar-la-entrada)
12. [La capa de Servicio (@Service)](#12-la-capa-de-servicio-service)
13. [Excepciones personalizadas y @RestControllerAdvice](#13-excepciones-personalizadas-y-restcontrolleradvice)
14. [OpenAPI / Swagger UI con SpringDoc](#14-openapi--swagger-ui-con-springdoc)
15. [Relaciones entre entidades: @ManyToOne](#15-relaciones-entre-entidades-manytoone)

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

---

## 5. De MVC a REST: `@RestController`

En el Reto 2 el servidor devuelve **HTML** (para un navegador). A partir del Reto 3, el servidor también devuelve **JSON** (para aplicaciones cliente: móviles, SPAs, Postman…).

### La diferencia fundamental

```
Reto 2 — @Controller (MVC)
Navegador → GET /clientes → Controller → model + plantilla → Thymeleaf → HTML

Reto 3 — @RestController (REST)
Postman  → GET /api/clientes → RestController → List<Cliente> → Jackson → JSON
```

`@RestController` equivale a `@Controller` + `@ResponseBody`. El `@ResponseBody` indica a Spring que el valor de retorno del método debe serializarse directamente en el cuerpo de la respuesta HTTP, **no** interpretarse como nombre de plantilla.

### Convivencia: MVC y REST en el mismo proyecto

Lo más importante: **ambas capas comparten los mismos repositorios**. No hay duplicidad de lógica; solo cambia la forma de presentar los datos.

```java
// Controlador MVC (Reto 2) — sigue funcionando igual
@Controller
@RequestMapping("/clientes")
public class ClienteController {
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("clientes", clienteRepository.findAll());
        return "clientes/lista";   // → HTML
    }
}

// Controlador REST (Reto 3) — nuevo, misma fuente de datos
@RestController
@RequestMapping("/api/clientes")
public class ClienteRestController {
    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();  // → JSON
    }
}
```

---

## 6. HTTP: Verbos y códigos de estado

Una API REST usa los **verbos HTTP** para expresar la operación y los **códigos de estado** para expresar el resultado.

### Verbos HTTP en una API CRUD

| Verbo | Ruta | Operación | Código éxito |
|---|---|---|---|
| GET | `/api/clientes` | Listar todos | 200 OK |
| GET | `/api/clientes/{id}` | Obtener uno | 200 OK |
| POST | `/api/clientes` | Crear nuevo | 201 Created |
| PUT | `/api/clientes/{id}` | Actualización completa | 200 OK |
| PATCH | `/api/clientes/{id}/tipo` | Actualización parcial | 200 OK |
| DELETE | `/api/clientes/{id}` | Eliminar | 204 No Content |

### Códigos de estado más comunes

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `200` | OK | Petición exitosa con cuerpo de respuesta |
| `201` | Created | Recurso creado (POST) |
| `204` | No Content | Éxito sin cuerpo (DELETE) |
| `400` | Bad Request | Datos de entrada inválidos |
| `404` | Not Found | El recurso solicitado no existe |
| `409` | Conflict | Conflicto de negocio (email duplicado) |
| `500` | Internal Server Error | Error inesperado del servidor |

---

## 7. ResponseEntity: Control total de la respuesta HTTP

`ResponseEntity<T>` permite controlar **código de estado**, **cabeceras** y **cuerpo** de la respuesta.

```java
// Devuelve 200 OK con cuerpo
return ResponseEntity.ok(cliente);

// Devuelve 201 Created con cuerpo
return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);

// Devuelve 404 Not Found sin cuerpo
return ResponseEntity.notFound().build();

// Devuelve 204 No Content
return ResponseEntity.noContent().build();

// Construido paso a paso
return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .header("X-Error", "email-duplicado")
        .body(Map.of("mensaje", "El email ya existe"));
```

### Ejemplo completo con `ResponseEntity`

```java
@GetMapping("/{id}")
public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
    return clienteRepository.findById(id)
            .map(ResponseEntity::ok)              // Si existe → 200 con el cliente
            .orElse(ResponseEntity.notFound().build()); // Si no existe → 404 vacío
}
```

---

## 8. Jackson: Serialización JSON

Spring Boot incluye **Jackson** por defecto. Convierte automáticamente objetos Java a JSON (serialización) y JSON a objetos Java (deserialización).

### ¿Qué serializa Jackson?

Jackson serializa todos los campos con getter público. Con Lombok (`@Data`), todos los campos se serializan automáticamente:

```java
// Entidad Java
@Data
public class Cliente {
    private Long id;
    private String nombre;
    private TipoCliente tipoCliente;  // Enum → se serializa como String
    private LocalDate fechaAlta;
}

// JSON resultante
{
  "id": 1,
  "nombre": "Empresa ABC S.L.",
  "tipoCliente": "ACTIVO",
  "fechaAlta": "2025-01-15"
}
```

### Anotaciones Jackson útiles

| Anotación | Efecto |
|---|---|
| `@JsonIgnore` | Excluye el campo de la serialización |
| `@JsonProperty("nombreJSON")` | Cambia el nombre en el JSON |
| `@JsonFormat(pattern = "dd/MM/yyyy")` | Formatea fechas |
| `@JsonInclude(NON_NULL)` | Omite campos nulos |

### El problema: Ciclos infinitos con relaciones JPA

Cuando una entidad tiene una relación bidireccional (`@OneToMany` ↔ `@ManyToOne`), Jackson puede entrar en un bucle infinito al intentar serializar. La solución es usar **DTOs** (ver sección 10).

---

## 9. 🎯 PAUSA: Aquí puedes hacer el **Reto 3**

Con `@RestController`, `ResponseEntity` y Jackson tienes todo para añadir una primera API REST al proyecto.

> **[→ Ir al Reto 3: La Transición](/sge/retos/reto3)**
>
> - Crear `ClienteRestController` y `ProductoRestController`
> - Endpoints GET que devuelven JSON
> - Respuesta 404 correcta con `ResponseEntity`
> - Verificar con Postman

---

## 10. El patrón DTO

### ¿Qué es un DTO?

Un **DTO** (*Data Transfer Object*) es un objeto cuyo único propósito es transportar datos entre capas, especialmente entre la capa de negocio y la capa de presentación (API REST).

### ¿Por qué no exponer directamente la entidad JPA?

Exponer la entidad JPA en la API tiene tres problemas:

| Problema | Consecuencia |
|---|---|
| **Acoplamiento** | Cambiar el modelo de BD rompe el contrato de la API |
| **Exceso de datos** | Se exponen campos internos (contraseñas, campos de auditoría) |
| **Ciclos Jackson** | Relaciones bidireccionales causan bucles de serialización |

### DTO de respuesta vs DTO de entrada

Usamos dos DTOs para el módulo de clientes:

```
Request (entrada) ──→  ClienteRequestDTO  ──→  Controller  ──→  Service  ──→  ClienteRepository  ──→  BD
                                                                                        │
Response (salida) ←──  ClienteDTO         ←──  Controller  ←──  Service ←────────────┘
```

**DTO de respuesta** (`ClienteDTO`) — controla qué se expone:
```java
@Data @NoArgsConstructor @AllArgsConstructor
public class ClienteDTO {
    private Long id;
    private String codigoCliente;
    private String nombre;
    private String email;
    private TipoCliente tipoCliente;
    private LocalDate fechaAlta;
    // Sin fechaModificacion, sin colecciones internas, sin contraseñas
}
```

**DTO de entrada** (`ClienteRequestDTO`) — valida lo que llega:
```java
@Data
public class ClienteRequestDTO {
    @NotBlank(message = "El código de cliente es obligatorio")
    @Size(max = 50)
    private String codigoCliente;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100)
    private String nombre;

    @NotBlank @Email(message = "El email no tiene un formato válido")
    private String email;

    @Size(max = 20)
    private String telefono;

    @NotNull(message = "El tipo de cliente es obligatorio")
    private TipoCliente tipoCliente;
}
```

---

## 11. Bean Validation: Validar la entrada

**Bean Validation** (JSR-380) define un conjunto de anotaciones para validar campos. Spring Boot integra la implementación **Hibernate Validator** a través del Starter:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### Anotaciones más comunes

| Anotación | Validación |
|---|---|
| `@NotNull` | El campo no puede ser `null` |
| `@NotBlank` | String no nulo y con al menos un carácter no espacio |
| `@NotEmpty` | Colección/String no nulo y no vacío |
| `@Size(min, max)` | Longitud de String o colección dentro del rango |
| `@Min(n)` / `@Max(n)` | Número >= n o <= n |
| `@Email` | Formato de email válido |
| `@Pattern(regexp)` | Coincide con la expresión regular |
| `@Positive` | Número > 0 |
| `@Future` / `@Past` | Fecha en el futuro/pasado |

### Activar la validación con `@Valid`

Basta con añadir `@Valid` antes del `@RequestBody` en el controlador:

```java
@PostMapping
public ResponseEntity<ClienteDTO> crear(@Valid @RequestBody ClienteRequestDTO request) {
    // Si request no pasa las validaciones, Spring lanza MethodArgumentNotValidException
    // antes de llegar a esta línea.
    return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
}
```

Si la validación falla, Spring lanza `MethodArgumentNotValidException`, que el `@RestControllerAdvice` captura y devuelve como JSON con los errores de cada campo.

---

## 12. La capa de Servicio (@Service)

### ¿Por qué una capa de servicio?

En los Retos 0-3 el controlador accedía directamente al repositorio. Eso funciona para operaciones simples, pero cuando la lógica crece surgen problemas:

- El controlador REST y el controlador MVC necesitan la **misma lógica** → duplicación
- La lógica de negocio (p. ej. "el email debe ser único") queda mezclada con la lógica HTTP
- Las pruebas unitarias se complican porque el controlador tiene demasiadas responsabilidades

La solución es la **capa de servicio**:

```
Controller  ──→  Service  ──→  Repository  ──→  BD
(HTTP)           (negocio)     (persistencia)
```

### Estructura de un Service

```java
@Service   // Spring lo detecta y gestiona como bean
public class ClienteService {

    private final ClienteRepository clienteRepository;

    // Inyección por constructor
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // --- Consultas ---

    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public ClienteDTO buscarPorId(Long id) {
        return toDTO(obtenerEntidad(id));
    }

    // --- Operaciones de escritura con validación de negocio ---

    public ClienteDTO crear(ClienteRequestDTO request) {
        // Validación de negocio: el email no puede estar repetido
        validarEmailUnico(request.getEmail(), null);
        Cliente cliente = new Cliente();
        aplicarCambios(cliente, request);
        cliente.setFechaAlta(LocalDate.now());
        return toDTO(clienteRepository.save(cliente));
    }

    // --- Helpers privados ---
    private Cliente obtenerEntidad(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente", id));
    }

    private void validarEmailUnico(String email, Long idActual) {
        clienteRepository.findByEmail(email).ifPresent(existente -> {
            if (!existente.getId().equals(idActual)) {
                throw new EmailDuplicadoException(email);
            }
        });
    }

    private ClienteDTO toDTO(Cliente c) {
        return new ClienteDTO(c.getId(), c.getCodigoCliente(), c.getNombre(),
                c.getEmail(), c.getTelefono(), c.getTipoCliente(), c.getFechaAlta(), c.getFechaModificacion());
    }
}
```

### Responsabilidades de cada capa

| Capa | Responsabilidad | Clase |
|---|---|---|
| **Controller** | Recibir HTTP, validar formato, devolver HTTP | `@RestController` |
| **Service** | Lógica de negocio, orquestar repositorios | `@Service` |
| **Repository** | Acceso a la base de datos | `JpaRepository` |
| **Entity** | Representación de la tabla en BD | `@Entity` |
| **DTO** | Transferencia de datos (entrada/salida API) | POJO |

---

## 13. Excepciones personalizadas y @RestControllerAdvice

### Excepciones de dominio

En lugar de devolver `null` o cadenas de error, definimos **excepciones propias** que representan situaciones de negocio:

```java
// Se lanza cuando no se encuentra un recurso → HTTP 404
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String recurso, Long id) {
        super(recurso + " con id " + id + " no encontrado");
    }
}

// Se lanza cuando ya existe un email → HTTP 409
public class EmailDuplicadoException extends RuntimeException {
    public EmailDuplicadoException(String email) {
        super("Ya existe un cliente con el email: " + email);
    }
}
```

### @RestControllerAdvice: Punto central de manejo de errores

`@RestControllerAdvice` es una clase que intercepta las excepciones de **todos** los controladores y las convierte en respuestas JSON homogéneas:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Captura RecursoNoEncontradoException → devuelve 404 en JSON
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleNoEncontrado(RecursoNoEncontradoException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // Captura errores de @Valid → devuelve 400 con los campos inválidos
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> campos.put(fe.getField(), fe.getDefaultMessage()));

        return ResponseEntity.badRequest().body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", 400,
            "error", "Datos de entrada inválidos",
            "campos", campos
        ));
    }

    // Captura EmailDuplicadoException → devuelve 409 en JSON
    @ExceptionHandler(EmailDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> handleConflicto(EmailDuplicadoException ex) {
        return buildError(HttpStatus.CONFLICT, ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String mensaje) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("mensaje", mensaje);
        return ResponseEntity.status(status).body(body);
    }
}
```

### Respuesta de error homogénea

Con este patrón, **todos** los errores de la API tienen la misma estructura JSON:

```json
{
  "timestamp": "2025-09-15T10:35:22.123",
  "status": 404,
  "error": "Not Found",
  "mensaje": "Cliente con id 99 no encontrado"
}
```

---

## 14. OpenAPI / Swagger UI con SpringDoc

**OpenAPI** es el estándar para describir APIs REST. **Swagger UI** es la interfaz visual que genera documentación interactiva desde esa descripción.

**SpringDoc** genera automáticamente la especificación OpenAPI inspeccionando los controladores.

### Dependencia en `pom.xml`

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.8</version>
</dependency>
```

### Sin configuración extra

Solo con añadir la dependencia, Spring Boot expone:

| URL | Contenido |
|---|---|
| `http://localhost:9000/swagger-ui.html` | Interfaz visual interactiva |
| `http://localhost:9000/v3/api-docs` | Especificación JSON OpenAPI |

### Anotaciones para mejorar la documentación

```java
@Tag(name = "Clientes", description = "CRUD completo de clientes del CRM")
@RestController
@RequestMapping("/api/clientes")
public class ClienteRestController {

    @Operation(summary = "Crear nuevo cliente")
    @ApiResponse(responseCode = "201", description = "Cliente creado correctamente")
    @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    @ApiResponse(responseCode = "409", description = "Email ya registrado")
    @PostMapping
    public ResponseEntity<ClienteDTO> crear(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
    }
}
```

---

## 15. Relaciones entre entidades: @ManyToOne

La entidad `Contacto` pertenece a un `Cliente`. Esta es la relación más frecuente en bases de datos relacionales.

### ¿Qué es @ManyToOne?

**"Muchos contactos pueden pertenecer a un único cliente"**:

```
Tabla contactos                   Tabla clientes
──────────────────                ───────────────
id      | cliente_id  ───FK───→  id
nombre  |                         nombre
email   |                         codigoCliente
```

### Definición en código

```java
@Entity
@Table(name = "contactos")
@Data @NoArgsConstructor @AllArgsConstructor
public class Contacto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    private String nombre;

    @NotBlank @Email
    @Column(unique = true)
    private String email;

    @Size(max = 100)
    private String cargo;

    // Muchos Contactos → Un Cliente
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
}
```

### `FetchType.LAZY` vs `FetchType.EAGER`

| FetchType | Comportamiento | Recomendación |
|---|---|---|
| `LAZY` | Spring carga el `Cliente` **solo cuando se accede** a `contacto.getCliente()` | Por defecto en `@ManyToOne` — mejor rendimiento |
| `EAGER` | Spring carga el `Cliente` **siempre** al cargar el `Contacto` | Evitar salvo necesidad explícita |

### El repositorio de la relación

```java
public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    // Spring genera automáticamente: SELECT * FROM contactos WHERE cliente_id = ?
    List<Contacto> findByClienteId(Long clienteId);
}
```

---

## Resumen: Evolución de la arquitectura

| Reto | Capa añadida | Tecnología |
|---|---|---|
| Reto 0 | Repositorio en memoria | `ArrayList` |
| Reto 1 | Persistencia real | JPA + H2 + `import.sql` |
| **Reto 2** | **Capa de presentación web** | **Thymeleaf + MVC** |
| **Reto 3** | **API REST básica** | **`@RestController` + JSON** |
| **Reto 4** | **Capa de servicio + DTOs + Validación + Errores + Swagger + Formularios MVC** | **`@Service` + Bean Validation + `@RestControllerAdvice` + SpringDoc + `th:field`/`th:errors`** |
