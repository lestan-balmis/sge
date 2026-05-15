---
title: "UD6 — Formularios, Ventas y Seguridad"
description: Formularios MVC con Thymeleaf (Reto 4), relaciones JPA y workflows de estado (Reto 5), y Spring Security con sesión + JWT (Reto 6). Unidad teórica completa de la 2ª evaluación.
---

### UD6 — Formularios Web con Thymeleaf
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 10 horas  
> **Herramientas:** Spring MVC, Thymeleaf, Bean Validation, Bootstrap  
> **Prerequisito:** [UD5 — Spring MVC, REST y Arquitectura por Capas](/sge/spring/ud5)  
> **Objetivo:** Añadir formularios HTML completos para alta, edición y baja de registros; integrar Bean Validation en la capa MVC; y gestionar el flujo POST-Redirect-GET con mensajes de confirmación.

---

## Índice

1. [De listas a formularios: el CRUD desde el navegador](#1-de-listas-a-formularios-el-crud-desde-el-navegador)
2. [th:object y th:field — enlazar formulario con DTO](#2-thobject-y-thfield--enlazar-formulario-con-dto)
3. [th:errors y #fields — mostrar errores de validación](#3-therrors-y-fields--mostrar-errores-de-validación)
4. [@Valid + BindingResult en @Controller](#4-valid--bindingresult-en-controller)
5. [RedirectAttributes y el patrón POST-Redirect-GET](#5-redirectattributes-y-el-patrón-post-redirect-get)
6. [Errores de negocio en formularios: rejectValue](#6-errores-de-negocio-en-formularios-rejectvalue)
7. [Formulario reutilizable para alta y edición](#7-formulario-reutilizable-para-alta-y-edición)
8. [Confirmación de baja con POST](#8-confirmación-de-baja-con-post)
9. [🎯 PAUSA: Aquí puedes completar el **Reto 4**](#9--pausa-aquí-puedes-completar-el-reto-4)

---

## 1. De listas a formularios: el CRUD desde el navegador

En la UD5 aprendiste a mostrar listas de datos en el navegador. En esta unidad das el siguiente paso: permitir que el usuario **cree, edite y elimine** registros directamente desde el navegador, sin necesidad de Postman ni Swagger.

### El CRUD web completo

| URL | Método | Función |
|---|---|---|
| `GET /clientes` | GET | Mostrar lista de clientes |
| `GET /clientes/nuevo` | GET | Mostrar formulario de alta en blanco |
| `POST /clientes/nuevo` | POST | Procesar datos del formulario y crear |
| `GET /clientes/{id}/editar` | GET | Mostrar formulario con datos del cliente |
| `POST /clientes/{id}/editar` | POST | Procesar cambios y actualizar |
| `GET /clientes/{id}/eliminar` | GET | Mostrar página de confirmación de baja |
| `POST /clientes/{id}/eliminar` | POST | Confirmar y ejecutar la baja |

> Nótese que tanto la creación como la edición y la baja usan dos endpoints: uno `GET` para mostrar el formulario/confirmación y uno `POST` para procesar la acción. Este es el patrón estándar de formularios web.

### ¿Por qué POST para eliminar?

Los navegadores solo envían formularios con `GET` o `POST`. Un simple enlace `<a href="/clientes/1/eliminar">` usaría `GET`, lo que significa que:
- Un rastreador web podría borrar datos al seguir los enlaces.
- El navegador podría precargar la URL y borrar accidentalmente un registro.

Por eso, la baja siempre se confirma con un formulario `POST`.

---

## 2. `th:object` y `th:field` — enlazar formulario con DTO

Thymeleaf proporciona atributos especiales para vincular un formulario HTML con un objeto Java (el DTO). Esto evita escribir `name="nombre"` y `value="${form.nombre}"` manualmente.

### `th:object` — el objeto del formulario

Se declara en la etiqueta `<form>`. A partir de ahí, todos los campos del formulario pueden acceder al objeto con la sintaxis `*{campo}`:

```html
<form th:action="@{/clientes/nuevo}"
      th:object="${clienteForm}"
      method="post">

  <!-- Dentro del formulario, *{nombre} equivale a ${clienteForm.nombre} -->
</form>
```

El controlador debe poner el objeto en el `Model` con el mismo nombre:

```java
@GetMapping("/nuevo")
public String formularioNuevo(Model model) {
    model.addAttribute("clienteForm", new ClienteRequestDTO());  // ← mismo nombre
    return "clientes/formulario";
}
```

### `th:field` — genera id, name y value automáticamente

`th:field="*{nombre}"` es equivalente a escribir los tres atributos a mano:

```html
<!-- Con th:field -->
<input type="text" th:field="*{nombre}" class="form-control" />

<!-- Equivale a: -->
<input type="text" id="nombre" name="nombre" value="Juan García" class="form-control" />
```

Cuando el formulario es de **edición**, Thymeleaf rellena el `value` con el valor actual del DTO. Cuando es de **alta**, el value queda vacío (porque el DTO está recién creado).

### `th:field` con `<select>` — enums

Para un campo de tipo enum, iteramos los valores con `th:each`:

```html
<select class="form-select" th:field="*{tipoCliente}">
    <option value="">-- Selecciona --</option>
    <option th:each="tipo : ${tiposCliente}"
            th:value="${tipo}"
            th:text="${tipo}"></option>
</select>
```

`th:field` se encarga de marcar la opción seleccionada (`selected`) automáticamente al editar.

---

## 3. `th:errors` y `#fields` — mostrar errores de validación

Cuando Bean Validation detecta un error en un campo, Thymeleaf puede mostrarlo inline junto al campo:

```html
<div class="col-md-8">
    <label class="form-label">Nombre <span class="text-danger">*</span></label>

    <!-- th:classappend añade 'is-invalid' si hay error en 'nombre' -->
    <input type="text"
           class="form-control"
           th:field="*{nombre}"
           th:classappend="${#fields.hasErrors('nombre')} ? ' is-invalid'" />

    <!-- th:errors muestra el mensaje del error -->
    <div class="invalid-feedback" th:errors="*{nombre}">Error.</div>
</div>
```

### `#fields` — objeto utilitario de Thymeleaf

`#fields` es un objeto especial de Thymeleaf para trabajar con errores de validación:

| Expresión | Significado |
|---|---|
| `#fields.hasErrors('campo')` | `true` si el campo tiene al menos un error |
| `#fields.errors('campo')` | Lista de mensajes de error del campo |
| `#fields.hasAnyErrors()` | `true` si el formulario tiene cualquier error |

### Clase Bootstrap `is-invalid`

Bootstrap 5 usa la clase CSS `is-invalid` para aplicar el borde rojo al input y mostrar el `div.invalid-feedback`. La combinación `th:classappend` añade la clase solo cuando hay error, sin reemplazar las clases existentes:

```html
th:classappend="${#fields.hasErrors('email')} ? ' is-invalid'"
<!-- resultado: class="form-control is-invalid" -->
```

---

## 4. `@Valid` + `BindingResult` en `@Controller`

En los controladores MVC, la validación funciona igual que en REST (`@Valid`), pero con una diferencia crucial: **si hay errores no lanzamos una excepción**, los gestionamos con `BindingResult` para volver a mostrar el formulario con los errores marcados.

```java
@PostMapping("/nuevo")
public String guardarNuevo(
        @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
        BindingResult br,          // ← captura los errores de validación
        Model model,
        RedirectAttributes ra) {

    if (br.hasErrors()) {          // ← si hay errores, redibujamos el formulario
        model.addAttribute("modoEdicion", false);
        model.addAttribute("tiposCliente", TipoCliente.values());
        return "clientes/formulario";  // ← NOT redirect, devolvemos la vista directamente
    }

    // Si no hay errores, guardamos y redirigimos
    clienteService.crear(form);
    ra.addFlashAttribute("mensajeExito", "Cliente creado correctamente.");
    return "redirect:/clientes";
}
```

### Regla crítica: orden de parámetros

`BindingResult` **debe ir inmediatamente después** del objeto `@Valid`. Si no, Spring lanza `MethodArgumentNotValidException` en lugar de dejar que el controlador gestione los errores:

```java
// ✅ Correcto
public String guardar(
        @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
        BindingResult br,    // ← justo después del @Valid
        Model model, ...) { ... }

// ❌ Incorrecto — Spring lanzará excepción
public String guardar(
        @Valid @ModelAttribute("clienteForm") ClienteRequestDTO form,
        Model model,
        BindingResult br,    // ← separado del @Valid
        ...) { ... }
```

### Diferencia con REST

| Capa | Con errores de validación | Sin BindingResult |
|---|---|---|
| `@RestController` | 400 Bad Request (JSON automático vía `@RestControllerAdvice`) | No necesita `BindingResult` |
| `@Controller` (MVC) | Vuelve a la vista con errores marcados | Lanzaría excepción |

---

## 5. `RedirectAttributes` y el patrón POST-Redirect-GET

### El problema del doble envío

Cuando el usuario envía un formulario `POST` y el servidor responde con `200 OK` devolviendo directamente la página de resultado, al recargar el navegador vuelve a enviar el `POST`. Esto puede crear duplicados o ejecutar dos veces la misma acción.

### La solución: POST-Redirect-GET

La solución estándar es que tras un `POST` exitoso, el servidor devuelva una **redirección** (`302 Found`) en lugar de HTML directamente. El navegador hace entonces un `GET` a la URL indicada:

```
Browser → POST /clientes/nuevo   → Servidor guarda datos
Servidor → 302 Redirect /clientes
Browser → GET /clientes          → Servidor devuelve HTML de la lista
```

Si el usuario recarga la página ahora, solo repite el `GET`, no el `POST`.

### `RedirectAttributes` — mensajes flash

Tras la redirección el `Model` se pierde. Para pasar un mensaje de éxito al siguiente `GET` usamos **flash attributes**, que Spring almacena en sesión hasta la siguiente petición:

```java
@PostMapping("/nuevo")
public String guardarNuevo(..., RedirectAttributes ra) {
    clienteService.crear(form);

    // El mensaje se guarda en sesión hasta el próximo GET
    ra.addFlashAttribute("mensajeExito", "Cliente creado correctamente.");
    return "redirect:/clientes";  // ← redirección
}

// En el GET /clientes, el flash attribute ya está disponible en ${mensajeExito}
@GetMapping
public String lista(Model model) {
    model.addAttribute("clientes", clienteService.listarTodos());
    return "clientes/lista";  // ${mensajeExito} llega automáticamente vía flash
}
```

### Mostrar el mensaje en la plantilla

```html
<!-- En clientes/lista.html -->
<div th:if="${mensajeExito}"
     class="alert alert-success alert-dismissible fade show"
     role="alert">
    <span th:text="${mensajeExito}"></span>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
```

---

## 6. Errores de negocio en formularios: `rejectValue`

Bean Validation comprueba formato y presencia (`@NotBlank`, `@Email`...), pero no puede verificar reglas de negocio como "el email ya existe en la base de datos". Para eso capturamos la excepción de negocio y la añadimos manualmente a `BindingResult`:

```java
try {
    clienteService.crear(form);
    ra.addFlashAttribute("mensajeExito", "Cliente creado correctamente.");
} catch (EmailDuplicadoException e) {
    // Añadimos el error al campo 'email' del formulario
    br.rejectValue(
        "email",          // nombre del campo
        "email.duplicado",// código del error (para i18n)
        e.getMessage()    // mensaje visible al usuario
    );
    // Devolvemos el formulario con el error añadido
    model.addAttribute("modoEdicion", false);
    model.addAttribute("tiposCliente", TipoCliente.values());
    return "clientes/formulario";
}
return "redirect:/clientes";
```

El error añadido con `rejectValue` se muestra exactamente igual que los errores de Bean Validation: el `th:errors="*{email}"` lo recoge y Bootstrap aplica `is-invalid`.

---

## 7. Formulario reutilizable para alta y edición

En lugar de crear dos plantillas separadas (`formulario-nuevo.html` y `formulario-editar.html`), usamos **una sola plantilla** que adapta su comportamiento según el modo:

```html
<!-- clientes/formulario.html -->
<form th:action="${modoEdicion}
                  ? @{/clientes/{id}/editar(id=${clienteId})}
                  : @{/clientes/nuevo}"
      th:object="${clienteForm}"
      method="post"
      novalidate>

    <h1 th:text="${modoEdicion} ? 'Editar cliente' : 'Nuevo cliente'"></h1>

    <!-- Campos del formulario -->
    <div class="col-md-8">
        <label class="form-label fw-semibold">
            Nombre <span class="text-danger">*</span>
        </label>
        <input type="text"
               class="form-control"
               th:field="*{nombre}"
               th:classappend="${#fields.hasErrors('nombre')} ? ' is-invalid'"
               placeholder="Nombre completo o razón social" />
        <div class="invalid-feedback" th:errors="*{nombre}">Error.</div>
    </div>

    <!-- Botón dinámico -->
    <button type="submit" class="btn btn-primary"
            th:text="${modoEdicion} ? 'Guardar cambios' : 'Crear cliente'">
    </button>
    <a th:href="@{/clientes}" class="btn btn-outline-secondary">Cancelar</a>
</form>
```

### Los controladores pasan `modoEdicion` al modelo

```java
// Alta — modoEdicion = false, DTO vacío
@GetMapping("/nuevo")
public String formularioNuevo(Model model) {
    model.addAttribute("clienteForm", new ClienteRequestDTO());
    model.addAttribute("modoEdicion", false);
    model.addAttribute("tiposCliente", TipoCliente.values());
    return "clientes/formulario";
}

// Edición — modoEdicion = true, DTO relleno con datos actuales
@GetMapping("/{id}/editar")
public String formularioEditar(@PathVariable Long id, Model model) {
    ClienteDTO cliente = clienteService.buscarPorId(id);
    ClienteRequestDTO form = new ClienteRequestDTO();
    form.setNombre(cliente.getNombre());
    form.setEmail(cliente.getEmail());
    // ... rellenar todos los campos
    model.addAttribute("clienteForm", form);
    model.addAttribute("clienteId", id);    // para la URL de la acción
    model.addAttribute("modoEdicion", true);
    model.addAttribute("tiposCliente", TipoCliente.values());
    return "clientes/formulario";
}
```

> **Nota:** No se puede usar directamente `ClienteDTO` (el de respuesta) como objeto del formulario porque tiene campos de solo lectura (`id`, `fechaAlta`). Se rellena un `ClienteRequestDTO` nuevo con los datos del DTO de respuesta.

---

## 8. Confirmación de baja con POST

La eliminación necesita dos pasos: mostrar una página de confirmación y ejecutar la baja:

```java
// Paso 1: Mostrar confirmación
@GetMapping("/{id}/eliminar")
public String confirmarEliminar(@PathVariable Long id, Model model) {
    model.addAttribute("cliente", clienteService.buscarPorId(id));
    return "clientes/eliminar";
}

// Paso 2: Ejecutar la baja
@PostMapping("/{id}/eliminar")
public String eliminar(@PathVariable Long id, RedirectAttributes ra) {
    ClienteDTO cliente = clienteService.buscarPorId(id);
    clienteService.eliminar(id);
    ra.addFlashAttribute("mensajeExito", "Cliente '" + cliente.getNombre() + "' eliminado correctamente.");
    return "redirect:/clientes";
}
```

La plantilla de confirmación muestra los datos del cliente y un formulario `POST`:

```html
<!-- clientes/eliminar.html -->
<div class="alert alert-warning">
    ¿Estás seguro de que quieres eliminar el cliente
    <strong th:text="${cliente.nombre}"></strong>?
</div>

<!-- Solo se ejecuta si el usuario confirma explícitamente -->
<form th:action="@{/clientes/{id}/eliminar(id=${cliente.id})}" method="post">
    <button type="submit" class="btn btn-danger">Sí, eliminar</button>
    <a th:href="@{/clientes}" class="btn btn-outline-secondary">Cancelar</a>
</form>
```

---

## 9. 🎯 PAUSA: Aquí puedes completar el **Reto 4**

Con la teoría de formularios MVC ya tienes todas las herramientas para implementar el CRUD de clientes desde el navegador.

> **[→ Ir al Reto 4: El CRM](/sge/retos/reto4)**
>
> **Parte UD5** (si no la has hecho ya):
> - Crear `ClienteDTO` y `ClienteRequestDTO`
> - Implementar `ClienteService` con validación de email único
> - CRUD completo REST: GET, POST, PUT, PATCH, DELETE
> - `GlobalExceptionHandler` con respuestas JSON para 404, 400 y 409
> - Integrar Swagger UI con SpringDoc
>
> **Parte UD6** (formularios MVC):
> - Completar `ClienteController` con endpoints de alta, edición y baja
> - Crear `clientes/formulario.html` con `th:field` y `th:errors`
> - Actualizar `clientes/lista.html` con botones Nuevo, Editar, Eliminar
> - Crear `clientes/eliminar.html` con confirmación POST

---

## Resumen: Formularios MVC vs REST

| Aspecto | REST (`@RestController`) | MVC con formularios (`@Controller`) |
|---|---|---|
| **Consume** | Postman, apps móviles, SPA | Navegador web (HTML forms) |
| **Validación con errores** | 400 JSON automático | Vuelve a la vista con errores marcados |
| **BindingResult** | No necesario | Obligatorio después del `@Valid` |
| **Tras éxito** | `ResponseEntity` con cuerpo | `redirect:` (POST-Redirect-GET) |
| **Mensajes entre requests** | No aplica | `RedirectAttributes.addFlashAttribute()` |
| **Errores de negocio** | Excepción → `@RestControllerAdvice` | `BindingResult.rejectValue()` |
| **Comparten** | El mismo `@Service` y los mismos DTOs |  |

---

## 🎯 PAUSA: Aquí puedes completar el **Reto 5**

Con los formularios MVC de la UD6 y la arquitectura REST de la UD5 ya tienes todo lo necesario para implementar el módulo de ventas.

> **[→ Ir al Reto 5: Las Ventas](/sge/retos/reto5)**
>
> - Crear `ProductoFormDTO` y `PedidoFormDTO` (`@Data` mutable para form-binding)
> - Implementar `ProductoController` CRUD MVC
> - Implementar `PedidoController` con vistas lista, formulario y detalle
> - API REST de Productos y Pedidos con control de stock
> - Workflow de estados `BORRADOR → CONFIRMADO → ENVIADO → FACTURADO`

---

## 10. Relaciones JPA: `@OneToMany` y `@ManyToOne`

En el Reto 5 se introducen relaciones entre entidades. Un `Pedido` tiene muchas `LineaPedido`, y cada `LineaPedido` pertenece a un `Pedido`.

### `@ManyToOne` — el lado «muchos»

Es la anotación más habitual. La entidad que tiene la clave foránea la declara con `@ManyToOne`:

```java
@Entity
public class LineaPedido {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    private Integer cantidad;
    private BigDecimal precioUnitario; // snapshot del precio al crear la línea
    private BigDecimal subtotal;
}
```

> **`fetch = FetchType.LAZY`** — por defecto JPA carga las relaciones en modo EAGER (carga inmediata), lo que puede generar consultas innecesarias. Con LAZY la relación se carga solo cuando se accede al campo.

### `@OneToMany` — el lado «uno»

En la entidad «padre» se declara la lista de hijos con `@OneToMany`. La opción `cascade = ALL` indica que las operaciones (guardar, eliminar) se propagan a los hijos, y `orphanRemoval = true` borra automáticamente las líneas que se eliminen de la lista:

```java
@Entity
public class Pedido {

    @OneToMany(
        mappedBy = "pedido",       // ← nombre del campo @ManyToOne en LineaPedido
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private List<LineaPedido> lineas = new ArrayList<>();
}
```

> **`mappedBy`** indica que el «dueño» de la relación es `LineaPedido.pedido`. Sin él JPA crearía una tabla intermedia de unión innecesaria.

### Snapshot de precios

En un sistema de ventas, el precio del producto puede cambiar en el futuro. Para conservar el precio que tenía **en el momento de la venta**, se guarda como `precioUnitario` en `LineaPedido`:

```java
// Al crear la línea se copia el precio actual del producto
lineaPedido.setPrecioUnitario(producto.getPrecioVenta());
lineaPedido.setSubtotal(producto.getPrecioVenta()
        .multiply(BigDecimal.valueOf(cantidad)));
```

Así el histórico de pedidos no se ve afectado por cambios de precio posteriores.

---

## 11. Workflow de estados con enums

Un pedido no salta directamente de «creado» a «facturado». Atraviesa una secuencia de estados:

```
BORRADOR → CONFIRMADO → ENVIADO → FACTURADO
```

En Java se modela con un `enum`:

```java
public enum EstadoPedido {
    BORRADOR, CONFIRMADO, ENVIADO, FACTURADO
}
```

El servicio valida que la transición es legal antes de cambiar el estado:

```java
public PedidoDTO actualizarEstado(Long id, EstadoPedido nuevoEstado) {
    Pedido pedido = pedidoRepository.findById(id).orElseThrow(...);

    // Solo se permiten transiciones hacia adelante
    if (nuevoEstado.ordinal() <= pedido.getEstado().ordinal()) {
        throw new TransicionEstadoInvalidaException(
            "No se puede pasar de " + pedido.getEstado() + " a " + nuevoEstado);
    }
    pedido.setEstado(nuevoEstado);
    return toDTO(pedidoRepository.save(pedido));
}
```

### Control de stock al confirmar

El stock solo se descuenta cuando el pedido pasa de `BORRADOR` a `CONFIRMADO`. La lógica tiene dos fases para garantizar la consistencia:

```java
@Transactional
public PedidoDTO confirmar(Long id) {
    Pedido pedido = pedidoRepository.findById(id).orElseThrow(...);

    // Fase 1: validar TODO el stock antes de modificar nada
    for (LineaPedido linea : pedido.getLineas()) {
        Producto p = linea.getProducto();
        if (p.getStock() < linea.getCantidad()) {
            throw new StockInsuficienteException(
                "Stock insuficiente para '" + p.getReferencia() +
                "': disponible " + p.getStock() +
                ", solicitado " + linea.getCantidad());
        }
    }

    // Fase 2: descontar stock solo si toda la validación pasa
    for (LineaPedido linea : pedido.getLineas()) {
        Producto p = linea.getProducto();
        p.setStock(p.getStock() - linea.getCantidad());
        productoRepository.save(p);
    }

    pedido.setEstado(EstadoPedido.CONFIRMADO);
    pedido.setFechaConfirmacion(LocalDate.now());
    return toDTO(pedidoRepository.save(pedido));
}
```

> **`@Transactional`** garantiza que si falla algún paso, **ningún cambio se persiste**. O todo se guarda, o nada. Si lanzamos `StockInsuficienteException` en la Fase 1, el stock nunca se modifica.

---

## 12. Seguridad en aplicaciones web: conceptos fundamentales

### Autenticación vs. Autorización

Son dos conceptos distintos que a menudo se confunden:

| Concepto | Pregunta | Ejemplo |
|----------|----------|---------|
| **Autenticación** | ¿Quién eres? | Introducir usuario y contraseña |
| **Autorización** | ¿Qué puedes hacer? | Solo ADMIN puede eliminar registros |

Primero se autentica (identidad), luego se autoriza (permisos). Sin autenticación no puede haber autorización.

### El modelo de seguridad de Spring Security

Spring Security actúa como una **cadena de filtros** (`FilterChain`) que intercepta cada petición HTTP **antes** de que llegue al controlador. Si la petición no supera los filtros, el controlador nunca se ejecuta.

```
Petición HTTP
    ↓
[Filtro 1: extrae token/sesión]
    ↓
[Filtro 2: valida credenciales]
    ↓
[Filtro 3: comprueba permisos]
    ↓
Controlador (Spring MVC)
    ↓
Respuesta HTTP
```

---

## 13. Sesión HTTP vs. JWT

Existen dos estrategias principales para mantener la identidad del usuario entre peticiones:

### Sesión HTTP (stateful)

El servidor guarda en memoria la información del usuario. El navegador recibe una **cookie de sesión** (`JSESSIONID`) y la envía automáticamente en cada petición:

```
1. POST /login {username, password}
   → Servidor valida, crea sesión, devuelve cookie JSESSIONID=abc123

2. GET /clientes
   Cookie: JSESSIONID=abc123
   → Servidor busca la sesión abc123, encuentra al usuario, devuelve datos
```

**Ventajas:** Simple, gestión automática de expiración, fácil de invalidar (logout).  
**Desventajas:** Escala mal (el servidor debe guardar todas las sesiones activas).

### JWT — JSON Web Token (stateless)

El servidor **no guarda nada**. En su lugar, genera un **token firmado** que el cliente incluye en cada petición:

```
1. POST /api/auth/login {username, password}
   → Servidor valida y devuelve token: eyJhbGciOiJIUzI1NiJ9...

2. GET /api/clientes
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
   → Servidor valida la firma del token, extrae el usuario, devuelve datos
```

Un JWT tiene tres partes separadas por `.`:

| Parte | Contenido | Ejemplo |
|-------|-----------|--------|
| **Header** | Algoritmo de firma | `{"alg": "HS256"}` |
| **Payload** | Datos del usuario (claims) | `{"sub": "admin", "roles": ["ROLE_ADMIN"]}` |
| **Signature** | HMAC del header+payload con la clave secreta | `HMAC-SHA256(...)` |

> **El payload no está cifrado**, solo firmado en Base64. No almacenes datos sensibles en el token (contraseñas, etc.).

**Ventajas:** Escala perfectamente (stateless), ideal para APIs consumidas por apps móviles o SPA.  
**Desventajas:** No se puede invalidar un token antes de que expire (sin un almacén de tokens revocados).

### ¿Cuándo usar cada uno?

| Escenario | Estrategia recomendada |
|-----------|------------------------|
| Vistas HTML en navegador (Thymeleaf) | Sesión HTTP |
| API REST consumida por Postman/app móvil | JWT |
| Arquitectura dual (ERP Balmis) | **Ambas** con cadenas independientes |

---

## 14. BCrypt y almacenamiento seguro de contraseñas

**Nunca** se almacenan contraseñas en texto claro. Si la base de datos se filtra, las contraseñas quedan expuestas. La solución es almacenar el **hash** de la contraseña.

### ¿Por qué BCrypt y no MD5/SHA?

MD5 y SHA son algoritmos rápidos, diseñados para integridad de datos. Un atacante puede probar miles de millones de combinaciones por segundo (*brute force*).

BCrypt es deliberadamente **lento** y añade una cadena aleatoria (**salt**) a cada hash:

```
admin123 + salt_aleatorio → $2a$10$N9qo8uLO...
admin123 + otro_salt     → $2a$10$wSRJzF8k...
```

Dos contraseñas iguales producen hashes **diferentes** porque el salt es distinto. Esto imposibilita las tablas *rainbow*.

### `BCryptPasswordEncoder` en Spring

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(); // factor de coste 10 por defecto
}

// Codificar al guardar el usuario:
String hash = passwordEncoder.encode("admin123");
// → "$2a$10$..."

// Verificar al hacer login (Spring lo hace internamente):
boolean valido = passwordEncoder.matches("admin123", hash);
// → true
```

> Spring Security llama a `passwordEncoder.matches()` automáticamente durante la autenticación. No necesitas verificar la contraseña manualmente.

---

## 15. `UserDetailsService` y `DaoAuthenticationProvider`

Spring Security delega la carga del usuario en la interfaz `UserDetailsService`:

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username));

        if (!usuario.isActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        // Spring Security espera el prefijo ROLE_ para hasRole()
        String autoridad = "ROLE_" + usuario.getRol().name();

        return User.builder()
                .username(usuario.getUsername())
                .password(usuario.getPassword()) // hash BCrypt de la BD
                .authorities(List.of(new SimpleGrantedAuthority(autoridad)))
                .build();
    }
}
```

`DaoAuthenticationProvider` conecta el `UserDetailsService` con el `PasswordEncoder` para verificar las credenciales:

```java
@Bean
public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
}
```

Flujo interno cuando el usuario envía el formulario de login:

```
POST /login {username=admin, password=admin123}
    ↓
UsernamePasswordAuthenticationFilter
    ↓
DaoAuthenticationProvider.authenticate()
    ↓
UserDetailsServiceImpl.loadUserByUsername("admin")  → carga Usuario de la BD
    ↓
passwordEncoder.matches("admin123", hash_de_bd)     → true
    ↓
Autenticación correcta → sesión creada, redirección a /
```

---

## 16. `sec:authorize` en Thymeleaf

La dependencia `thymeleaf-extras-springsecurity6` añade atributos especiales a los templates para mostrar u ocultar elementos según el estado de autenticación:

```html
<!-- Namespace obligatorio en la etiqueta <html> -->
<html xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
```

### Expresiones más habituales

| Expresión | Cuándo se muestra el elemento |
|-----------|-------------------------------|
| `sec:authorize="isAuthenticated()"` | El usuario ha iniciado sesión |
| `sec:authorize="!isAuthenticated()"` | El usuario NO ha iniciado sesión |
| `sec:authorize="hasRole('ADMIN')"` | El usuario tiene rol ADMIN |
| `sec:authorize="hasAnyRole('ADMIN','MANAGER')"` | Tiene ADMIN o MANAGER |
| `sec:authentication="name"` | Renderiza el nombre del usuario actual |

### Ejemplo en la navbar

```html
<!-- Menú visible solo tras autenticarse -->
<ul class="navbar-nav me-auto" sec:authorize="isAuthenticated()">
    <li class="nav-item"><a th:href="@{/clientes}">Clientes</a></li>
    <li class="nav-item"><a th:href="@{/pedidos}">Pedidos</a></li>
</ul>

<!-- Botón de login cuando NO hay sesión -->
<a th:href="@{/login}" sec:authorize="!isAuthenticated()">Iniciar sesión</a>

<!-- Nombre del usuario y logout cuando SÍ hay sesión -->
<div sec:authorize="isAuthenticated()">
    Hola, <strong sec:authentication="name"></strong>
    <form th:action="@{/logout}" method="post">
        <button type="submit">Cerrar sesión</button>
    </form>
</div>
```

### `sec:authorize` en botones de acción

```html
<!-- Solo ADMIN y MANAGER crean / editan -->
<a th:href="@{/clientes/nuevo}"
   sec:authorize="hasAnyRole('ADMIN','MANAGER')">+ Nuevo cliente</a>

<!-- Solo ADMIN elimina -->
<a th:href="@{/clientes/{id}/eliminar(id=${c.id})}"
   sec:authorize="hasRole('ADMIN')">Eliminar</a>
```

> **Importante:** `sec:authorize` **oculta el elemento HTML** para mejorar la UX, pero **no protege el endpoint** en el servidor. La protección real la hace `SecurityConfig`. Ambas capas son necesarias y complementarias.

---

## 🎯 PAUSA: Aquí puedes completar el **Reto 6**

Con la teoría de seguridad ya tienes las bases para implementar la autenticación y el control de acceso por roles en el ERP Balmis.

> **[→ Ir al Reto 6: La Seguridad](/sge/retos/reto6)**
>
> - Crear `Usuario` entity, `RolUsuario` enum, `UsuarioRepository`
> - Implementar `UserDetailsServiceImpl`
> - Crear `auth/login.html` (standalone, sin layout)
> - Configurar `SecurityConfig` con arquitectura dual: sesión para MVC + JWT para `/api/**`
> - Añadir `sec:authorize` a `layout.html`, `clientes/lista.html` y `productos/lista.html`
> - Implementar `JwtUtil`, `JwtAuthFilter` y `AuthController`
> - Crear `DataLoader` para inicializar usuarios con BCrypt correcto

---

## Resumen: Sesión HTTP vs. JWT vs. sin seguridad

| Aspecto | Sin seguridad | Sesión HTTP | JWT |
|---------|--------------|-------------|-----|
| **Estado en servidor** | — | Sí (sesión) | No (stateless) |
| **Cliente** | Cualquiera | Navegador (cookie) | Postman / app / SPA |
| **Expiración** | — | Configurable | En el propio token |
| **Logout** | — | Invalida la sesión | No invalida el token |
| **Escala** | — | Requiere sesión compartida | Escala sin coordinación |
| **En ERP Balmis** | Retos 0-5 | Reto 6 MVC | Reto 6 API |
