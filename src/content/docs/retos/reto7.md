---
title: Reto 7 — Las Compras
description: UD7 — Módulo Compras con vistas Thymeleaf de Proveedores y Órdenes de Compra, más API REST documentada con Swagger
---

> **Conceptos teóricos:** Entidades `Proveedor` y `OrdenCompra`, relación `ManyToOne`, lógica de recepción con incremento de stock, `sec:authorize` en formulario POST.  
> Consulta [UD7 — Módulos Avanzados y Dashboard](/sge/spring/ud7) para los fundamentos teóricos completos.

## Duración

6 horas

## Objetivo

Completar el ciclo de negocio del ERP Balmis añadiendo el módulo de Compras con:

- **Parte A (3 h):** Vistas Thymeleaf completas para Proveedores (CRUD) y lista de Órdenes de Compra con botón "Recibir" que actualiza el stock.
- **Parte B (3 h):** API REST de Proveedores y Órdenes de Compra, documentada con Swagger y probada con Postman.

## Descripción del reto

Partiendo de `erpbalmis_6`, se añade el módulo **Compras** con dos entidades nuevas:

- `Proveedor` — similar a `Cliente` pero representa al suministrador de productos.
- `OrdenCompra` + `LineaOrdenCompra` — similar a `Pedido` + `LineaPedido` pero en sentido inverso: al recibir la orden, **se incrementa el stock** de los productos.

El flujo es:

```
[Vista] Proveedores → Crear Orden (API) → Lista Órdenes → Botón Recibir → stock actualizado
```

---

## Parte A — Vistas Thymeleaf de Compras

### Paso A1 — Entidad `Proveedor` y `ProveedorRequestDTO`

