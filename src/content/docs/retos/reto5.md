---
title: Reto 5 — Las Ventas
description: UD6 — Módulo Ventas con vistas Thymeleaf de Productos y Pedidos, API REST y workflow de estados
---

> **Conceptos teóricos:** Patrones REST avanzados, relaciones JPA OneToMany/ManyToOne, validación en cascada y workflows de estados.
> Consulta [UD6 — Formularios Web con Thymeleaf](/sge/spring/ud6) para los conceptos de `th:field`, `th:errors`, `@Valid` y `BindingResult` aplicados en la Parte A.

## Duración

10 horas

## Objetivo

Implementar el **Módulo de Ventas** con **doble interfaz**: formularios Thymeleaf navegables para el catálogo de productos y el ciclo de pedidos (Parte A, 4 h), y una API REST completa con workflow de estados y control de stock (Parte B, 6 h).

## Descripción del reto

Partiendo de `erpbalmis_4`, se añade la gestión completa del catálogo de productos y el ciclo de vida de los pedidos de venta.

- **Parte A:** Se extienden `ProductoController` y se crea `PedidoController` con vistas Thymeleaf CRUD. Se introduce `ProductoFormDTO` (clase `@Data`) como solución al problema de que `ProductoRequestDTO` es un Java record inmutable, incompatible con el form-binding de Thymeleaf.
- **Parte B:** El sistema controla automáticamente el stock al confirmar pedidos y valida que no se puedan confirmar pedidos sin stock suficiente. Se implementan nuevas entidades JPA, servicios con lógica transaccional y una API REST documentada con Swagger.

---

## Parte A — Vistas Thymeleaf de Ventas

### Paso A1 — `ProductoFormDTO`: por qué no podemos usar el record

`ProductoRequestDTO` es un **Java record** (inmutable, sin setters). Thymeleaf necesita setters para el form-binding con `th:field`, por lo que hay que crear una clase `@Data` específica para el formulario MVC:

```java
@Data
public class ProductoFormDTO {

    @NotBlank(message = "La referencia es obligatoria")
    @Size(max = 20, message = "La referencia no puede superar 20 caracteres")
    private String referencia;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 255)
    private String descripcion;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.01")
    private BigDecimal precioVenta;

    @NotNull(message = "El precio de coste es obligatorio")
    @DecimalMin(value = "0.00", inclusive = true)
    private BigDecimal precioCoste;

    @NotNull(message = "El stock inicial es obligatorio")
    @Min(value = 0)
    private Integer stock;

    private Boolean activo;
}
```

> **Regla:** Los **Java records** son inmutables → no tienen setters → Thymeleaf no puede hacer form-binding. Solución: clase `@Data` para el formulario, record para la respuesta de la API.

En el controlador se convierte `ProductoFormDTO` → `ProductoRequestDTO` antes de llamar al servicio:

```java
ProductoRequestDTO dto = new ProductoRequestDTO(
    form.getReferencia(), form.getDescripcion(),
    form.getPrecioVenta(), form.getPrecioCoste(),
    form.getStock(), Boolean.TRUE.equals(form.getActivo()));
productoService.crear(dto);
```

### Paso A2 — `ProductoController` CRUD MVC

Mismo patrón que el `ClienteController` del Reto 4: 6 endpoints, inyecta `ProductoService`, usa `ProductoFormDTO` como objeto de formulario.

```java
@Controller
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    // ── Listado ──────────────────────────────────────────────────────
    @GetMapping
    public String lista(Model model) {
        model.addAttribute("productos", productoService.listarTodos());
        return "productos/lista";
    }

    // ── Alta ─────────────────────────────────────────────────────────
    @GetMapping("/nuevo")
    public String formularioNuevo(Model model) {
        ProductoFormDTO form = new ProductoFormDTO();
        form.setActivo(true);   // activo por defecto
        model.addAttribute("productoForm", form);
        model.addAttribute("modoEdicion", false);
        return "productos/formulario";
    }

    @PostMapping("/nuevo")
    public String guardarNuevo(
            @Valid @ModelAttribute("productoForm") ProductoFormDTO form,
            BindingResult br, Model model, RedirectAttributes ra) {
        if (br.hasErrors()) {
            model.addAttribute("modoEdicion", false);
            return "productos/formulario";
        }
        ProductoRequestDTO dto = new ProductoRequestDTO(/* ... */);
        productoService.crear(dto);
        ra.addFlashAttribute("mensajeExito", "Producto '" + form.getReferencia() + "' creado.");
        return "redirect:/productos";
    }

    // ── Edición / Baja ────────────────────────────────────────────────
    // (mismo patrón: GET carga datos, POST guarda/elimina)
}
```

