---
title: "UD5c: DTOs, Validación y Arquitectura por Capas"
description: DTOs, Bean Validation, capa de servicio, manejo de excepciones, OpenAPI y relaciones JPA. Base teórica para el Reto 4.
---

> **Herramientas:** Bean Validation, SpringDoc OpenAPI, JPA  
> **Prerequisito:** [UD5b — De MVC a REST](/sge/spring/ud5b)  
> **Objetivo:** Aplicar arquitectura por capas con DTOs, validación de entrada, gestión centralizada de errores y documentación de la API.

---

## Índice

10. [El patrón DTO](#10-el-patrón-dto)
11. [Bean Validation: Validar la entrada](#11-bean-validation-validar-la-entrada)
12. [La capa de Servicio (@Service)](#12-la-capa-de-servicio-service)
13. [Excepciones personalizadas y @RestControllerAdvice](#13-excepciones-personalizadas-y-restcontrolleradvice)
14. [OpenAPI / Swagger UI con SpringDoc](#14-openapi--swagger-ui-con-springdoc)
15. [Relaciones entre entidades: @ManyToOne](#15-relaciones-entre-entidades-manytoone)

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