Crea la entidad `Proveedor` en `entity/` con los siguientes campos:

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue` |
| `codigoProveedor` | `String` | `@NotBlank`, único |
| `nombre` | `String` | `@NotBlank` |
| `email` | `String` | `@NotBlank @Email`, único |
| `telefono` | `String` | Opcional |
| `direccion` | `String` | Opcional |
| `personaContacto` | `String` | Opcional |
| `fechaAlta` | `LocalDate` | Se asigna automáticamente al crear |
| `fechaModificacion` | `LocalDate` | Se actualiza en cada edición |
| `activo` | `Boolean` | `true` por defecto |

Crea `ProveedorRequestDTO` con las validaciones `@NotBlank` y `@Email` en los campos obligatorios.

Crea `ProveedorDTO` como `record` con todos los campos para las respuestas de lectura.

Crea `ProveedorRepository` extendiendo `JpaRepository<Proveedor, Long>` con el método:
```java
Optional<Proveedor> findByEmail(String email);
```

### Paso A2 — `ProveedorService` con validación de email único

Replica el patrón de `ClienteService` para `ProveedorService`:

- `listarTodos()` → `List<ProveedorDTO>`
- `buscarPorId(Long id)` → `ProveedorDTO` (lanza `RecursoNoEncontradoException` si no existe)
- `crear(ProveedorRequestDTO)` → valida email único, asigna `fechaAlta` y `activo=true`
- `actualizar(Long id, ProveedorRequestDTO)` → valida email único excluyendo el propio proveedor
- `eliminar(Long id)` → lanza `RecursoNoEncontradoException` si no existe

La validación de email único reutiliza `EmailDuplicadoException`.

### Paso A3 — `ProveedorController` (MVC) — 7 endpoints

Crea `ProveedorController` con `@Controller` y `@RequestMapping("/proveedores")`:

```java
@GetMapping                          // Lista de proveedores
@GetMapping("/nuevo")                // Formulario vacío de alta
@PostMapping("/nuevo")               // Guardar nuevo proveedor
@GetMapping("/{id}/editar")          // Formulario relleno para edición
@PostMapping("/{id}/editar")         // Guardar edición
@GetMapping("/{id}/eliminar")        // Página de confirmación de baja
@PostMapping("/{id}/eliminar")       // Ejecutar la baja
```

El patrón es idéntico al de `ClienteController` (Reto 4): `@Valid`, `BindingResult`, `RedirectAttributes`, `rejectValue` para `EmailDuplicadoException`.

### Paso A4 — Plantillas de Proveedores

Crea las siguientes plantillas en `templates/proveedores/`:

**`lista.html`** — tabla con columnas: Código, Nombre, Email, Teléfono, Persona contacto, Estado (badge Activo/Inactivo), Acciones.

- Botón "+ Nuevo proveedor": `sec:authorize="hasAnyRole('ADMIN','MANAGER')"`
- Botón Editar por fila: `sec:authorize="hasAnyRole('ADMIN','MANAGER')"`
- Botón Eliminar por fila: `sec:authorize="hasRole('ADMIN')"`
- Mensajes flash `${mensajeExito}` y `${mensajeError}`.

**`formulario.html`** — formulario reutilizable (alta + edición) con `th:object="${proveedorForm}"`:

| Campo | Tipo HTML | Validación visible |
|---|---|---|
| `codigoProveedor` | `text` | `th:errors` con `is-invalid` |
| `nombre` | `text` | `th:errors` con `is-invalid` |
| `email` | `email` | `th:errors` con `is-invalid` |
| `telefono` | `text` | Opcional, sin asterisco |
| `personaContacto` | `text` | Opcional |
| `direccion` | `text` | Opcional |

La acción del formulario cambia según `modoEdicion`:
```html
th:action="${modoEdicion} ? @{/proveedores/{id}/editar(id=${proveedorId})} : @{/proveedores/nuevo}"
```

**`confirmar-eliminar.html`** — página de confirmación que muestra nombre y código del proveedor y un formulario `POST` para ejecutar la baja.

### Paso A5 — Entidades `OrdenCompra`, `LineaOrdenCompra` y `EstadoOrdenCompra`

Crea el enum:
```java
public enum EstadoOrdenCompra { PENDIENTE, RECIBIDA, CANCELADA }
```

Crea `OrdenCompra` con:
- `numeroOrden` (String, único) — formato `OC-YYYYMMDD-NNN`
- `fecha` (LocalDate)
- `estado` (EstadoOrdenCompra, `@Enumerated(EnumType.STRING)`)
- `proveedor` (`@ManyToOne` a `Proveedor`)
- `lineas` (`@OneToMany(mappedBy="ordenCompra", cascade=ALL, orphanRemoval=true)`)
- `total` (BigDecimal)
- `fechaRecepcion` (LocalDate, se asigna al recibir la orden)
- `notas` (String, opcional)

Crea `LineaOrdenCompra` con:
- `ordenCompra` (`@ManyToOne`)
- `producto` (`@ManyToOne` a `Producto`)
- `cantidad` (Integer)
- `precioUnitario` (BigDecimal)
- `subtotal` (BigDecimal)

### Paso A6 — `OrdenCompraService` — creación y recepción

Implementa los métodos clave:

- `listarTodas()` → `List<OrdenCompraDTO>`
- `buscarPorId(Long id)` → `OrdenCompraDTO`
- `crear(OrdenCompraRequestDTO)` — estado inicial `PENDIENTE`, genera `numeroOrden` con formato `OC-YYYYMMDD-NNN`, calcula subtotal por línea y total general.
- `recibirOrden(Long id)` — **lógica de negocio principal**:
  - Lanza `OrdenCanceladaException` (HTTP 409) si la orden ya está `CANCELADA` o ya está `RECIBIDA`.
  - Itera las líneas e **incrementa el stock** de cada producto.
  - Cambia el estado a `RECIBIDA` y asigna `fechaRecepcion = LocalDate.now()`.

> Este es el complemento simétrico de `PedidoService.confirmarPedido()` (Reto 5): donde ventas **decrementa** stock, compras **incrementa** stock.

### Paso A7 — `OrdenCompraController` (MVC) — lista y botón Recibir

Crea `OrdenCompraController` con dos endpoints:

```java
@GetMapping                          // Lista de órdenes con estado coloreado
@PostMapping("/{id}/recibir")        // Marcar como RECIBIDA
```

El `POST /{id}/recibir` captura `OrdenCanceladaException` y la envía como `mensajeError` en `RedirectAttributes`.

**`ordenes/lista.html`** — tabla con columnas: Nº Orden, Proveedor, Fecha, Estado (badge coloreado), Total, Fecha recepción, Acciones.

- Estado: `PENDIENTE` = badge amarillo, `RECIBIDA` = badge verde, `CANCELADA` = badge gris.
- Botón "Recibir" (formulario POST): solo visible si `estado == PENDIENTE` **y** `sec:authorize="hasAnyRole('ADMIN','MANAGER')"`.
- Para órdenes ya procesadas: mostrar texto "Sin acciones".
- Confirmación `onclick` en el botón antes de enviar el formulario.

---

## Parte B — API REST de Compras

### Paso B1 — `ProveedorRestController`

Crea `ProveedorRestController` con `@RestController` y `@RequestMapping("/api/proveedores")`. Implementa el CRUD completo:

| Método | URL | Código respuesta |
|---|---|---|
| GET | `/api/proveedores` | 200 |
| GET | `/api/proveedores/{id}` | 200 / 404 |
| POST | `/api/proveedores` | 201 / 400 / 409 |
| PUT | `/api/proveedores/{id}` | 200 / 404 |
| DELETE | `/api/proveedores/{id}` | 204 / 404 |

Anota con `@Tag(name="Proveedores")`, `@Operation` en cada método y `@ApiResponse` para los códigos de error.

### Paso B2 — `OrdenCompraRequestDTO` y `OrdenCompraRestController`

Crea el DTO de petición (record anidado):

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

Crea `OrdenCompraRestController` con `@RestController` y `@RequestMapping("/api/ordenes-compra")`:

| Método | URL | Descripción |
|---|---|---|
| GET | `/api/ordenes-compra` | Lista todas las órdenes |
| GET | `/api/ordenes-compra/{id}` | Detalle de una orden |
| POST | `/api/ordenes-compra` | Crear orden (estado PENDIENTE) |
| PATCH | `/api/ordenes-compra/{id}/recibir` | Marcar como RECIBIDA, actualiza stock |

El `PATCH /recibir` devuelve **HTTP 409** si la orden ya está cancelada o recibida. Documenta todos los endpoints con `@Operation` y `@ApiResponse`.

### Paso B3 — Prueba con Postman

**Flujo completo a probar:**

1. `POST /api/auth/login` → obtener token JWT.
2. `POST /api/proveedores` → crear proveedor (body con `codigoProveedor`, `nombre`, `email`).
3. `POST /api/ordenes-compra` → crear una orden con al menos 2 líneas de productos.
4. `GET /api/ordenes-compra` → verificar que la orden aparece en estado `PENDIENTE`.
5. `GET /api/productos/{id}` → anotar el stock actual del producto.
6. `PATCH /api/ordenes-compra/{id}/recibir` → recibir la orden.
7. `GET /api/productos/{id}` → verificar que el stock se ha incrementado.
8. `PATCH /api/ordenes-compra/{id}/recibir` de nuevo → verificar que devuelve **HTTP 409**.

### Paso B4 — `import.sql` actualizado

Añade datos de prueba para proveedores y órdenes:

```sql
-- Proveedores
INSERT INTO proveedores (codigo_proveedor, nombre, email, telefono, persona_contacto, fecha_alta, activo)
VALUES ('PROV001', 'Distribuciones Alicante S.L.', 'contacto@distalicante.com', '965 000 111', 'Rosa Navarro', CURRENT_DATE, true);
INSERT INTO proveedores (codigo_proveedor, nombre, email, telefono, persona_contacto, fecha_alta, activo)
VALUES ('PROV002', 'TechSupply Valencia', 'pedidos@techsupply.es', '963 000 222', 'Marcos Ferri', CURRENT_DATE, true);
```

---

## Estructura de ficheros nueva en el Reto 7

```
src/main/java/com/iesdoctorbalmis/spring/
  controller/
    ProveedorController.java         ← MVC: CRUD proveedores
    OrdenCompraController.java       ← MVC: lista + botón recibir
  controller/rest/
    ProveedorRestController.java     ← REST: CRUD proveedores
    OrdenCompraRestController.java   ← REST: crear + recibir
  dto/
    ProveedorDTO.java                ← record de respuesta
    ProveedorRequestDTO.java         ← formulario y body API
    OrdenCompraDTO.java              ← record de respuesta
    OrdenCompraRequestDTO.java       ← body API (con record anidado)
    LineaOrdenCompraDTO.java
  entity/
    Proveedor.java
    OrdenCompra.java
    LineaOrdenCompra.java
    EstadoOrdenCompra.java           ← enum
  exception/
    OrdenCanceladaException.java
  repository/
    ProveedorRepository.java
    OrdenCompraRepository.java
  service/
    ProveedorService.java
    OrdenCompraService.java

src/main/resources/templates/
  proveedores/
    lista.html                       ← tabla con sec:authorize
    formulario.html                  ← alta + edición reutilizable
    confirmar-eliminar.html          ← confirmación de baja
  ordenes/
    lista.html                       ← tabla con botón Recibir
```

---

## Entregable

Al finalizar el Reto 7 el ERP Balmis dispone de:

- **Vista de Proveedores** accesible desde el navegador: listado, alta, edición, baja con confirmación y mensajes flash.
- **Vista de Órdenes de Compra**: listado con estados coloreados y botón "Recibir" que actualiza el stock (solo para ADMIN/MANAGER).
- **API REST de Compras**: `ProveedorRestController` + `OrdenCompraRestController` documentados en Swagger UI.
- **Módulo completo integrado** en el `SecurityConfig` existente: las rutas `/proveedores/**` y `/ordenes-compra/**` quedan protegidas por la cadena MVC (sesión HTTP).

> **Siguiente paso:** [Reto Final — Dashboard, RRHH y Presentación](/sge/retos/reto8-final)