### Paso A3 — Templates de Producto

**`productos/formulario.html`** — reutilizable para alta y edición, con `th:field` y `th:errors`:

```html
<form th:action="${modoEdicion} ? @{/productos/{id}/editar(id=${productoId})} : @{/productos/nuevo}"
      th:object="${productoForm}" method="post" novalidate>

    <input type="text" class="form-control"
           th:field="*{referencia}"
           th:classappend="${#fields.hasErrors('referencia')} ? ' is-invalid'" />
    <div class="invalid-feedback" th:errors="*{referencia}"></div>

    <!-- checkbox activo -->
    <input type="checkbox" class="form-check-input" th:field="*{activo}" />

    <button type="submit"
            th:text="${modoEdicion} ? 'Guardar cambios' : 'Crear producto'">Guardar</button>
</form>
```

**`productos/lista.html`** — actualizada con botón "+ Nuevo producto" y columna Acciones.

**`productos/eliminar.html`** — confirmación POST (mismo patrón que `clientes/eliminar.html`).

### Paso A4 — `PedidoFormDTO`: formulario simplificado

Crear un pedido completo con líneas dinámicas requeriría JavaScript. Para este reto se usa un formulario simplificado de **1 línea fija** (cliente + producto + cantidad). El pedido se crea en BORRADOR; las líneas adicionales pueden añadirse vía API.

```java
@Data
public class PedidoFormDTO {

    @NotNull(message = "Selecciona un cliente")
    private Long clienteId;

    @NotNull(message = "Selecciona un producto")
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad mínima es 1")
    private Integer cantidad;
}
```

En el controlador se convierte a `PedidoRequestDTO` con una lista de una línea:

```java
LineaPedidoRequestDTO linea = new LineaPedidoRequestDTO(form.getProductoId(), form.getCantidad());
PedidoRequestDTO dto = new PedidoRequestDTO(form.getClienteId(), List.of(linea));
PedidoDTO pedido = pedidoService.crear(dto);
```

### Paso A5 — `PedidoController` MVC

```java
@Controller
@RequestMapping("/pedidos")
public class PedidoController {

    // Inyecta PedidoService, ClienteService, ProductoService

    @GetMapping                     // → lista de todos los pedidos
    @GetMapping("/{id}")            // → detalle con líneas + botón confirmar
    @GetMapping("/nuevo")           // → formulario de nuevo pedido
    @PostMapping("/nuevo")          // → crear pedido en BORRADOR
    @PostMapping("/{id}/confirmar") // → cambiar estado a CONFIRMADO
}
```

El endpoint `confirmar` captura `StockInsuficienteException` y la transforma en un mensaje de error flash:

```java
@PostMapping("/{id}/confirmar")
public String confirmar(@PathVariable Long id, RedirectAttributes ra) {
    try {
        PedidoDTO pedido = pedidoService.confirmar(id);
        ra.addFlashAttribute("mensajeExito", "Pedido '" + pedido.numeroPedido() + "' confirmado.");
    } catch (StockInsuficienteException e) {
        ra.addFlashAttribute("mensajeError", e.getMessage());
    }
    return "redirect:/pedidos/" + id;
}
```

### Paso A6 — Templates de Pedido

**`pedidos/lista.html`** — tabla con badge de estado coloreado:

