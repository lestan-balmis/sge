---
title: Reto 4 - El CRM
description: UD5/UD6 - CRUD completo, DTOs, validaciones, Swagger UI y módulo de Contactos
---

import { Steps, Aside, Tabs, TabItem } from '@astrojs/starlight/components';

## Objetivo

Completar el módulo CRM añadiendo la entidad **Contacto**, convirtiendo el REST de clientes en una **API CRUD completa**, introduciendo **DTOs**, **Bean Validation**, un servicio de negocio y documentación automática con **Swagger UI / OpenAPI**.

**Duración estimada:** 10 h  
**Unidades didácticas:** UD5 / UD6

---

## Qué se construye

| Elemento | Detalle |
|---|---|
| Entidad `Contacto` | `@ManyToOne` con `Cliente` |
| `ClienteDTO` / `ClienteRequestDTO` | Separa API de persistencia |
| `ClienteService` | Lógica de negocio centralizada |
| `ClienteRestController` | CRUD completo + filtro `?tipo=` |
| `GlobalExceptionHandler` | `@RestControllerAdvice` — 404, 400, 409 |
| Swagger UI | SpringDoc `springdoc-openapi-starter-webmvc-ui` |

---

## Paso 1 — Añadir SpringDoc al pom.xml

```xml
<!-- pom.xml — dentro de <dependencies> -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.8</version>
</dependency>
```

Una vez arrancada la aplicación, Swagger UI estará disponible en:  
`http://localhost:9000/swagger-ui.html`

---

## Paso 2 — Entidad Contacto

Un cliente puede tener varios contactos (relación `@ManyToOne`).

```java
@Entity
@Table(name = "contactos")
@Data @NoArgsConstructor @AllArgsConstructor
public class Contacto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String nombre;

    @NotBlank @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotBlank @Email
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Size(max = 20) private String telefono;
    @Size(max = 100) private String cargo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
}
```

El repositorio hereda de `JpaRepository` y añade:

```java
List<Contacto> findByClienteId(Long clienteId);
```

---

## Paso 3 — DTOs

### ¿Por qué usar DTOs?

Con una entidad JPA expuesta directamente en la API (Reto 3) tenemos tres problemas:

1. Los **campos internos** (relaciones lazy, auditoría) se serializan sin control.
2. Cambiar el modelo interno **rompe el contrato** de la API.
3. Las **validaciones de entrada** (`@NotBlank`, `@Email`…) no deberían vivir en la entidad.

El patrón DTO resuelve los tres.

### ClienteDTO (respuesta)

```java
@Data @NoArgsConstructor @AllArgsConstructor
public class ClienteDTO {
    private Long id;
    private String codigoCliente;
    private String nombre;
    private String email;
    private String telefono;
    private TipoCliente tipoCliente;
    private LocalDate fechaAlta;
    private LocalDate fechaModificacion;
}
```

### ClienteRequestDTO (entrada)

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

## Paso 4 — ClienteService

Centraliza la lógica de negocio: búsquedas, validaciones de negocio (email único) y transformación entidad↔DTO.

```java
@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::toDTO).toList();
    }

    public List<ClienteDTO> listarPorTipo(TipoCliente tipo) {
        return clienteRepository.findByTipoCliente(tipo).stream()
                .map(this::toDTO).toList();
    }

    public ClienteDTO buscarPorId(Long id) {
        return toDTO(obtenerEntidad(id));
    }

    public ClienteDTO crear(ClienteRequestDTO request) {
        validarEmailUnico(request.getEmail(), null);
        Cliente cliente = new Cliente();
        aplicarCambios(cliente, request);
        cliente.setFechaAlta(LocalDate.now());
        return toDTO(clienteRepository.save(cliente));
    }

    public ClienteDTO actualizar(Long id, ClienteRequestDTO request) {
        Cliente cliente = obtenerEntidad(id);
        validarEmailUnico(request.getEmail(), id);
        aplicarCambios(cliente, request);
        return toDTO(clienteRepository.save(cliente));
    }

    public ClienteDTO cambiarTipo(Long id, TipoCliente nuevoTipo) {
        Cliente cliente = obtenerEntidad(id);
        cliente.setTipoCliente(nuevoTipo);
        cliente.setFechaModificacion(LocalDate.now());
        return toDTO(clienteRepository.save(cliente));
    }

    public void eliminar(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Cliente", id);
        }
        clienteRepository.deleteById(id);
    }

    // --- helpers ---
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
                c.getEmail(), c.getTelefono(), c.getTipoCliente(),
                c.getFechaAlta(), c.getFechaModificacion());
    }
}
```

---

## Paso 5 — ClienteRestController (CRUD completo)

