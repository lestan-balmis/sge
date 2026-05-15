---
title: "UD6 — Formularios Web con Thymeleaf"
description: Formularios MVC, th:object, th:field, th:errors, @Valid + BindingResult, RedirectAttributes y patrón POST-Redirect-GET. Base teórica para la parte de vistas del Reto 4.
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
