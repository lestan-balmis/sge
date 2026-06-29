---
title: "UD7 — Cierre del ERP Balmis"
description: Módulo de Compras con Proveedores y Órdenes de Compra (Reto 7), Dashboard de KPIs y módulo RRHH de Empleados (Reto Final). Unidad teórica de cierre del proyecto integrador.
---

### UD7 — Cierre del ERP Balmis
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 12 horas (Reto 7: 6h · Reto Final: 6h)  
> **Herramientas:** Spring MVC, Thymeleaf, Spring Data JPA, Swagger/OpenAPI  
> **Prerequisito:** [UD6 — Formularios Web con Thymeleaf](/sge/spring/ud6)  
> **Objetivo:** Completar el ciclo de negocio del ERP Balmis añadiendo el módulo de Compras (proveedores y órdenes), el Dashboard de KPIs y el módulo RRHH de empleados.

---

## Índice

1. [El módulo de Compras: Proveedores y Órdenes](#1-el-módulo-de-compras-proveedores-y-órdenes)
2. [Entidad Proveedor — campos y diseño](#2-entidad-proveedor--campos-y-diseño)
3. [ProveedorService — CRUD con validación de email](#3-proveedorservice--crud-con-validación-de-email)
4. [ProveedorController — CRUD completo MVC](#4-proveedorcontroller--crud-completo-mvc)
5. [Entidad OrdenCompra y LineaOrdenCompra](#5-entidad-ordencompra-y-lineaordencompra)
6. [OrdenCompraService — creación y recepción con stock](#6-ordencompraservice--creación-y-recepción-con-stock)
7. [OrdenCompraController — vista de lista y botón Recibir](#7-ordencompracontroller--vista-de-lista-y-botón-recibir)
8. [API REST de Compras — ProveedorRestController y OrdenCompraRestController](#8-api-rest-de-compras)
9. [🎯 PAUSA: Aquí puedes completar el **Reto 7**](#9--pausa-aquí-puedes-completar-el-reto-7)
10. [Dashboard de KPIs — DashboardService y DashboardController](#10-dashboard-de-kpis)
11. [Módulo RRHH — Empleado vinculado a Usuario](#11-módulo-rrhh--empleado-vinculado-a-usuario)
12. [EmpleadoService — CRUD con usuario opcional](#12-empleadoservice--crud-con-usuario-opcional)
13. [EmpleadoController — CRUD completo MVC con detalle](#13-empleadocontroller--crud-completo-mvc-con-detalle)
14. [Navbar reutilizable y fragmento de layout](#14-navbar-reutilizable-y-fragmento-de-layout)
15. [🎯 PAUSA: Aquí puedes completar el **Reto 8 Final**](#15--pausa-aquí-puedes-completar-el-reto-8-final)

---

## 1. El módulo de Compras: Proveedores y Órdenes

El módulo de Compras cierra el ciclo de negocio del ERP Balmis. Si en el Reto 5 gestionamos las **salidas** de stock (pedidos de clientes), ahora gestionamos las **entradas**: órdenes de compra a proveedores.

### Flujo de negocio del módulo Compras

```
Proveedor  →  Orden de Compra (PENDIENTE)  →  Recepción (RECIBIDA)  →  +Stock productos
```

| Concepto | Descripción |
|---|---|
| `Proveedor` | Empresa o autónomo que suministra productos |
| `OrdenCompra` | Solicitud de compra a un proveedor con líneas de productos |
| `LineaOrdenCompra` | Producto + cantidad + precio unitario de una orden |
| `EstadoOrdenCompra` | `PENDIENTE`, `RECIBIDA`, `CANCELADA` |

### Comparación con Axelor

| Axelor | ERP Balmis |
|---|---|
| Módulo Compras → Proveedores (formulario automático) | `ProveedorController` + `proveedores/formulario.html` |
| Módulo Compras → Órdenes de Compra | `OrdenCompraController` + `ordenes/lista.html` |
| Botón "Validar" en la orden → actualiza stock | `POST /ordenes-compra/{id}/recibir` → `OrdenCompraService.recibirOrden()` |

---

## 2. Entidad Proveedor — campos y diseño

La entidad `Proveedor` es análoga a `Cliente` pero representa al lado de la oferta:

```java
@Entity
@Table(name = "proveedores")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigoProveedor;    // "PROV001"

    @Column(nullable = false)
    private String nombre;             // Razón social

    @Column(nullable = false, unique = true)
    private String email;

    private String telefono;
    private String direccion;
    private String personaContacto;

    private LocalDate fechaAlta;
    private LocalDate fechaModificacion;
    private Boolean activo;

    // getters/setters
}
```

### ProveedorRequestDTO — formulario y API

```java
public class ProveedorRequestDTO {

    @NotBlank(message = "El código de proveedor es obligatorio")
    private String codigoProveedor;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    private String telefono;
    private String direccion;
    private String personaContacto;

    // getters/setters
}
```

### ProveedorDTO — respuesta de lectura (record)

```java
public record ProveedorDTO(
    Long id,
    String codigoProveedor,
    String nombre,
    String email,
    String telefono,
    String direccion,
    String personaContacto,
    LocalDate fechaAlta,
    LocalDate fechaModificacion,
    Boolean activo
) {}
```

---

## 3. ProveedorService — CRUD con validación de email

`ProveedorService` sigue el mismo patrón que `ClienteService`: CRUD completo con validación de email único y mapeo a DTO.

```java
@Service
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    // ── Consultas ────────────────────────────────────────────────────────────

    public List<ProveedorDTO> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(this::toDTO).toList();
    }

    public ProveedorDTO buscarPorId(Long id) {
        return toDTO(obtenerEntidad(id));
    }

    // ── Escritura ─────────────────────────────────────────────────────────────

    @Transactional
    public ProveedorDTO crear(ProveedorRequestDTO request) {
        validarEmailUnico(request.getEmail(), null);
        Proveedor proveedor = new Proveedor();
        aplicarCambios(proveedor, request);
        proveedor.setFechaAlta(LocalDate.now());
        proveedor.setActivo(true);
        return toDTO(proveedorRepository.save(proveedor));
    }

    @Transactional
    public ProveedorDTO actualizar(Long id, ProveedorRequestDTO request) {
        Proveedor proveedor = obtenerEntidad(id);
        validarEmailUnico(request.getEmail(), id);
        aplicarCambios(proveedor, request);
        return toDTO(proveedorRepository.save(proveedor));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!proveedorRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Proveedor", id);
        }
        proveedorRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validarEmailUnico(String email, Long idActual) {
        proveedorRepository.findByEmail(email).ifPresent(existente -> {
            if (!existente.getId().equals(idActual)) {
                throw new EmailDuplicadoException(email);
            }
        });
    }

    private void aplicarCambios(Proveedor p, ProveedorRequestDTO r) {
        p.setCodigoProveedor(r.getCodigoProveedor());
        p.setNombre(r.getNombre());
        p.setEmail(r.getEmail());
        p.setTelefono(r.getTelefono());
        p.setDireccion(r.getDireccion());
        p.setPersonaContacto(r.getPersonaContacto());
        p.setFechaModificacion(LocalDate.now());
    }

    private ProveedorDTO toDTO(Proveedor p) {
        return new ProveedorDTO(p.getId(), p.getCodigoProveedor(), p.getNombre(),
                p.getEmail(), p.getTelefono(), p.getDireccion(),
                p.getPersonaContacto(), p.getFechaAlta(),
                p.getFechaModificacion(), p.getActivo());
    }
}
```

> **Reutilización del patrón:** `ProveedorService` es estructuralmente idéntico a `ClienteService`. Una vez aprendido el patrón en el Reto 4, replicarlo para Proveedores es mecánico: cambiar el nombre de la entidad, el repositorio y los campos.

---

## 4. ProveedorController — CRUD completo MVC

`ProveedorController` implementa el CRUD de siete endpoints que ya conoces de `ClienteController`. La novedad es que en la página de eliminación usamos una plantilla específica `confirmar-eliminar.html` en lugar de la plantilla `eliminar.html`, ambas válidas:

```java
@Controller
@RequestMapping("/proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    // ── Listado ──────────────────────────────────────────────────────────────

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("proveedores", proveedorService.listarTodos());
        return "proveedores/lista";
    }

    // ── Alta ─────────────────────────────────────────────────────────────────

    @GetMapping("/nuevo")
    public String formularioNuevo(Model model) {
        model.addAttribute("proveedorForm", new ProveedorRequestDTO());
        model.addAttribute("modoEdicion", false);
        return "proveedores/formulario";
    }

    @PostMapping("/nuevo")
    public String guardarNuevo(
            @Valid @ModelAttribute("proveedorForm") ProveedorRequestDTO form,
            BindingResult br, Model model, RedirectAttributes ra) {

        if (br.hasErrors()) {
            model.addAttribute("modoEdicion", false);
            return "proveedores/formulario";
        }
        try {
            proveedorService.crear(form);
            ra.addFlashAttribute("mensajeExito",
                    "Proveedor '" + form.getNombre() + "' creado correctamente.");
        } catch (EmailDuplicadoException e) {
            br.rejectValue("email", "email.duplicado", e.getMessage());
            model.addAttribute("modoEdicion", false);
            return "proveedores/formulario";
        }
        return "redirect:/proveedores";
    }

    // ── Edición ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}/editar")
    public String formularioEditar(@PathVariable Long id, Model model) {
        ProveedorDTO prov = proveedorService.buscarPorId(id);
        ProveedorRequestDTO form = new ProveedorRequestDTO();
        form.setCodigoProveedor(prov.codigoProveedor());
        form.setNombre(prov.nombre());
        form.setEmail(prov.email());
        form.setTelefono(prov.telefono());
        form.setDireccion(prov.direccion());
        form.setPersonaContacto(prov.personaContacto());
        model.addAttribute("proveedorForm", form);
        model.addAttribute("proveedorId", id);
        model.addAttribute("modoEdicion", true);
        return "proveedores/formulario";
    }

    @PostMapping("/{id}/editar")
    public String guardarEdicion(
            @PathVariable Long id,
            @Valid @ModelAttribute("proveedorForm") ProveedorRequestDTO form,
            BindingResult br, Model model, RedirectAttributes ra) {

        if (br.hasErrors()) {
            model.addAttribute("proveedorId", id);
            model.addAttribute("modoEdicion", true);
            return "proveedores/formulario";
        }
        try {
            proveedorService.actualizar(id, form);
            ra.addFlashAttribute("mensajeExito",
                    "Proveedor '" + form.getNombre() + "' actualizado correctamente.");
        } catch (EmailDuplicadoException e) {
            br.rejectValue("email", "email.duplicado", e.getMessage());
            model.addAttribute("proveedorId", id);
            model.addAttribute("modoEdicion", true);
            return "proveedores/formulario";
        }
        return "redirect:/proveedores";
    }

    // ── Baja ──────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/eliminar")
    public String confirmarEliminar(@PathVariable Long id, Model model) {
        model.addAttribute("proveedor", proveedorService.buscarPorId(id));
        return "proveedores/confirmar-eliminar";
    }

    @PostMapping("/{id}/eliminar")
    public String ejecutarEliminar(@PathVariable Long id, RedirectAttributes ra) {
        String nombre = proveedorService.buscarPorId(id).nombre();
        proveedorService.eliminar(id);
        ra.addFlashAttribute("mensajeExito",
                "Proveedor '" + nombre + "' eliminado correctamente.");
        return "redirect:/proveedores";
    }
}
```

### Plantilla de lista de proveedores con `sec:authorize`

```html
<!-- proveedores/lista.html (fragmento clave) -->
<tr th:each="prov : ${proveedores}">
    <td th:text="${prov.codigoProveedor()}"></td>
    <td th:text="${prov.nombre()}"></td>
    <td th:text="${prov.email()}"></td>
    <td th:text="${prov.telefono() != null ? prov.telefono() : '—'}"></td>
    <td th:text="${prov.personaContacto() != null ? prov.personaContacto() : '—'}"></td>
    <td>
        <span class="badge"
              th:classappend="${prov.activo()} ? 'bg-success' : 'bg-secondary'"
              th:text="${prov.activo()} ? 'Activo' : 'Inactivo'"></span>
    </td>
    <td class="text-end">
        <a th:href="@{/proveedores/{id}/editar(id=${prov.id()})}"
           class="btn btn-outline-primary btn-sm"
           sec:authorize="hasAnyRole('ADMIN','MANAGER')">Editar</a>
        <a th:href="@{/proveedores/{id}/eliminar(id=${prov.id()})}"
           class="btn btn-outline-danger btn-sm"
           sec:authorize="hasRole('ADMIN')">Eliminar</a>
    </td>
</tr>
```

> Los botones de acción utilizan `sec:authorize` exactamente igual que en el Reto 6: el rol `ADMIN` puede eliminar, y `ADMIN`/`MANAGER` pueden editar y crear.

---

## 5. Entidad OrdenCompra y LineaOrdenCompra

La relación entre `OrdenCompra` y `LineaOrdenCompra` es `OneToMany` con cascade, igual que la relación entre `Pedido` y `LineaPedido` del Reto 5.

```java
@Entity
@Table(name = "ordenes_compra")
public class OrdenCompra {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroOrden;        // "OC-20260610-001"

    @Column(nullable = false)
    private LocalDate fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoOrdenCompra estado;  // PENDIENTE, RECIBIDA, CANCELADA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @OneToMany(mappedBy = "ordenCompra",
               cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LineaOrdenCompra> lineas = new ArrayList<>();

    private BigDecimal total;
    private LocalDate fechaRecepcion;  // se rellena al recibir la orden
    private String notas;

    // getters/setters
}

@Entity
@Table(name = "lineas_orden_compra")
public class LineaOrdenCompra {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // getters/setters
}
```

### Enum EstadoOrdenCompra

```java
public enum EstadoOrdenCompra {
    PENDIENTE,   // recién creada, esperando entrega del proveedor
    RECIBIDA,    // mercancía recibida, stock actualizado
    CANCELADA    // cancelada, no modifica stock
}
```

---

## 6. OrdenCompraService — creación y recepción con stock

La lógica más importante del módulo Compras está en `recibirOrden()`: al marcar una orden como `RECIBIDA`, el servicio incrementa el stock de cada producto de las líneas. Esta es la operación simétrica al decremento de stock que se produce al confirmar un pedido de venta.

```java
@Service
@Transactional(readOnly = true)
public class OrdenCompraService {

    private final OrdenCompraRepository ordenCompraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;

    // ── Consultas ────────────────────────────────────────────────────────────

    public List<OrdenCompraDTO> listarTodas() {
        return ordenCompraRepository.findAll().stream()
                .map(this::toDTO).toList();
    }

    public OrdenCompraDTO buscarPorId(Long id) {
        return toDTO(obtenerEntidad(id));
    }

    // ── Crear orden (estado PENDIENTE) ────────────────────────────────────────

    @Transactional
    public OrdenCompraDTO crear(OrdenCompraRequestDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(dto.proveedorId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor", dto.proveedorId()));

        OrdenCompra orden = new OrdenCompra();
        orden.setNumeroOrden(generarNumeroOrden());  // "OC-YYYYMMDD-NNN"
        orden.setFecha(LocalDate.now());
        orden.setEstado(EstadoOrdenCompra.PENDIENTE);
        orden.setProveedor(proveedor);
        orden.setNotas(dto.notas());

        BigDecimal total = BigDecimal.ZERO;
        for (var lineaDto : dto.lineas()) {
            Producto producto = productoRepository.findById(lineaDto.productoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto", lineaDto.productoId()));

            LineaOrdenCompra linea = new LineaOrdenCompra();
            linea.setOrdenCompra(orden);
            linea.setProducto(producto);
            linea.setCantidad(lineaDto.cantidad());
            linea.setPrecioUnitario(lineaDto.precioUnitario());
            BigDecimal subtotal = lineaDto.precioUnitario()
                    .multiply(BigDecimal.valueOf(lineaDto.cantidad()));
            linea.setSubtotal(subtotal);
            orden.getLineas().add(linea);
            total = total.add(subtotal);
        }
        orden.setTotal(total);
        return toDTO(ordenCompraRepository.save(orden));
    }

    // ── Marcar como RECIBIDA: incrementa stock ─────────────────────────────────

    @Transactional
    public OrdenCompraDTO recibirOrden(Long id) {
        OrdenCompra orden = obtenerEntidad(id);

        // HTTP 409 si la orden ya está cancelada o ya fue recibida
        if (orden.getEstado() == EstadoOrdenCompra.CANCELADA) {
            throw new OrdenCanceladaException(id);
        }
        if (orden.getEstado() == EstadoOrdenCompra.RECIBIDA) {
            throw new OrdenCanceladaException(
                    "La orden " + orden.getNumeroOrden() + " ya fue recibida.");
        }

        // Incrementar stock de cada producto en las líneas
        for (LineaOrdenCompra linea : orden.getLineas()) {
            Producto producto = linea.getProducto();
            producto.setStock(producto.getStock() + linea.getCantidad());
            productoRepository.save(producto);
        }

        orden.setEstado(EstadoOrdenCompra.RECIBIDA);
        orden.setFechaRecepcion(LocalDate.now());
        return toDTO(ordenCompraRepository.save(orden));
    }

    // ── Generación de número de orden ─────────────────────────────────────────

    private String generarNumeroOrden() {
        String hoy = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String ultimo = ordenCompraRepository.findMaxNumeroOrdenByFecha(hoy);
        int seq = (ultimo != null)
                ? Integer.parseInt(ultimo.split("-")[2]) + 1
                : 1;
        return String.format("OC-%s-%03d", hoy, seq);
    }
}
```

### Simetría entre Ventas y Compras

| Operación | Módulo Ventas (Reto 5) | Módulo Compras (Reto 7) |
|---|---|---|
| Creación | `PedidoService.crear()` → BORRADOR | `OrdenCompraService.crear()` → PENDIENTE |
| Confirmación | `confirmarPedido()` → **decrementa** stock | `recibirOrden()` → **incrementa** stock |
| Validación stock | HTTP 422 si stock insuficiente | HTTP 409 si ya cancelada/recibida |
| Número autogenerado | `PED-NNN` | `OC-YYYYMMDD-NNN` |

---

## 7. OrdenCompraController — vista de lista y botón Recibir

`OrdenCompraController` solo necesita dos endpoints: uno para listar y otro para marcar como recibida. La creación de órdenes se delega a la API REST (para que sea Swagger/Postman quien las cree en la demo).

```java
@Controller
@RequestMapping("/ordenes-compra")
public class OrdenCompraController {

    private final OrdenCompraService ordenCompraService;

    // ── Listado ──────────────────────────────────────────────────────────────

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("ordenes", ordenCompraService.listarTodas());
        return "ordenes/lista";
    }

    // ── Marcar como recibida ──────────────────────────────────────────────────

    @PostMapping("/{id}/recibir")
    public String recibirOrden(@PathVariable Long id, RedirectAttributes ra) {
        try {
            ordenCompraService.recibirOrden(id);
            ra.addFlashAttribute("mensajeExito",
                    "Orden marcada como RECIBIDA. Stock actualizado.");
        } catch (OrdenCanceladaException e) {
            ra.addFlashAttribute("mensajeError", e.getMessage());
        }
        return "redirect:/ordenes-compra";
    }
}
```

### Plantilla `ordenes/lista.html` — botón Recibir condicionado

El botón "Recibir" solo aparece si el estado es `PENDIENTE` **y** el usuario tiene rol `ADMIN` o `MANAGER`. Para las órdenes ya procesadas, se muestra un texto "Sin acciones":

```html
<!-- ordenes/lista.html (fragmento de la columna Acciones) -->
<td class="text-end">
    <!-- Botón visible solo para PENDIENTE y con rol ADMIN/MANAGER -->
    <form th:if="${orden.estado().name() == 'PENDIENTE'}"
          th:action="@{/ordenes-compra/{id}/recibir(id=${orden.id()})}"
          method="post"
          class="d-inline"
          sec:authorize="hasAnyRole('ADMIN','MANAGER')">
        <button type="submit"
                class="btn btn-success btn-sm"
                onclick="return confirm('¿Marcar esta orden como recibida? Se actualizará el stock.')">
            Recibir
        </button>
    </form>
    <span th:if="${orden.estado().name() != 'PENDIENTE'}"
          class="text-muted small">Sin acciones</span>
</td>
```

### Coloreado de estados con `th:classappend`

```html
<span class="badge"
      th:classappend="${orden.estado().name() == 'PENDIENTE'} ? 'bg-warning text-dark'
                   : (${orden.estado().name() == 'RECIBIDA'} ? 'bg-success' : 'bg-secondary')"
      th:text="${orden.estado()}"></span>
```

---

## 8. API REST de Compras

### ProveedorRestController — CRUD completo con Swagger

```java
@Tag(name = "Proveedores", description = "CRUD completo de proveedores — Módulo Compras")
@RestController
@RequestMapping("/api/proveedores")
public class ProveedorRestController {

    // GET /api/proveedores
    @Operation(summary = "Listar proveedores")
    @GetMapping
    public List<ProveedorDTO> listar() {
        return proveedorService.listarTodos();
    }

    // GET /api/proveedores/{id}
    @Operation(summary = "Obtener proveedor por ID")
    @ApiResponse(responseCode = "404", description = "Proveedor no encontrado")
    @GetMapping("/{id}")
    public ResponseEntity<ProveedorDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.buscarPorId(id));
    }

    // POST /api/proveedores
    @Operation(summary = "Crear nuevo proveedor")
    @ApiResponse(responseCode = "201", description = "Proveedor creado")
    @ApiResponse(responseCode = "409", description = "Email ya registrado")
    @PostMapping
    public ResponseEntity<ProveedorDTO> crear(
            @Valid @RequestBody ProveedorRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proveedorService.crear(request));
    }

    // PUT /api/proveedores/{id}
    @Operation(summary = "Actualizar proveedor completo")
    @PutMapping("/{id}")
    public ResponseEntity<ProveedorDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequestDTO request) {
        return ResponseEntity.ok(proveedorService.actualizar(id, request));
    }

    // DELETE /api/proveedores/{id}
    @Operation(summary = "Eliminar proveedor")
    @ApiResponse(responseCode = "204", description = "Proveedor eliminado")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

### OrdenCompraRestController — crear y marcar como recibida

```java
@Tag(name = "Órdenes de Compra", description = "Gestión de órdenes de compra")
@RestController
@RequestMapping("/api/ordenes-compra")
public class OrdenCompraRestController {

    // GET /api/ordenes-compra
    @Operation(summary = "Listar órdenes de compra")
    @GetMapping
    public List<OrdenCompraDTO> listar() {
        return ordenCompraService.listarTodas();
    }

    // GET /api/ordenes-compra/{id}
    @Operation(summary = "Obtener orden por ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrdenCompraDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ordenCompraService.buscarPorId(id));
    }

    // POST /api/ordenes-compra
    @Operation(summary = "Crear nueva orden de compra",
               description = "Crea una orden en estado PENDIENTE con sus líneas")
    @ApiResponse(responseCode = "201", description = "Orden creada")
    @PostMapping
    public ResponseEntity<OrdenCompraDTO> crear(
            @Valid @RequestBody OrdenCompraRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ordenCompraService.crear(request));
    }

    // PATCH /api/ordenes-compra/{id}/recibir
    @Operation(summary = "Marcar orden como RECIBIDA",
               description = "Cambia estado a RECIBIDA e incrementa stock. HTTP 409 si ya cancelada.")
    @ApiResponse(responseCode = "200", description = "Orden recibida, stock actualizado")
    @ApiResponse(responseCode = "409", description = "Orden ya cancelada o ya recibida")
    @PatchMapping("/{id}/recibir")
    public ResponseEntity<OrdenCompraDTO> recibirOrden(@PathVariable Long id) {
        return ResponseEntity.ok(ordenCompraService.recibirOrden(id));
    }
}
```

### OrdenCompraRequestDTO

```java
public record OrdenCompraRequestDTO(
    @NotNull Long proveedorId,
    @NotEmpty List<LineaOrdenCompraRequestDTO> lineas,
    String notas
) {
    public record LineaOrdenCompraRequestDTO(
        @NotNull Long productoId,
        @NotNull @Min(1) Integer cantidad,
        @NotNull @DecimalMin("0.01") BigDecimal precioUnitario
    ) {}
}
```

### Prueba con Postman — crear una orden

```json
POST http://localhost:9000/api/ordenes-compra
Authorization: Bearer <token>
Content-Type: application/json

{
  "proveedorId": 1,
  "notas": "Reposición mensual de material",
  "lineas": [
    { "productoId": 1, "cantidad": 50, "precioUnitario": 8.50 },
    { "productoId": 3, "cantidad": 20, "precioUnitario": 25.00 }
  ]
}
```

---

## 9. 🎯 PAUSA: Aquí puedes completar el **Reto 7**

> Con los conceptos de esta sección ya tienes todo lo necesario para completar el **[Reto 7 — Las Compras](/sge/retos/reto7)**.

---

## 10. Dashboard de KPIs

El Dashboard agrega indicadores clave de todos los módulos en una sola vista. Es el escaparate del ERP Balmis: el alumno puede ver de un vistazo el estado del negocio.

### DashboardService — agregación multi-módulo

```java
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final EmpleadoRepository empleadoRepository;

    @Value("${erp.dashboard.umbral-stock-bajo:10}")
    private int umbralStockBajo;

    public DashboardDTO obtenerKpis() {
        // Clientes por tipo
        long clientesActivos    = clienteRepository.findByTipoCliente(TipoCliente.ACTIVO).size();
        long clientesProspectos = clienteRepository.findByTipoCliente(TipoCliente.PROSPECTO).size();
        long clientesInactivos  = clienteRepository.findByTipoCliente(TipoCliente.INACTIVO).size();

        // Pedidos agrupados por estado
        Map<EstadoPedido, Long> pedidosPorEstado = pedidoRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(Pedido::getEstado, Collectors.counting()));

        // Total facturado (pedidos en estado FACTURADO)
        BigDecimal totalFacturado = pedidoRepository.sumTotalFacturado();
        if (totalFacturado == null) totalFacturado = BigDecimal.ZERO;

        // Productos con stock bajo (umbral configurable)
        List<ProductoDTO> productosStockBajo = productoRepository
                .findProductosConStockBajo(umbralStockBajo)
                .stream().map(this::toProductoDTO).toList();

        return new DashboardDTO(
                clientesActivos, clientesProspectos, clientesInactivos,
                clienteRepository.count(),
                pedidosPorEstado,
                pedidoRepository.count(),
                totalFacturado,
                productoRepository.count(),
                productosStockBajo,
                umbralStockBajo,
                proveedorRepository.count(),
                empleadoRepository.count()
        );
    }
}
```

### Consulta personalizada en PedidoRepository

```java
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Suma el total de los pedidos facturados
    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.estado = 'FACTURADO'")
    BigDecimal sumTotalFacturado();
}

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Productos cuyo stock está por debajo del umbral
    @Query("SELECT p FROM Producto p WHERE p.stock < :umbral AND p.activo = true")
    List<Producto> findProductosConStockBajo(@Param("umbral") int umbral);
}
```

### DashboardDTO — record con todos los KPIs

```java
public record DashboardDTO(
    long clientesActivos,
    long clientesProspectos,
    long clientesInactivos,
    long totalClientes,
    Map<EstadoPedido, Long> pedidosPorEstado,
    long totalPedidos,
    BigDecimal totalFacturado,
    long totalProductos,
    List<ProductoDTO> productosStockBajo,
    int umbralStockBajo,
    long totalProveedores,
    long totalEmpleados
) {}
```

### DashboardController

```java
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("kpis", dashboardService.obtenerKpis());
        return "dashboard/index";
    }
}
```

### Vista `dashboard/index.html` — tarjetas de KPIs

```html
<!-- Fila de KPIs de Clientes -->
<div class="row g-3 mb-4">
    <div class="col-md-3">
        <div class="card text-center h-100 border-0 shadow-sm">
            <div class="card-body py-3">
                <p class="text-muted small mb-1">Total clientes</p>
                <p class="display-6 fw-bold text-dark mb-0"
                   th:text="${kpis.totalClientes()}">0</p>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card text-center h-100 border-0 shadow-sm">
            <div class="card-body py-3">
                <p class="text-muted small mb-1">Activos</p>
                <p class="display-6 fw-bold text-success mb-0"
                   th:text="${kpis.clientesActivos()}">0</p>
            </div>
        </div>
    </div>
    <!-- ... más tarjetas -->
</div>

<!-- Total facturado -->
<div class="col-md-3">
    <div class="card text-center h-100 border-0 shadow-sm">
        <div class="card-body py-3">
            <p class="text-muted small mb-1">Total facturado</p>
            <p class="display-6 fw-bold text-success mb-0">
                <span th:text="${#numbers.formatDecimal(kpis.totalFacturado(), 1, 2)}">0,00</span>
                <small class="fs-6">€</small>
            </p>
        </div>
    </div>
</div>

<!-- Productos con stock bajo -->
<table class="table table-sm" th:if="${not #lists.isEmpty(kpis.productosStockBajo())}">
    <thead><tr><th>Referencia</th><th>Descripción</th><th>Stock</th></tr></thead>
    <tbody>
        <tr th:each="prod : ${kpis.productosStockBajo()}">
            <td th:text="${prod.referencia()}"></td>
            <td th:text="${prod.descripcion()}"></td>
            <td>
                <span class="badge bg-danger"
                      th:text="${prod.stock()} + ' uds.'"></span>
            </td>
        </tr>
    </tbody>
</table>
```

### Configuración del umbral en `application.properties`

```properties
# Dashboard — umbral de stock bajo (por defecto 10 unidades)
erp.dashboard.umbral-stock-bajo=10
```

> El uso de `@Value("${erp.dashboard.umbral-stock-bajo:10}")` con valor por defecto `:10` hace que el umbral sea configurable sin romper la app si la propiedad no está definida.

---

## 11. Módulo RRHH — Empleado vinculado a Usuario

La entidad `Empleado` tiene una relación opcional `ManyToOne` con `Usuario`. Esta relación permite vincular el empleado con su cuenta de acceso al sistema, pero **no es obligatoria**: puede existir un empleado sin cuenta de usuario (ej. un empleado que no usa el sistema) y un usuario sin empleado (ej. una cuenta técnica de administrador).

```java
@Entity
@Table(name = "empleados")
public class Empleado {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String numeroEmpleado;     // "EMP001"

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellidos;

    @Column(nullable = false)
    private String cargo;

    @Column(nullable = false)
    private String departamento;

    @Column(nullable = false, unique = true)
    private String email;

    private LocalDate fechaIncorporacion;
    private Boolean activo;

    // Relación opcional: el empleado puede tener una cuenta de usuario
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // getters/setters
}
```

### Diferencia de diseño respecto a Cliente/Proveedor

| Entidad | Relación externa | ¿Obligatoria? |
|---|---|---|
| `Cliente` | Sin relación a otras entidades del sistema | — |
| `Proveedor` | Sin relación a otras entidades del sistema | — |
| `Empleado` | `ManyToOne` → `Usuario` | **Opcional** (puede ser `null`) |

---

## 12. EmpleadoService — CRUD con usuario opcional

```java
@Service
@Transactional(readOnly = true)
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<EmpleadoDTO> listarTodos() {
        return empleadoRepository.findAll().stream()
                .map(this::toDTO).toList();
    }

    public EmpleadoDTO buscarPorId(Long id) {
        return toDTO(obtenerEntidad(id));
    }

    // Devuelve todos los usuarios para el <select> del formulario
    public List<Usuario> listarUsuariosDisponibles() {
        return usuarioRepository.findAll();
    }

    @Transactional
    public EmpleadoDTO crear(EmpleadoRequestDTO request) {
        validarEmailUnico(request.getEmail(), null);
        Empleado empleado = new Empleado();
        aplicarCambios(empleado, request);
        empleado.setFechaIncorporacion(
                request.getFechaIncorporacion() != null
                        ? request.getFechaIncorporacion()
                        : LocalDate.now());
        empleado.setActivo(true);
        return toDTO(empleadoRepository.save(empleado));
    }

    @Transactional
    public EmpleadoDTO actualizar(Long id, EmpleadoRequestDTO request) {
        Empleado empleado = obtenerEntidad(id);
        validarEmailUnico(request.getEmail(), id);
        aplicarCambios(empleado, request);
        return toDTO(empleadoRepository.save(empleado));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!empleadoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Empleado", id);
        }
        empleadoRepository.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void aplicarCambios(Empleado e, EmpleadoRequestDTO r) {
        e.setNumeroEmpleado(r.getNumeroEmpleado());
        e.setNombre(r.getNombre());
        e.setApellidos(r.getApellidos());
        e.setCargo(r.getCargo());
        e.setDepartamento(r.getDepartamento());
        e.setEmail(r.getEmail());
        if (r.getFechaIncorporacion() != null) {
            e.setFechaIncorporacion(r.getFechaIncorporacion());
        }
        if (r.getActivo() != null) {
            e.setActivo(r.getActivo());
        }
        // Vincular usuario (opcional)
        if (r.getUsuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(r.getUsuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", r.getUsuarioId()));
            e.setUsuario(usuario);
        } else {
            e.setUsuario(null);  // desvincula si se envía null
        }
    }

    private EmpleadoDTO toDTO(Empleado e) {
        return new EmpleadoDTO(
                e.getId(), e.getNumeroEmpleado(), e.getNombre(), e.getApellidos(),
                e.getCargo(), e.getDepartamento(), e.getEmail(),
                e.getFechaIncorporacion(), e.getActivo(),
                e.getUsuario() != null ? e.getUsuario().getId() : null,
                e.getUsuario() != null ? e.getUsuario().getUsername() : null
        );
    }
}
```

---

## 13. EmpleadoController — CRUD completo MVC con detalle

`EmpleadoController` añade un endpoint `GET /empleados/{id}` para ver el detalle del empleado con su usuario vinculado:

```java
@Controller
@RequestMapping("/empleados")
public class EmpleadoController {

    // ── Listado ──────────────────────────────────────────────────────────────

    @GetMapping
    public String lista(Model model) {
        model.addAttribute("empleados", empleadoService.listarTodos());
        return "empleados/lista";
    }

    // ── Detalle ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        model.addAttribute("empleado", empleadoService.buscarPorId(id));
        return "empleados/detalle";
    }

    // ── Alta ─────────────────────────────────────────────────────────────────

    @GetMapping("/nuevo")
    public String formularioNuevo(Model model) {
        model.addAttribute("empleadoForm", new EmpleadoRequestDTO());
        model.addAttribute("modoEdicion", false);
        model.addAttribute("usuarios", empleadoService.listarUsuariosDisponibles());
        return "empleados/formulario";
    }

    @PostMapping("/nuevo")
    public String guardarNuevo(
            @Valid @ModelAttribute("empleadoForm") EmpleadoRequestDTO form,
            BindingResult br, Model model, RedirectAttributes ra) {

        if (br.hasErrors()) {
            model.addAttribute("modoEdicion", false);
            model.addAttribute("usuarios", empleadoService.listarUsuariosDisponibles());
            return "empleados/formulario";
        }
        try {
            empleadoService.crear(form);
            ra.addFlashAttribute("mensajeExito",
                    "Empleado '" + form.getNombre() + " " + form.getApellidos() + "' creado.");
        } catch (EmailDuplicadoException e) {
            br.rejectValue("email", "email.duplicado", e.getMessage());
            model.addAttribute("modoEdicion", false);
            model.addAttribute("usuarios", empleadoService.listarUsuariosDisponibles());
            return "empleados/formulario";
        }
        return "redirect:/empleados";
    }

    // ── Edición ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}/editar")
    public String formularioEditar(@PathVariable Long id, Model model) {
        EmpleadoDTO e = empleadoService.buscarPorId(id);
        EmpleadoRequestDTO form = new EmpleadoRequestDTO();
        form.setNumeroEmpleado(e.numeroEmpleado());
        form.setNombre(e.nombre());
        form.setApellidos(e.apellidos());
        form.setCargo(e.cargo());
        form.setDepartamento(e.departamento());
        form.setEmail(e.email());
        form.setFechaIncorporacion(e.fechaIncorporacion());
        form.setActivo(e.activo());
        form.setUsuarioId(e.usuarioId());
        model.addAttribute("empleadoForm", form);
        model.addAttribute("empleadoId", id);
        model.addAttribute("modoEdicion", true);
        model.addAttribute("usuarios", empleadoService.listarUsuariosDisponibles());
        return "empleados/formulario";
    }

    // ── Baja ──────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/eliminar")
    public String confirmarEliminar(@PathVariable Long id, Model model) {
        model.addAttribute("empleado", empleadoService.buscarPorId(id));
        return "empleados/confirmar-eliminar";
    }

    @PostMapping("/{id}/eliminar")
    public String ejecutarEliminar(@PathVariable Long id, RedirectAttributes ra) {
        EmpleadoDTO emp = empleadoService.buscarPorId(id);
        empleadoService.eliminar(id);
        ra.addFlashAttribute("mensajeExito",
                "Empleado '" + emp.nombre() + " " + emp.apellidos() + "' eliminado.");
        return "redirect:/empleados";
    }
}
```

### Formulario con `<select>` para el usuario vinculado

Una de las novedades del formulario de empleados respecto al de proveedores es el desplegable de usuarios:

```html
<!-- empleados/formulario.html (fragmento del campo usuario) -->
<div class="col-md-6">
    <label for="usuarioId" class="form-label fw-semibold">Usuario del sistema</label>
    <select id="usuarioId" class="form-select" th:field="*{usuarioId}">
        <option value="">— Sin usuario vinculado —</option>
        <option th:each="u : ${usuarios}"
                th:value="${u.id}"
                th:text="${u.username} + ' (' + ${u.rol} + ')'">
        </option>
    </select>
    <div class="form-text text-muted">
        Opcional: vincula este empleado con su cuenta de acceso al sistema.
    </div>
</div>
```

---

## 14. Navbar reutilizable y fragmento de layout

El fragmento `fragments/layout.html` centraliza la estructura HTML de todas las páginas del ERP Balmis: cabecera con navbar, contenido principal y pie de página.

```html
<!-- fragments/layout.html -->
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
      th:fragment="layout(title, content)">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title th:replace="${title}">ERP Balmis</title>
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
</head>
<body>

<!-- ── Navbar ─────────────────────────────────────────────────────────────── -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand fw-bold" th:href="@{/}">⚕ ERP Balmis</a>
        <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/clientes}">Clientes</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/productos}">Productos</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/pedidos}">Pedidos</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/proveedores}">Proveedores</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/ordenes-compra}">Compras</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/empleados}"
                       sec:authorize="hasAnyRole('ADMIN','MANAGER')">Empleados</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" th:href="@{/dashboard}">Dashboard</a>
                </li>
            </ul>
            <!-- Usuario autenticado + botón Cerrar sesión -->
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item">
                    <span class="nav-link text-light">
                        <span sec:authentication="name"></span>
                        <span class="badge bg-secondary ms-1"
                              sec:authentication="principal.authorities[0]"></span>
                    </span>
                </li>
                <li class="nav-item">
                    <form th:action="@{/logout}" method="post" class="d-inline">
                        <button type="submit" class="btn btn-outline-light btn-sm">
                            Cerrar sesión
                        </button>
                    </form>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- ── Contenido principal ─────────────────────────────────────────────────── -->
<main class="container-fluid py-4 px-4">
    <th:block th:replace="${content}" />
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### Uso del fragmento en las páginas

Todas las páginas del ERP usan el fragmento con `th:replace`:

```html
<html th:replace="~{fragments/layout :: layout(~{::title}, ~{::main-content})}">
<head>
    <title>Proveedores — ERP Balmis</title>
</head>
<body>
<th:block th:fragment="main-content">
    <!-- contenido de la página -->
</th:block>
</body>
</html>
```

---

## 15. 🎯 PAUSA: Aquí puedes completar el **Reto 8 Final**

> Con los conceptos de esta sección ya tienes todo lo necesario para completar el **[Reto 8 Final — Dashboard, RRHH y Presentación](/sge/retos/reto8-final)**.

---

## Resumen de la UD7

| Sección | Qué aprendiste |
|---|---|
| Módulo Compras | Entidades `Proveedor`, `OrdenCompra`, `LineaOrdenCompra` y enum `EstadoOrdenCompra` |
| ProveedorService / Controller | CRUD completo reutilizando el patrón de `ClienteService` (Reto 4) |
| OrdenCompraService | Lógica de recepción: incremento de stock simétrico al decremento de ventas |
| OrdenCompraController | Vista de lista con botón "Recibir" condicionado por estado y rol |
| API REST de Compras | `ProveedorRestController` + `OrdenCompraRestController` con Swagger |
| Dashboard | `DashboardService` agrega KPIs de todos los repositorios en un `DashboardDTO` |
| RRHH | `EmpleadoController` con relación opcional a `Usuario` y selector en formulario |
| Layout y Navbar | Fragmento `layout.html` reutilizable con `sec:authentication` y menú completo |