```html
<span class="badge"
      th:classappend="${pedido.estado.name() == 'BORRADOR'}    ? 'bg-secondary' :
                       (${pedido.estado.name() == 'CONFIRMADO'} ? 'bg-success'   :
                       (${pedido.estado.name() == 'ENVIADO'}    ? 'bg-primary'   : 'bg-dark'))"
      th:text="${pedido.estado}"></span>
```

**`pedidos/formulario.html`** — selects de cliente y producto con `th:each`:

```html
<select th:field="*{clienteId}">
    <option value="">-- Selecciona un cliente --</option>
    <option th:each="c : ${clientes}" th:value="${c.id}" th:text="${c.nombre}"></option>
</select>
```

**`pedidos/detalle.html`** — tabla de líneas + botón "Confirmar pedido" solo si el estado es BORRADOR:

```html
<form th:if="${pedido.estado.name() == 'BORRADOR'}"
      th:action="@{/pedidos/{id}/confirmar(id=${pedido.id})}" method="post">
    <button type="submit" class="btn btn-success">✓ Confirmar pedido</button>
</form>
```

### Estructura de templates nueva (Parte A)

```
templates/
  clientes/
    lista.html        → actualizada: botones Nuevo / Editar / Eliminar
    formulario.html   → propagada desde Reto 4 (sin cambios)
    eliminar.html     → propagada desde Reto 4 (sin cambios)
  productos/
    lista.html        → actualizada: botones Nuevo / Editar / Eliminar
    formulario.html   → NUEVA: alta y edición con th:field + th:errors
    eliminar.html     → NUEVA: confirmación de baja
  pedidos/
    lista.html        → NUEVA: tabla con badge de estado coloreado
    formulario.html   → NUEVA: formulario simplificado (1 línea)
    detalle.html      → NUEVA: detalle con líneas + botón Confirmar
```

---

## Parte B — API REST de Ventas



### `EstadoPedido` (enum)

Define el workflow del ciclo de venta:

```
BORRADOR → CONFIRMADO → ENVIADO → FACTURADO
```

| Estado | Descripción |
|--------|-------------|
| `BORRADOR` | Pedido en construcción; no descuenta stock |
| `CONFIRMADO` | Pedido validado; el stock se decrementa en este momento |
| `ENVIADO` | Mercancía enviada al cliente |
| `FACTURADO` | Factura emitida; ciclo cerrado |

### `Pedido`

```java
@Entity @Table(name = "pedidos")
public class Pedido {
    Long id;
    String numeroPedido;         // Generado: PED-YYYYMMDD-NNN
    LocalDate fecha;
    EstadoPedido estado;         // @Enumerated(STRING)
    Cliente cliente;             // @ManyToOne
    List<LineaPedido> lineas;    // @OneToMany cascade=ALL orphanRemoval=true
    BigDecimal total;
    LocalDate fechaConfirmacion;
    LocalDate fechaModificacion;
}
```

### `LineaPedido`

```java
@Entity @Table(name = "lineas_pedido")
public class LineaPedido {
    Long id;
    Pedido pedido;              // @ManyToOne
    Producto producto;          // @ManyToOne
    Integer cantidad;
    BigDecimal precioUnitario;  // Snapshot del precio al crear la línea
    BigDecimal subtotal;        // cantidad × precioUnitario
}
```

> El `precioUnitario` es un **snapshot**: aunque el precio del producto cambie en el futuro, el histórico de pedidos no se ve afectado.

## DTOs nuevos

| DTO | Tipo | Uso |
|-----|------|-----|
| `ProductoFormDTO` | clase `@Data` | **Form-binding MVC** (Parte A) — mutable, con setters |
| `PedidoFormDTO` | clase `@Data` | **Form-binding MVC** (Parte A) — formulario simplificado 1 línea |
| `ProductoDTO` | record | Respuesta de la API de productos |
| `ProductoRequestDTO` | record | Creación / actualización de producto (API REST) |
| `LineaPedidoDTO` | record | Línea de pedido en la respuesta |
| `PedidoDTO` | record | Respuesta completa del pedido con sus líneas |
| `LineaPedidoRequestDTO` | record | Línea en la petición de creación (API REST) |
| `PedidoRequestDTO` | record | Petición de creación de pedido (API REST) |

