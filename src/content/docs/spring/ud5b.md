---
title: "UD5b: De MVC a REST"
description: "@RestController, verbos y códigos HTTP, ResponseEntity y Jackson. Base teórica para el Reto 3."
---

> **Herramientas:** Spring MVC, Jackson  
> **Prerequisito:** [UD5a — Spring MVC y Thymeleaf](/sge/spring/ud5a)  
> **Objetivo:** Exponer el mismo modelo de datos como API REST que devuelve JSON, controlando verbos, códigos de estado y serialización.

---

## Índice

5. [De MVC a REST: `@RestController`](#5-de-mvc-a-rest-restcontroller)
6. [HTTP: Verbos y códigos de estado](#6-http-verbos-y-códigos-de-estado)
7. [ResponseEntity: Control total de la respuesta HTTP](#7-responseentity-control-total-de-la-respuesta-http)
8. [Jackson: Serialización JSON](#8-jackson-serialización-json)
9. [🎯 PAUSA: Aquí puedes hacer el **Reto 3** ](#9--pausa-aquí-puedes-hacer-el-reto-3)

---

## 5. De MVC a REST: `@RestController`

En el Reto 2 el servidor devuelve **HTML** (para un navegador). A partir del Reto 3, el servidor también devuelve **JSON** (para aplicaciones cliente: móviles, SPAs, Postman…).

### La diferencia fundamental

```
Reto 2 — @Controller (MVC)
Navegador → GET /clientes → Controller → model + plantilla → Thymeleaf → HTML

Reto 3 — @RestController (REST)
Postman  → GET /api/clientes → RestController → List<Cliente> → Jackson → JSON
```

`@RestController` equivale a `@Controller` + `@ResponseBody`. El `@ResponseBody` indica a Spring que el valor de retorno del método debe serializarse directamente en el cuerpo de la respuesta HTTP, **no** interpretarse como nombre de plantilla.

### Convivencia: MVC y REST en el mismo proyecto

Lo más importante: **ambas capas comparten los mismos repositorios**. No hay duplicidad de lógica; solo cambia la forma de presentar los datos.

```java
// Controlador MVC (Reto 2) — sigue funcionando igual
@Controller
@RequestMapping("/clientes")
public class ClienteController {
    @GetMapping
    public String listar(Model model) {
        model.addAttribute("clientes", clienteRepository.findAll());
        return "clientes/lista";   // → HTML
    }
}

// Controlador REST (Reto 3) — nuevo, misma fuente de datos
@RestController
@RequestMapping("/api/clientes")
public class ClienteRestController {
    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();  // → JSON
    }
}
```

---

## 6. HTTP: Verbos y códigos de estado

Una API REST usa los **verbos HTTP** para expresar la operación y los **códigos de estado** para expresar el resultado.

### Verbos HTTP en una API CRUD

| Verbo | Ruta | Operación | Código éxito |
|---|---|---|---|
| GET | `/api/clientes` | Listar todos | 200 OK |
| GET | `/api/clientes/{id}` | Obtener uno | 200 OK |
| POST | `/api/clientes` | Crear nuevo | 201 Created |
| PUT | `/api/clientes/{id}` | Actualización completa | 200 OK |
| PATCH | `/api/clientes/{id}/tipo` | Actualización parcial | 200 OK |
| DELETE | `/api/clientes/{id}` | Eliminar | 204 No Content |

### Códigos de estado más comunes

| Código | Nombre | Cuándo usarlo |
|---|---|---|
| `200` | OK | Petición exitosa con cuerpo de respuesta |
| `201` | Created | Recurso creado (POST) |
| `204` | No Content | Éxito sin cuerpo (DELETE) |
| `400` | Bad Request | Datos de entrada inválidos |
| `404` | Not Found | El recurso solicitado no existe |
| `409` | Conflict | Conflicto de negocio (email duplicado) |
| `500` | Internal Server Error | Error inesperado del servidor |

---

## 7. ResponseEntity: Control total de la respuesta HTTP

`ResponseEntity<T>` permite controlar **código de estado**, **cabeceras** y **cuerpo** de la respuesta.

```java
// Devuelve 200 OK con cuerpo
return ResponseEntity.ok(cliente);

// Devuelve 201 Created con cuerpo
return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);

// Devuelve 404 Not Found sin cuerpo
return ResponseEntity.notFound().build();

// Devuelve 204 No Content
return ResponseEntity.noContent().build();

// Construido paso a paso
return ResponseEntity
        .status(HttpStatus.CONFLICT)
        .header("X-Error", "email-duplicado")
        .body(Map.of("mensaje", "El email ya existe"));
```

### Ejemplo completo con `ResponseEntity`

```java
@GetMapping("/{id}")
public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
    return clienteRepository.findById(id)
            .map(ResponseEntity::ok)              // Si existe → 200 con el cliente
            .orElse(ResponseEntity.notFound().build()); // Si no existe → 404 vacío
}
```

---

## 8. Jackson: Serialización JSON

Spring Boot incluye **Jackson** por defecto. Convierte automáticamente objetos Java a JSON (serialización) y JSON a objetos Java (deserialización).

### ¿Qué serializa Jackson?

Jackson serializa todos los campos con getter público. Con Lombok (`@Data`), todos los campos se serializan automáticamente:

```java
// Entidad Java
@Data
public class Cliente {
    private Long id;
    private String nombre;
    private TipoCliente tipoCliente;  // Enum → se serializa como String
    private LocalDate fechaAlta;
}

// JSON resultante
{
  "id": 1,
  "nombre": "Empresa ABC S.L.",
  "tipoCliente": "ACTIVO",
  "fechaAlta": "2025-01-15"
}
```

### Anotaciones Jackson útiles

| Anotación | Efecto |
|---|---|
| `@JsonIgnore` | Excluye el campo de la serialización |
| `@JsonProperty("nombreJSON")` | Cambia el nombre en el JSON |
| `@JsonFormat(pattern = "dd/MM/yyyy")` | Formatea fechas |
| `@JsonInclude(NON_NULL)` | Omite campos nulos |

### El problema: Ciclos infinitos con relaciones JPA

Cuando una entidad tiene una relación bidireccional (`@OneToMany` ↔ `@ManyToOne`), Jackson puede entrar en un bucle infinito al intentar serializar. La solución es usar **DTOs**, que veremos en el proximo apartado **ud5c**.

---

## 9. 🎯 PAUSA: Aquí puedes hacer el **Reto 3**

Con `@RestController`, `ResponseEntity` y Jackson tienes todo para añadir una primera API REST al proyecto.

> **[→ Ir al Reto 3: La Transición](/sge/retos/reto3)**
>
> - Crear `ClienteRestController` y `ProductoRestController`
> - Endpoints GET que devuelven JSON
> - Respuesta 404 correcta con `ResponseEntity`
> - Verificar desde el navegador o con Postman