```java
@Tag(name = "Clientes", description = "CRUD completo de clientes del CRM")
@RestController
@RequestMapping("/api/clientes")
public class ClienteRestController {

    private final ClienteService clienteService;

    // GET /api/clientes               → todos
    // GET /api/clientes?tipo=ACTIVO   → filtrado
    @GetMapping
    public List<ClienteDTO> listar(@RequestParam(required = false) TipoCliente tipo) {
        return tipo != null ? clienteService.listarPorTipo(tipo)
                            : clienteService.listarTodos();
    }

    // GET /api/clientes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ClienteDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    // POST /api/clientes
    @PostMapping
    public ResponseEntity<ClienteDTO> crear(@Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(request));
    }

    // PUT /api/clientes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody ClienteRequestDTO request) {
        return ResponseEntity.ok(clienteService.actualizar(id, request));
    }

    // PATCH /api/clientes/{id}/tipo  → body: { "tipoCliente": "INACTIVO" }
    @PatchMapping("/{id}/tipo")
    public ResponseEntity<ClienteDTO> cambiarTipo(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        TipoCliente nuevoTipo = TipoCliente.valueOf(body.get("tipoCliente"));
        return ResponseEntity.ok(clienteService.cambiarTipo(id, nuevoTipo));
    }

    // DELETE /api/clientes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Paso 6 — Excepciones personalizadas y @RestControllerAdvice

### Excepciones de dominio

```java
// RecursoNoEncontradoException → HTTP 404
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String recurso, Long id) {
        super(recurso + " con id " + id + " no encontrado");
    }
}

// EmailDuplicadoException → HTTP 409
public class EmailDuplicadoException extends RuntimeException {
    public EmailDuplicadoException(String email) {
        super("Ya existe un cliente con el email: " + email);
    }
}
```

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleNoEncontrado(RecursoNoEncontradoException ex) {
        return buildError(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // 400 — Bean Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(fe -> campos.put(fe.getField(), fe.getDefaultMessage()));

        Map<String, Object> body = Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", 400,
            "error", "Datos de entrada inválidos",
            "campos", campos
        );
        return ResponseEntity.badRequest().body(body);
    }

    // 409 — Email duplicado
    @ExceptionHandler(EmailDuplicadoException.class)
    public ResponseEntity<Map<String, Object>> handleEmailDuplicado(EmailDuplicadoException ex) {
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

---

## Pruebas con Postman / curl

### Obtener todos los clientes activos

```http
GET http://localhost:9000/api/clientes?tipo=ACTIVO
```

### Crear un cliente

```http
POST http://localhost:9000/api/clientes
Content-Type: application/json

{
  "codigoCliente": "CLI004",
  "nombre": "Marta Llopis",
  "email": "marta@ejemplo.com",
  "telefono": "655123456",
  "tipoCliente": "PROSPECTO"
}
```

### Cambiar tipo de cliente (PATCH)

```http
PATCH http://localhost:9000/api/clientes/1/tipo
Content-Type: application/json

{ "tipoCliente": "INACTIVO" }
```

### Ejemplo respuesta de error 404

```json
{
  "timestamp": "2025-09-15T10:35:22.123",
  "status": 404,
  "error": "Not Found",
  "mensaje": "Cliente con id 99 no encontrado"
}
```

---

## Swagger UI

Una vez arrancado el servidor, navega a:

```
http://localhost:9000/swagger-ui.html
```

Verás todos los endpoints documentados, con posibilidad de ejecutarlos directamente desde el navegador.

---

## Estructura final del proyecto

```
erpbalmis_4/
└── src/main/java/com/iesdoctorbalmis/spring/
    ├── controller/
    │   ├── rest/
    │   │   ├── ClienteRestController.java   ← CRUD completo + Swagger
    │   │   └── ProductoRestController.java
    │   └── (MVC controllers)
    ├── dto/
    │   ├── ClienteDTO.java                  ← DTO de respuesta
    │   └── ClienteRequestDTO.java           ← DTO de entrada con validaciones
    ├── entity/
    │   ├── Cliente.java
    │   ├── Contacto.java                    ← NUEVO (ManyToOne → Cliente)
    │   ├── Empleado.java
    │   ├── Producto.java
    │   └── TipoCliente.java
    ├── exception/
    │   ├── EmailDuplicadoException.java     ← NUEVO
    │   ├── GlobalExceptionHandler.java      ← NUEVO (@RestControllerAdvice)
    │   └── RecursoNoEncontradoException.java ← NUEVO
    ├── repository/
    │   ├── ClienteRepository.java           ← +findByTipoCliente
    │   ├── ContactoRepository.java          ← NUEVO
    │   └── ...
    └── service/
        └── ClienteService.java              ← NUEVO (lógica de negocio)
```

