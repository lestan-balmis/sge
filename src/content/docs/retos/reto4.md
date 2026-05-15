---
title: Reto 4 - El CRM
description: UD5/UD6 - CRUD completo, DTOs, validaciones, Swagger UI, módulo de Contactos y formularios Thymeleaf de Cliente
---

## Objetivo

Completar el módulo CRM añadiendo la entidad **Contacto**, convirtiendo el REST de clientes en una **API CRUD completa**, introduciendo **DTOs**, **Bean Validation**, un servicio de negocio y documentación automática con **Swagger UI / OpenAPI**. Como novedad respecto a versiones anteriores del plan, también se añaden **formularios Thymeleaf** para el alta, edición y baja de clientes directamente desde el navegador.

**Duración estimada:** 14 h  
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
| `ClienteController` (MVC) | Formularios web: alta, edición, baja con confirmación |
| `clientes/formulario.html` | Formulario reutilizable con `th:field` y `th:errors` |
| `clientes/eliminar.html` | Página de confirmación de baja |

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

> **Concepto:** El patrón DTO y sus ventajas se explican en [UD5 — sección 10](/sge/spring/ud5#10-el-patrón-dto).

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

## Paso 7 — Formularios MVC de Cliente (`ClienteController`)

Hasta ahora el CRM solo era accesible desde Postman o Swagger. En este paso convertimos `ClienteController` en un controlador MVC completo con formularios HTML para que cualquier usuario pueda dar de alta, editar o eliminar clientes desde el navegador.

> **Clave arquitectónica:** `ClienteController` (MVC) y `ClienteRestController` (REST) **comparten el mismo `ClienteService`** y el mismo `ClienteRequestDTO`. La lógica de negocio y las validaciones solo están escritas una vez.

### Comparativa: antes y después

| Aspecto | Antes (Reto 3) | Ahora (Reto 4) |
|---|---|---|
| `ClienteController` | Solo `GET /clientes` → lista | CRUD completo con formularios |
| Inyección | `ClienteRepository` | `ClienteService` |
| Escritura de datos | Solo por Postman/Swagger | También desde el navegador |
| Validaciones MVC | Ninguna | `@Valid` + `BindingResult` |
| Mensajes tras acción | Ninguno | Flash con `RedirectAttributes` |

### `ClienteController.java` actualizado

```java
@Controller
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // ── Listado ──────────────────────────────────────────────────────

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("clientes", clienteService.listarTodos());
        return "clientes/lista";
    }

    // ── Alta ─────────────────────────────────────────────────────────

    @GetMapping("/nuevo")
    public String formularioNuevo(Model model) {
        model.addAttribute("clienteForm", new ClienteRequestDTO());
        model.addAttribute("modoEdicion", false);
        model.addAttribute("tiposCliente", TipoCliente.values());
        return "clientes/formulario";
    }

    @PostMapping("/nuevo")
    public String guardarNuevo(
            @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
            BindingResult br,
            Model model,
            RedirectAttributes ra) {

        if (br.hasErrors()) {
            model.addAttribute("modoEdicion", false);
            model.addAttribute("tiposCliente", TipoCliente.values());
            return "clientes/formulario";
        }
        try {
            clienteService.crear(form);
            ra.addFlashAttribute("mensajeExito", "Cliente '" + form.getNombre() + "' creado correctamente.");
        } catch (EmailDuplicadoException e) {
            br.rejectValue("email", "email.duplicado", e.getMessage());
            model.addAttribute("modoEdicion", false);
            model.addAttribute("tiposCliente", TipoCliente.values());
            return "clientes/formulario";
        }
        return "redirect:/clientes";
    }

    // ── Edición ───────────────────────────────────────────────────────

    @GetMapping("/{id}/editar")
    public String formularioEditar(@PathVariable Long id, Model model) {
        ClienteDTO cliente = clienteService.buscarPorId(id);
        ClienteRequestDTO form = new ClienteRequestDTO();
        form.setCodigoCliente(cliente.getCodigoCliente());
        form.setNombre(cliente.getNombre());
        form.setEmail(cliente.getEmail());
        form.setTelefono(cliente.getTelefono());
        form.setTipoCliente(cliente.getTipoCliente());
        model.addAttribute("clienteForm", form);
        model.addAttribute("clienteId", id);
        model.addAttribute("modoEdicion", true);
        model.addAttribute("tiposCliente", TipoCliente.values());
        return "clientes/formulario";
    }

    @PostMapping("/{id}/editar")
    public String guardarEdicion(
            @PathVariable Long id,
            @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
            BindingResult br,
            Model model,
            RedirectAttributes ra) {

        if (br.hasErrors()) {
            model.addAttribute("clienteId", id);
            model.addAttribute("modoEdicion", true);
            model.addAttribute("tiposCliente", TipoCliente.values());
            return "clientes/formulario";
        }
        try {
            clienteService.actualizar(id, form);
            ra.addFlashAttribute("mensajeExito", "Cliente '" + form.getNombre() + "' actualizado correctamente.");
        } catch (EmailDuplicadoException e) {
            br.rejectValue("email", "email.duplicado", e.getMessage());
            model.addAttribute("clienteId", id);
            model.addAttribute("modoEdicion", true);
            model.addAttribute("tiposCliente", TipoCliente.values());
            return "clientes/formulario";
        }
        return "redirect:/clientes";
    }

    // ── Baja ──────────────────────────────────────────────────────────

    @GetMapping("/{id}/eliminar")
    public String confirmarEliminar(@PathVariable Long id, Model model) {
        model.addAttribute("cliente", clienteService.buscarPorId(id));
        return "clientes/eliminar";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Long id, RedirectAttributes ra) {
        ClienteDTO cliente = clienteService.buscarPorId(id);
        clienteService.eliminar(id);
        ra.addFlashAttribute("mensajeExito", "Cliente '" + cliente.getNombre() + "' eliminado correctamente.");
        return "redirect:/clientes";
    }
}
```

### Conceptos clave de formularios MVC

#### `@Valid` + `BindingResult`

Cuando Spring recibe un `POST` con datos de formulario, los vincula al DTO y ejecuta las validaciones de Bean Validation. Si hay errores, `BindingResult` los acumula. **El `BindingResult` debe ir inmediatamente después del objeto que se valida**, de lo contrario Spring lanza una excepción en lugar de capturar los errores.

```java
// ✅ Correcto: BindingResult justo después del @Valid
public String guardarNuevo(
        @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
        BindingResult br,   // ← inmediatamente después
        Model model, ...) { ... }

// ❌ Incorrecto: Spring lanzará MethodArgumentNotValidException
public String guardarNuevo(
        @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
        Model model,
        BindingResult br, ...) { ... }
```

#### `RedirectAttributes` y el patrón POST-Redirect-GET

Tras un POST exitoso siempre redirigimos (`redirect:/clientes`) para evitar el reenvío del formulario al recargar la página. `RedirectAttributes.addFlashAttribute()` almacena el mensaje en sesión hasta la siguiente petición GET:

```java
ra.addFlashAttribute("mensajeExito", "Cliente creado correctamente.");
return "redirect:/clientes";  // → browser hace GET /clientes
// En la siguiente petición, ${mensajeExito} está disponible en el Model
```

#### `rejectValue` para errores de negocio

Cuando una regla de negocio falla (email duplicado), en vez de lanzar la excepción hacia el usuario añadimos el error al campo correspondiente de `BindingResult`:

```java
} catch (EmailDuplicadoException e) {
    br.rejectValue("email", "email.duplicado", e.getMessage());
    return "clientes/formulario";  // redibujamos el formulario con el error
}
```

### `clientes/formulario.html`

Plantilla **reutilizable** para alta y edición. La acción del formulario y el título cambian dinámicamente según `${modoEdicion}`.

```html
<form th:action="${modoEdicion}
        ? @{/clientes/{id}/editar(id=${clienteId})}
        : @{/clientes/nuevo}"
      th:object="${clienteForm}"
      method="post" novalidate>

  <!-- Ejemplo de campo con validación inline -->
  <div class="col-md-8">
    <label class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
    <input type="text" class="form-control"
           th:field="*{nombre}"
           th:classappend="${#fields.hasErrors('nombre')} ? ' is-invalid'"
           placeholder="Nombre completo o razón social" />
    <div class="invalid-feedback" th:errors="*{nombre}">Error en el nombre.</div>
  </div>

  <!-- Select para enum -->
  <div class="col-md-3">
    <label class="form-label fw-semibold">Tipo <span class="text-danger">*</span></label>
    <select class="form-select" th:field="*{tipoCliente}"
            th:classappend="${#fields.hasErrors('tipoCliente')} ? ' is-invalid'">
      <option value="">-- Selecciona --</option>
      <option th:each="tipo : ${tiposCliente}"
              th:value="${tipo}" th:text="${tipo}"></option>
    </select>
    <div class="invalid-feedback" th:errors="*{tipoCliente}">Error en el tipo.</div>
  </div>

  <button type="submit" class="btn btn-primary"
          th:text="${modoEdicion} ? 'Guardar cambios' : 'Crear cliente'">Guardar</button>
  <a th:href="@{/clientes}" class="btn btn-outline-secondary">Cancelar</a>
</form>
```

**Expresiones Thymeleaf usadas:**

| Expresión | Significado |
|---|---|
| `th:object="${clienteForm}"` | Vincula el formulario al DTO del modelo |
| `th:field="*{nombre}"` | Genera `id`, `name` y `value` desde el campo del DTO |
| `th:errors="*{nombre}"` | Muestra los mensajes de error de Bean Validation |
| `#fields.hasErrors('nombre')` | Devuelve `true` si el campo tiene errores (para añadir `is-invalid`) |
| `th:each="tipo : ${tiposCliente}"` | Itera los valores del enum `TipoCliente` |

### `clientes/lista.html` — botón Nuevo y columna Acciones

```html
<!-- Botón Nuevo en la cabecera -->
<a th:href="@{/clientes/nuevo}" class="btn btn-primary btn-sm">+ Nuevo cliente</a>

<!-- Mensaje flash de éxito -->
<div th:if="${mensajeExito}" class="alert alert-success alert-dismissible fade show">
  <span th:text="${mensajeExito}"></span>
  <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>

<!-- Columna Acciones en cada fila -->
<td class="text-end">
  <a th:href="@{/clientes/{id}/editar(id=${cliente.id})}"
     class="btn btn-outline-primary btn-sm">Editar</a>
  <a th:href="@{/clientes/{id}/eliminar(id=${cliente.id})}"
     class="btn btn-outline-danger btn-sm">Eliminar</a>
</td>
```

### `clientes/eliminar.html` — confirmación de baja

```html
<!-- Muestra los datos del cliente y pide confirmación -->
<div class="alert alert-warning">
  ¿Estás seguro de que quieres eliminar el cliente
  <strong th:text="${cliente.nombre}"></strong>?
</div>

<!-- Formulario POST de confirmación -->
<form th:action="@{/clientes/{id}/eliminar(id=${cliente.id})}" method="post">
  <button type="submit" class="btn btn-danger">Sí, eliminar</button>
  <a th:href="@{/clientes}" class="btn btn-outline-secondary">Cancelar</a>
</form>
```

> La baja usa un formulario `POST` (no un simple `<a href>`). Esto sigue el estándar REST: las operaciones que modifican estado deben usar verbos HTTP distintos de `GET`. Un enlace `GET /clientes/1/eliminar` podría ser ejecutado por un rastreador web o un prefetch del navegador.

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
├── src/main/java/com/iesdoctorbalmis/spring/
│   ├── controller/
│   │   ├── rest/
│   │   │   ├── ClienteRestController.java   ← CRUD completo + Swagger
│   │   │   └── ProductoRestController.java
│   │   ├── ClienteController.java           ← NUEVO: CRUD MVC con formularios
│   │   ├── EmpleadoController.java
│   │   ├── HomeController.java
│   │   └── ProductoController.java
│   ├── dto/
│   │   ├── ClienteDTO.java                  ← DTO de respuesta
│   │   └── ClienteRequestDTO.java           ← DTO de entrada (compartido REST + MVC)
│   ├── entity/
│   │   ├── Cliente.java
│   │   ├── Contacto.java                    ← NUEVO (ManyToOne → Cliente)
│   │   ├── Empleado.java
│   │   ├── Producto.java
│   │   └── TipoCliente.java
│   ├── exception/
│   │   ├── EmailDuplicadoException.java     ← NUEVO
│   │   ├── GlobalExceptionHandler.java      ← NUEVO (@RestControllerAdvice)
│   │   └── RecursoNoEncontradoException.java ← NUEVO
│   ├── repository/
│   │   ├── ClienteRepository.java           ← +findByTipoCliente
│   │   ├── ContactoRepository.java          ← NUEVO
│   │   └── ...
│   └── service/
│       └── ClienteService.java              ← NUEVO (lógica de negocio)
└── src/main/resources/templates/
    ├── clientes/
    │   ├── lista.html                       ← actualizado: botones Nuevo/Editar/Eliminar
    │   ├── formulario.html                  ← NUEVO: alta y edición (reutilizable)
    │   └── eliminar.html                    ← NUEVO: confirmación de baja
    ├── empleados/
    │   └── lista.html
    ├── productos/
    │   └── lista.html
    ├── fragments/
    │   └── layout.html
    └── index.html
```

