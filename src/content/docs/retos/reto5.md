---
title: Reto 5 — Las Ventas
description: UD6 — Módulo Ventas con CRUD de Productos, workflow de Pedidos y control de stock
---

> **Conceptos teóricos:** Patrones REST avanzados, relaciones JPA OneToMany/ManyToOne, validación en cascada y workflows de estados.
> Consulta [UD6 — El Módulo de Ventas](/sge/spring/ud6) para los fundamentos teóricos.

## Duración

8 horas

## Objetivo

Implementar el **Módulo de Ventas**: CRUD completo de Productos con control de stock y un ciclo de Pedidos con workflow de estados.

## Descripción del reto

Partiendo de `erpbalmis_4`, se añade la gestión completa del catálogo de productos y el ciclo de vida de los pedidos de venta. El sistema controla automáticamente el stock al confirmar pedidos y valida que no se puedan confirmar pedidos sin stock suficiente.

## Entidades nuevas

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

| DTO | Uso |
|-----|-----|
| `ProductoDTO` | Respuesta de la API de productos |
| `ProductoRequestDTO` | Creación / actualización de producto |
| `LineaPedidoDTO` | Línea de pedido en la respuesta |
| `PedidoDTO` | Respuesta completa del pedido con sus líneas |
| `LineaPedidoRequestDTO` | Línea en la petición de creación |
| `PedidoRequestDTO` | Petición de creación de pedido |

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
src/main/java/com/iesdoctorbalmis/spring/
├── entity/
│   ├── EstadoPedido.java        ← enum nuevo
│   ├── Pedido.java              ← entidad nueva
│   ├── LineaPedido.java         ← entidad nueva
│   ├── Producto.java            (sin cambios)
│   └── Cliente.java             (sin cambios)
├── dto/
│   ├── ProductoDTO.java         ← nuevo
│   ├── ProductoRequestDTO.java  ← nuevo
│   ├── PedidoDTO.java           ← nuevo
│   ├── LineaPedidoDTO.java      ← nuevo
│   ├── PedidoRequestDTO.java    ← nuevo
│   └── LineaPedidoRequestDTO.java ← nuevo
├── exception/
│   ├── StockInsuficienteException.java         ← nueva
│   ├── TransicionEstadoInvalidaException.java  ← nueva
│   └── GlobalExceptionHandler.java             ← actualizado (+422, +409)
├── repository/
│   ├── PedidoRepository.java      ← nuevo
│   └── LineaPedidoRepository.java ← nuevo
├── service/
│   ├── ProductoService.java   ← nuevo
│   └── PedidoService.java     ← nuevo
└── controller/rest/
    ├── ProductoRestController.java  ← reescrito (CRUD completo)
    └── PedidoRestController.java    ← nuevo
```