> Los **records** se usan para la API REST (inmutables, perfectos para respuestas/peticiones JSON). Las **clases `@Data`** se usan para los formularios MVC (mutables, necesitan setters para el form-binding).


## Excepciones nuevas

| Excepción | HTTP | Cuándo |
|-----------|------|--------|
| `StockInsuficienteException` | 422 | Al confirmar si falta stock |
| `TransicionEstadoInvalidaException` | 409 | Transición de estado no permitida |

## Servicios

### `ProductoService`

CRUD completo con método `ajustarStock(id, delta)` para sumar o restar stock.

```java
listarTodos()                        // GET todos
listarActivos()                      // GET solo activos
buscarPorId(Long id)                 // GET por id
crear(ProductoRequestDTO)            // POST
actualizar(Long, ProductoRequestDTO) // PUT
ajustarStock(Long, int delta)        // PATCH /stock
eliminar(Long)                       // DELETE
```

### `PedidoService`

Controla todo el ciclo de vida del pedido.

```java
listarTodos()                              // GET todos
listarPorEstado(EstadoPedido)              // GET filtrado
buscarPorId(Long)                          // GET por id
estadisticas()                             // Map<EstadoPedido, Long>
crear(PedidoRequestDTO)                    // POST — crea en BORRADOR
confirmar(Long)                            // PATCH /confirmar — descuenta stock
actualizarEstado(Long, EstadoPedido)       // PATCH /estado
eliminar(Long)                             // DELETE — solo si BORRADOR
```

**Lógica de `confirmar`:**

1. Valida que el pedido está en `BORRADOR`
2. Recorre todas las líneas y comprueba stock sin modificar nada (si alguno falla, lanza `StockInsuficienteException`)
3. Si todo es válido, descuenta el stock de cada producto
4. Cambia el estado a `CONFIRMADO` y registra `fechaConfirmacion`

## API REST

### Productos — `GET /api/productos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Lista todos (`?soloActivos=true` para filtrar) |
| GET | `/api/productos/{id}` | Obtener por id |
| POST | `/api/productos` | Crear producto (201) |
| PUT | `/api/productos/{id}` | Actualizar completo |
| PATCH | `/api/productos/{id}/stock` | Ajustar stock con `{"delta": N}` |
| DELETE | `/api/productos/{id}` | Eliminar (204) |

### Pedidos — `GET /api/pedidos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Lista todos (`?estado=BORRADOR` para filtrar) |
| GET | `/api/pedidos/estadisticas` | Recuento por estado |
| GET | `/api/pedidos/{id}` | Obtener pedido completo con líneas |
| POST | `/api/pedidos` | Crear pedido en BORRADOR (201) |
| PATCH | `/api/pedidos/{id}/confirmar` | Confirmar y descontar stock |
| PATCH | `/api/pedidos/{id}/estado` | Avanzar estado `{"estado": "ENVIADO"}` |
| DELETE | `/api/pedidos/{id}` | Eliminar (solo si BORRADOR, 204) |

## Ejemplo: crear un pedido

**POST `/api/pedidos`**

```json
{
  "clienteId": 1,
  "lineas": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 3, "cantidad": 5 }
  ]
}
```

**Respuesta 201:**

```json
{
  "id": 3,
  "numeroPedido": "PED-20250601-003",
  "fecha": "2025-06-01",
  "estado": "BORRADOR",
  "clienteId": 1,
  "clienteNombre": "Acme Corporation",
  "lineas": [
    { "productoReferencia": "PROD001", "cantidad": 2, "precioUnitario": 29.99, "subtotal": 59.98 },
    { "productoReferencia": "PROD003", "cantidad": 5, "precioUnitario": 9.99,  "subtotal": 49.95 }
  ],
  "total": 109.93,
  "fechaConfirmacion": null
}
```

## Error 422 — Stock insuficiente

Si al confirmar no hay stock:

