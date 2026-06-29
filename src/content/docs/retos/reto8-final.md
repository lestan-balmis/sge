---
title: Reto Final — Dashboard, RRHH y Presentación
description: UD7 — ERP Balmis completo con Dashboard de KPIs, módulo RRHH de empleados, navbar reutilizable y presentación final del proyecto
---

> **Conceptos teóricos:** `DashboardService` con agregación multi-repositorio, `@Value` para configuración, `@Query` personalizada, relación opcional `ManyToOne` entre `Empleado` y `Usuario`, fragmento `layout.html` con `sec:authentication`.  
> Consulta [UD7 — Módulos de Negocio Avanzados y Dashboard](/sge/spring/ud7) para los fundamentos teóricos completos.

## Duración

6 horas

## Objetivo

Cerrar el ERP Balmis con:

- **Parte A (2 h):** Dashboard de KPIs con vista Thymeleaf y endpoint JSON.
- **Parte B (2 h):** Módulo RRHH — CRUD completo de Empleados con relación opcional a `Usuario`.
- **Parte C (2 h):** Navbar reutilizable completa, limpieza y presentación final.

## Descripción del reto

Partiendo de `erpbalmis_7`, se añaden los dos últimos módulos del ERP Balmis:

1. **Dashboard** — agrega KPIs de todos los repositorios en una sola vista con tarjetas Bootstrap.
2. **RRHH** — CRUD de empleados vinculados opcionalmente a cuentas de usuario del sistema.

Al finalizar, el ERP Balmis estará completo: todas las rutas tienen vista Thymeleaf, todos los módulos tienen API REST y Swagger, y el `layout.html` muestra el menú completo con usuario autenticado y botón de cierre de sesión.

---

## Parte A — Dashboard de KPIs

### Paso A1 — `DashboardDTO` — record con todos los indicadores

Crea `DashboardDTO` en `dto/` como record Java:

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

### Paso A2 — Consultas personalizadas en los repositorios

Añade en `PedidoRepository`:

```java
// Suma el total de pedidos en estado FACTURADO
@Query("SELECT COALESCE(SUM(p.total), 0) FROM Pedido p WHERE p.estado = 'FACTURADO'")
BigDecimal sumTotalFacturado();
```

Añade en `ProductoRepository`:

```java
// Productos cuyo stock está por debajo del umbral y están activos
@Query("SELECT p FROM Producto p WHERE p.stock < :umbral AND p.activo = true")
List<Producto> findProductosConStockBajo(@Param("umbral") int umbral);
```

Añade en `OrdenCompraRepository` (necesario para generar el número de orden en el servicio):

```java
// Encuentra el último número de orden del día para incrementar la secuencia
@Query("SELECT MAX(o.numeroOrden) FROM OrdenCompra o WHERE o.numeroOrden LIKE CONCAT('OC-', :fecha, '%')")
String findMaxNumeroOrdenByFecha(@Param("fecha") String fecha);
```

### Paso A3 — `DashboardService` — agregación multi-repositorio

Crea `DashboardService` que inyecte los cinco repositorios principales:

```java
@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final EmpleadoRepository empleadoRepository;

    // Umbral de stock bajo, configurable en application.properties
    @Value("${erp.dashboard.umbral-stock-bajo:10}")
    private int umbralStockBajo;

    public DashboardDTO obtenerKpis() {
        // Clientes por tipo (TipoCliente.ACTIVO, PROSPECTO, INACTIVO)
        long clientesActivos    = clienteRepository.findByTipoCliente(TipoCliente.ACTIVO).size();
        long clientesProspectos = clienteRepository.findByTipoCliente(TipoCliente.PROSPECTO).size();
        long clientesInactivos  = clienteRepository.findByTipoCliente(TipoCliente.INACTIVO).size();

        // Pedidos agrupados por estado con Collectors.groupingBy
        Map<EstadoPedido, Long> pedidosPorEstado = pedidoRepository.findAll().stream()
                .collect(Collectors.groupingBy(Pedido::getEstado, Collectors.counting()));

        // Total facturado (null-safe)
        BigDecimal totalFacturado = pedidoRepository.sumTotalFacturado();
        if (totalFacturado == null) totalFacturado = BigDecimal.ZERO;

        // Productos con stock bajo
        List<ProductoDTO> productosStockBajo = productoRepository
                .findProductosConStockBajo(umbralStockBajo)
                .stream()
                .map(p -> new ProductoDTO(p.getId(), p.getReferencia(), p.getDescripcion(),
                        p.getPrecioVenta(), p.getPrecioCoste(), p.getStock(),
                        p.getFechaAlta(), p.getActivo()))
                .toList();

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

> El uso de `@Value("${erp.dashboard.umbral-stock-bajo:10}")` con valor por defecto `:10` hace que el umbral sea configurable sin romper la aplicación si la propiedad no está definida en `application.properties`.

### Paso A4 — `DashboardController` — vista y endpoint JSON

Crea `DashboardController` en `controller/`:

```java
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    // Vista Thymeleaf: GET /dashboard
    @GetMapping
    public String dashboard(Model model) {
        model.addAttribute("kpis", dashboardService.obtenerKpis());
        return "dashboard/index";
    }
}
```

Opcional: añade un endpoint JSON en `rest/DashboardRestController`:
```java
@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {
    @GetMapping
    public DashboardDTO obtenerKpis() {
        return dashboardService.obtenerKpis();
    }
}
```

### Paso A5 — Vista `dashboard/index.html`

Crea la plantilla con tarjetas Bootstrap organizadas en filas:

**Fila 1 — KPIs de Clientes (4 tarjetas):**
- Total clientes | Activos | Prospectos | Inactivos

**Fila 2 — KPIs de Pedidos y Ventas (4 tarjetas):**
- Total pedidos | Borradores | Confirmados | Total facturado (€)

**Fila 3 — Resumen general (3 tarjetas):**
- Total productos | Total proveedores | Total empleados

**Tabla — Productos con stock bajo:**
- Solo se muestra si `${not #lists.isEmpty(kpis.productosStockBajo())}`
- Columnas: Referencia, Descripción, Stock (badge rojo)

Fragmento clave del total facturado:

```html
<p class="display-6 fw-bold text-success mb-0">
    <span th:text="${#numbers.formatDecimal(kpis.totalFacturado(), 1, 2)}">0,00</span>
    <small class="fs-6">€</small>
</p>
```

Fragmento de acceso a pedidos por estado desde el mapa:

```html
<!-- Borradores -->
<p th:text="${kpis.pedidosPorEstado().getOrDefault(
    T(com.iesdoctorbalmis.spring.entity.EstadoPedido).BORRADOR, 0)}">0</p>
```

### Paso A6 — Configurar el umbral en `application.properties`

```properties
# Dashboard — umbral de stock bajo
erp.dashboard.umbral-stock-bajo=10
```

---

## Parte B — Módulo RRHH — Empleados

### Paso B1 — Entidad `Empleado` con relación opcional a `Usuario`

Crea la entidad `Empleado` en `entity/`:

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue` |
| `numeroEmpleado` | `String` | `@NotBlank`, único |
| `nombre` | `String` | `@NotBlank` |
| `apellidos` | `String` | `@NotBlank` |
| `cargo` | `String` | `@NotBlank` |
| `departamento` | `String` | `@NotBlank` |
| `email` | `String` | `@NotBlank @Email`, único |
| `fechaIncorporacion` | `LocalDate` | Opcional (se asigna `LocalDate.now()` si es null) |
| `activo` | `Boolean` | `true` por defecto |
| `usuario` | `Usuario` | `@ManyToOne(fetch=LAZY)` — **opcional** (puede ser `null`) |

La clave del diseño: la relación con `Usuario` es **opcional**. Puede existir un empleado sin cuenta de usuario y viceversa.

Crea `EmpleadoRequestDTO` con los campos con validación y el campo `usuarioId` (Long, opcional).

Crea `EmpleadoDTO` como record con todos los campos más `usuarioId` y `usuarioUsername` (ambos nullable si no hay usuario vinculado).

Crea `EmpleadoRepository` extendiendo `JpaRepository<Empleado, Long>` con:
```java
Optional<Empleado> findByEmail(String email);
```

### Paso B2 — `EmpleadoService`

Implementa `EmpleadoService` inyectando `EmpleadoRepository` y `UsuarioRepository`:

- `listarTodos()` → `List<EmpleadoDTO>`
- `buscarPorId(Long id)` → `EmpleadoDTO`
- `listarUsuariosDisponibles()` → `List<Usuario>` (para el `<select>` del formulario)
- `crear(EmpleadoRequestDTO)` → valida email único, asigna `fechaIncorporacion` y `activo=true`
- `actualizar(Long id, EmpleadoRequestDTO)` → valida email excluyendo el propio empleado
- `eliminar(Long id)` → lanza excepción si no existe

En el helper `aplicarCambios()`, la vinculación con `Usuario` es condicional:
```java
if (request.getUsuarioId() != null) {
    // Carga el usuario y lo asigna
    empleado.setUsuario(usuarioRepository.findById(request.getUsuarioId())
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario", request.getUsuarioId())));
} else {
    empleado.setUsuario(null);  // desvincula si se envía null
}
```

### Paso B3 — `EmpleadoController` (MVC) — CRUD + detalle

Crea `EmpleadoController` con `@Controller` y `@RequestMapping("/empleados")`.

Además de los 7 endpoints del CRUD estándar, añade el endpoint de detalle:

```java
@GetMapping("/{id}")
public String detalle(@PathVariable Long id, Model model) {
    model.addAttribute("empleado", empleadoService.buscarPorId(id));
    return "empleados/detalle";
}
```

> El endpoint `GET /empleados/{id}` existe **antes** que `GET /empleados/{id}/editar`. Spring MVC los diferencia por la presencia del segmento `/editar`.

Para los endpoints de alta y edición, pasa también la lista de usuarios al modelo:
```java
model.addAttribute("usuarios", empleadoService.listarUsuariosDisponibles());
```

### Paso B4 — Plantillas de Empleados

Crea en `templates/empleados/`:

**`lista.html`** — tabla con columnas: Nº Empleado, Nombre y Apellidos, Cargo, Departamento, Estado, Usuario vinculado, Acciones.

- Botón "+ Nuevo empleado": `sec:authorize="hasAnyRole('ADMIN','MANAGER')"`
- Enlace al detalle del empleado desde el nombre.
- Botones Editar y Eliminar con `sec:authorize` por rol.

**`formulario.html`** — formulario reutilizable con:
- Campos: `numeroEmpleado`, `nombre`, `apellidos`, `cargo`, `departamento`, `email`, `fechaIncorporacion` (tipo `date`), `activo` (checkbox).
- `<select>` para el usuario vinculado, poblado con `th:each` sobre `${usuarios}`:
```html
<select class="form-select" th:field="*{usuarioId}">
    <option value="">— Sin usuario vinculado —</option>
    <option th:each="u : ${usuarios}"
            th:value="${u.id}"
            th:text="${u.username} + ' (' + ${u.rol} + ')'"></option>
</select>
```

**`detalle.html`** — ficha completa del empleado con todos sus datos y el usuario vinculado (si existe).

**`confirmar-eliminar.html`** — confirmación de baja con nombre completo del empleado.

---

## Parte C — Navbar completa, limpieza y presentación

### Paso C1 — Actualizar `fragments/layout.html`

Actualiza el fragmento de layout para incluir todos los módulos en el menú:

```html
<ul class="navbar-nav me-auto">
    <li><a class="nav-link" th:href="@{/clientes}">Clientes</a></li>
    <li><a class="nav-link" th:href="@{/productos}">Productos</a></li>
    <li><a class="nav-link" th:href="@{/pedidos}">Pedidos</a></li>
    <li><a class="nav-link" th:href="@{/proveedores}">Proveedores</a></li>
    <li><a class="nav-link" th:href="@{/ordenes-compra}">Compras</a></li>
    <!-- Solo ADMIN y MANAGER ven el menú de Empleados -->
    <li><a class="nav-link" th:href="@{/empleados}"
           sec:authorize="hasAnyRole('ADMIN','MANAGER')">Empleados</a></li>
    <li><a class="nav-link" th:href="@{/dashboard}">Dashboard</a></li>
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
```

### Paso C2 — Revisar `import.sql` final

Asegúrate de que `import.sql` contiene datos suficientes para la demo:

- **3 usuarios**: `admin` (ADMIN), `manager` (MANAGER), `empleado` (EMPLEADO) — contraseñas con BCrypt.
- **5 clientes**: mezcla de ACTIVO, PROSPECTO e INACTIVO.
- **10 productos**: stocks variados (algunos por debajo del umbral de 10).
- **2 pedidos**: uno en BORRADOR, otro en CONFIRMADO o FACTURADO.
- **2 proveedores** y al menos **1 orden de compra** RECIBIDA.
- **3 empleados**: uno vinculado al usuario `admin`, otro al `manager`, el tercero sin usuario.

### Paso C3 — Actualizar `SecurityConfig` para las rutas nuevas

Verifica que las rutas `/dashboard/**` y `/empleados/**` están protegidas en la cadena MVC. No es necesario añadir nada si la regla `anyRequest().authenticated()` ya cubre todas las rutas no declaradas explícitamente.

### Paso C4 — Completar el `README.md`

Actualiza el `README.md` del proyecto con:

```markdown
# ERP Balmis

Mini ERP/CRM desarrollado con Spring Boot 4.0 + Thymeleaf + Spring Security + JWT.

## Requisitos
- Java 21+
- Maven 3.9+

## Ejecutar
```bash
./mvnw spring-boot:run
```
Acceder en: http://localhost:9000

## Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | ADMIN |
| manager | manager123 | MANAGER |
| empleado | empleado123 | EMPLEADO |

## API REST
- Swagger UI: http://localhost:9000/swagger-ui.html
- Login JWT: `POST /api/auth/login`

## Módulos
| Módulo | Vista | API REST |
|---|---|---|
| CRM (Clientes) | /clientes | /api/clientes |
| Ventas (Productos) | /productos | /api/productos |
| Ventas (Pedidos) | /pedidos | /api/pedidos |
| Compras (Proveedores) | /proveedores | /api/proveedores |
| Compras (Órdenes) | /ordenes-compra | /api/ordenes-compra |
| RRHH (Empleados) | /empleados | — |
| Dashboard | /dashboard | /api/dashboard |
```

---

## Presentación final

La presentación del ERP Balmis terminado sigue este guión de demo en vivo:

1. **Login**: iniciar sesión con `admin` → mostrar que el menú completo aparece.
2. **Demo por rol**: cerrar sesión, entrar como `empleado` → mostrar que los botones de edición/eliminación desaparecen.
3. **Dashboard**: navegar a `/dashboard` → mostrar las tarjetas de KPIs y la tabla de stock bajo.
4. **Ciclo de venta**:
   - Crear cliente nuevo desde el formulario.
   - Crear pedido con dos líneas de productos.
   - Confirmar el pedido → verificar que el stock disminuye.
5. **Ciclo de compra**:
   - Ver la lista de órdenes de compra.
   - Recibir una orden PENDIENTE → verificar que el stock aumenta.
6. **Comparación con Axelor**: mostrar el módulo CRM de Axelor junto al módulo Clientes del ERP Balmis → señalar las equivalencias.

### Comparativa final: Axelor vs ERP Balmis

| Funcionalidad | Axelor | ERP Balmis | Reto |
|---|---|---|---|
| Listados en pantalla | Automáticos | `@Controller` + `th:each` | Reto 2 |
| Formularios CRUD | Automáticos | `th:field`, `th:errors`, `BindingResult` | Retos 4, 5, 7 |
| Gestión de Clientes | Módulo CRM | `ClienteController` + `ClienteService` | Reto 4 |
| Ciclo Prospecto→Cliente | CRM workflow | `tipoCliente` + PATCH | Reto 4 |
| Catálogo + Pedidos | Inventario + Ventas | `Producto` + `Pedido` + workflow | Reto 5 |
| Login con formulario | Formulario Axelor | `login.html` + Spring Security | Reto 6 |
| Permisos por rol | Grupos de acceso | `sec:authorize="hasRole('ADMIN')"` | Reto 6 |
| JWT para API | — | Spring Security + jjwt | Reto 6 |
| Gestión de Proveedores | Módulo Compras | `ProveedorController` + formulario | Reto 7 |
| Órdenes de Compra + stock | Módulo Compras | `OrdenCompraService.recibirOrden()` | Reto 7 |
| Gestión de Empleados | Módulo RRHH | `EmpleadoController` + formulario | Reto Final |
| Dashboard KPIs | Jasper/BIRT | `dashboard/index.html` + `DashboardService` | Reto Final |
| Documentación API | — | Swagger UI en `/swagger-ui.html` | Reto 4 |

---

## Estructura de ficheros nueva en el Reto Final

```
src/main/java/com/iesdoctorbalmis/spring/
  controller/
    DashboardController.java         ← vista GET /dashboard
    EmpleadoController.java          ← MVC: CRUD + detalle empleados
  controller/rest/
    DashboardRestController.java     ← opcional: GET /api/dashboard
  dto/
    DashboardDTO.java                ← record con todos los KPIs
    EmpleadoDTO.java                 ← record de respuesta
    EmpleadoRequestDTO.java          ← formulario y body API
  entity/
    Empleado.java                    ← ManyToOne opcional a Usuario
  repository/
    EmpleadoRepository.java
  service/
    DashboardService.java
    EmpleadoService.java

src/main/resources/
  application.properties             ← + erp.dashboard.umbral-stock-bajo=10
  import.sql                         ← datos finales completos
  templates/
    dashboard/
      index.html                     ← vista de KPIs con tarjetas Bootstrap
    empleados/
      lista.html
      formulario.html                ← con <select> de usuarios
      detalle.html
      confirmar-eliminar.html
    fragments/
      layout.html                    ← navbar completa con sec:authentication
```

---

## Entregable Final

El ERP Balmis completo incluye:

- **Todas las vistas Thymeleaf**: clientes, productos, pedidos, proveedores, órdenes, empleados, dashboard y login.
- **API REST documentada** en Swagger UI (`/swagger-ui.html`) con todos los módulos.
- **Spring Security dual**: sesión HTTP para vistas MVC + JWT para la API REST.
- **Roles visibles** en el navegador: botones que aparecen/desaparecen según el rol autenticado.
- **Dashboard con KPIs** en tiempo real agregados de todos los repositorios.
- **Módulo RRHH** con empleados vinculados opcionalmente a usuarios del sistema.
- **Navbar reutilizable** con usuario autenticado, rol y botón de cierre de sesión.
- **README.md** completo con instrucciones de arranque, usuarios de prueba y tabla de endpoints.