```json
{
  "status": 422,
  "error": "Stock insuficiente",
  "mensaje": "Stock insuficiente para 'PROD001': disponible 3, solicitado 10",
  "productoReferencia": "PROD001",
  "stockDisponible": 3,
  "solicitado": 10
}
```

## Swagger UI

Con la aplicación arrancada (puerto 9000):

```
http://localhost:9000/swagger-ui.html
```

Verás los grupos **Productos** y **Pedidos** con todos los endpoints documentados.

## Comparativa con Axelor

| Spring Boot (Reto 5) | Axelor ERP |
|----------------------|------------|
| `Pedido` + `LineaPedido` | Pedido de venta + Líneas |
| Workflow BORRADOR→CONFIRMADO→ENVIADO→FACTURADO | Borrador→Confirmado→Entregado→Facturado |
| `PedidoService.confirmar()` descuenta stock | Axelor gestiona el stock en Inventario |
| `GET /api/pedidos/estadisticas` | Panel de ventas / informes |
| `StockInsuficienteException` (422) | Alerta de stock en Axelor |

## Estructura del proyecto

```
erpbalmis_5/
├── src/main/java/com/iesdoctorbalmis/spring/
│   ├── controller/
│   │   ├── rest/
│   │   │   ├── ProductoRestController.java   ← CRUD completo
│   │   │   └── PedidoRestController.java     ← nuevo
│   │   ├── ClienteController.java            ← propagado de Reto 4 (CRUD con formularios)
│   │   ├── ProductoController.java           ← ACTUALIZADO: CRUD MVC con formularios
│   │   ├── PedidoController.java             ← NUEVO: lista, detalle, nuevo, confirmar
│   │   ├── EmpleadoController.java
│   │   └── HomeController.java               ← actualizado: añadido totalPedidos
│   ├── dto/
│   │   ├── ProductoFormDTO.java              ← NUEVO: @Data para form-binding MVC
│   │   ├── PedidoFormDTO.java                ← NUEVO: @Data simplificado (1 línea)
│   │   ├── ProductoDTO.java                  ← record (respuesta API)
│   │   ├── ProductoRequestDTO.java           ← record (petición API)
│   │   ├── PedidoDTO.java                    ← record (respuesta API)
│   │   ├── LineaPedidoDTO.java               ← record (respuesta API)
│   │   ├── PedidoRequestDTO.java             ← record (petición API)
│   │   └── LineaPedidoRequestDTO.java        ← record (petición API)
│   ├── entity/
│   │   ├── EstadoPedido.java                 ← enum nuevo
│   │   ├── Pedido.java                       ← entidad nueva
│   │   ├── LineaPedido.java                  ← entidad nueva
│   │   ├── Producto.java
│   │   └── Cliente.java
│   ├── exception/
│   │   ├── StockInsuficienteException.java         ← nueva (422)
│   │   ├── TransicionEstadoInvalidaException.java  ← nueva (409)
│   │   └── GlobalExceptionHandler.java             ← actualizado (+422, +409)
│   ├── repository/
│   │   ├── PedidoRepository.java              ← nuevo
│   │   └── LineaPedidoRepository.java         ← nuevo
│   └── service/
│       ├── ProductoService.java               ← nuevo
│       └── PedidoService.java                 ← nuevo
└── src/main/resources/templates/
    ├── clientes/
    │   ├── lista.html       ← actualizada: botones Nuevo/Editar/Eliminar
    │   ├── formulario.html  ← propagada de Reto 4
    │   └── eliminar.html    ← propagada de Reto 4
    ├── productos/
    │   ├── lista.html       ← actualizada: botones Nuevo/Editar/Eliminar
    │   ├── formulario.html  ← NUEVA
    │   └── eliminar.html    ← NUEVA
    ├── pedidos/
    │   ├── lista.html       ← NUEVA: con badges de estado
    │   ├── formulario.html  ← NUEVA: formulario simplificado
    │   └── detalle.html     ← NUEVA: líneas + botón Confirmar
    └── fragments/
        └── layout.html      ← actualizado: añadido enlace Pedidos en navbar
```

