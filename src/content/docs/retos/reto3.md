---
title: "Reto 3: La Transición"
description: Transformar los controladores MVC del Reto 2 en una primera API REST con @RestController y Postman.
---

### Reto 3 · La Transición
**Módulo SGE · DAM · IES Doctor Balmis**

---

> **Duración:** 4 horas  
> **Reto anterior:** [Reto 2 — La Vista](/sge/retos/reto2)

---

## 📌 Resumen del Reto

Añadirás una capa de API REST al proyecto del Reto 2:
- **`@RestController`:** La diferencia con `@Controller` explicada con código
- **Endpoints GET JSON:** Clientes y Productos devueltos en formato JSON
- **404 con `ResponseEntity`:** Respuesta HTTP correcta cuando el recurso no existe
- **Coexistencia MVC + REST:** Las vistas Thymeleaf y la API comparten los mismos repositorios
- **Postman:** Verificación de los endpoints con la herramienta de API

---

## 1. El momento de la transición

### `@Controller` vs `@RestController`

Esta es la diferencia fundamental entre el Reto 2 y el Reto 3:

| | `@Controller` (Reto 2) | `@RestController` (Reto 3) |
|---|---|---|
| **Devuelve** | Nombre de una plantilla HTML | JSON directamente |
| **Para quién** | Navegador | Aplicación cliente (móvil, SPA, Postman...) |
| **Thymeleaf** | Necesario | No necesario |
| **Equivale a** | `@Controller` | `@Controller` + `@ResponseBody` |

```
                          erpbalmis_2 (Reto 2)
Navegador → GET /clientes → @Controller → Model + "clientes/lista" → Thymeleaf → HTML

                          erpbalmis_3 (Reto 3)
Postman   → GET /api/clientes → @RestController → List<Cliente> → Jackson → JSON
```

**Reflexión clave:** Los dos controladores usan exactamente el mismo repositorio (`clienteRepository.findAll()`). Solo cambia cómo se presenta la respuesta.

---

## 2. Preparación

### Crea una copia del proyecto

1. Copia la carpeta `erpbalmis_2` (del Reto 2) y nómbrala `erpbalmis_3`
2. Trabajaremos sobre `erpbalmis_3` añadiendo la capa REST

La estructura final del proyecto será:

```
erpbalmis_3/
└── src/
    └── main/
        └── java/com/iesdoctorbalmis/spring/
            ├── Application.java
            ├── controller/              (sin cambios — MVC del Reto 2)
            │   ├── HomeController.java
            │   ├── ClienteController.java
            │   ├── EmpleadoController.java
            │   └── ProductoController.java
            ├── controller/rest/         ← NUEVO en Reto 3
            │   ├── ClienteRestController.java
            │   └── ProductoRestController.java
            ├── entity/                  (sin cambios)
            └── repository/             (sin cambios)
```

> El pom.xml, application.properties, import.sql y las plantillas Thymeleaf no cambian.

---

## 3. `ClienteRestController`

```java
package com.iesdoctorbalmis.spring.controller.rest;

import com.iesdoctorbalmis.spring.entity.Cliente;
import com.iesdoctorbalmis.spring.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// @RestController = @Controller + @ResponseBody
// Cada método devuelve JSON directamente, no un nombre de plantilla
@RestController
@RequestMapping("/api/clientes")
public class ClienteRestController {

    private final ClienteRepository clienteRepository;

    public ClienteRestController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // GET /api/clientes → lista JSON de todos los clientes
    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    // GET /api/clientes/{id} → JSON del cliente o 404 si no existe
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

### Puntos clave

- **`@RestController`:** combina `@Controller` y `@ResponseBody`. Todo método devuelve el objeto serializado como JSON por Jackson (incluido automáticamente con `spring-boot-starter-webmvc`).
- **`/api/clientes`:** prefijo `api/` para distinguir los endpoints REST de las rutas MVC.
- **`ResponseEntity<Cliente>`:** permite controlar el código HTTP de respuesta. `ResponseEntity.ok(cliente)` devuelve 200, `ResponseEntity.notFound().build()` devuelve 404 sin cuerpo.
- **`@PathVariable Long id`:** extrae el valor `{id}` de la URL y lo inyecta como parámetro.
- **`findById(id).map(...).orElse(...)`:** patrón idiomático con `Optional` — si existe el cliente lo envuelve en 200, si no devuelve 404.

---

## 4. `ProductoRestController`

```java
package com.iesdoctorbalmis.spring.controller.rest;

import com.iesdoctorbalmis.spring.entity.Producto;
import com.iesdoctorbalmis.spring.repository.ProductoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// @RestController = @Controller + @ResponseBody
// Devuelve JSON directamente, sin necesidad de plantilla Thymeleaf
@RestController
@RequestMapping("/api/productos")
public class ProductoRestController {

    private final ProductoRepository productoRepository;

    public ProductoRestController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // GET /api/productos → lista JSON de todos los productos
    @GetMapping
    public List<Producto> listar() {
        return productoRepository.findAll();
    }
}
```

---

## 5. ¿Qué es JSON?

**JSON** (JavaScript Object Notation) es el formato estándar para intercambio de datos en APIs REST. Spring Boot lo genera automáticamente gracias a **Jackson**, que serializa objetos Java a JSON.

Ejemplo de respuesta de `GET /api/clientes/1`:

```json
{
    "id": 1,
    "codigoCliente": "CLI001",
    "nombre": "Empresa Ejemplo S.L.",
    "email": "contacto@ejemplo.com",
    "telefono": "965 123 456",
    "tipoCliente": "ACTIVO",
    "fechaAlta": "2024-01-15"
}
```

Ejemplo de respuesta de `GET /api/clientes` (lista):

```json
[
    {
        "id": 1,
        "codigoCliente": "CLI001",
        "nombre": "Empresa Ejemplo S.L.",
        ...
    },
    {
        "id": 2,
        "codigoCliente": "CLI002",
        "nombre": "Tech Solutions S.A.",
        ...
    }
]
```

---

## 6. Verificación

```bash
# Compilar
mvn clean compile

# Ejecutar
mvn spring-boot:run
```

### URLs disponibles

Las rutas MVC del Reto 2 siguen funcionando. Se añaden los nuevos endpoints REST:

| URL | Tipo | Respuesta |
|---|---|---|
| `http://localhost:9000/` | MVC | HTML — Panel de control |
| `http://localhost:9000/clientes` | MVC | HTML — Tabla de clientes |
| `http://localhost:9000/empleados` | MVC | HTML — Tabla de empleados |
| `http://localhost:9000/productos` | MVC | HTML — Tabla de productos |
| `http://localhost:9000/api/clientes` | REST | JSON — Lista de clientes |
| `http://localhost:9000/api/clientes/{id}` | REST | JSON — Cliente o 404 |
| `http://localhost:9000/api/productos` | REST | JSON — Lista de productos |
| `http://localhost:9000/h2-console` | Admin | Consola H2 |

### Prueba en el navegador

Los endpoints GET se pueden probar directamente en el navegador — verás el JSON en la pantalla (puede que necesites una extensión como JSONViewer para formatearlo).

### Prueba con Postman

1. Abre Postman y crea una nueva colección **"ERP Balmis — Reto 3"**
2. Añade estas peticiones:
   - `GET http://localhost:9000/api/clientes`
   - `GET http://localhost:9000/api/clientes/1`
   - `GET http://localhost:9000/api/clientes/999` ← debe devolver **404**
   - `GET http://localhost:9000/api/productos`
3. Ejecuta cada una y comprueba el código HTTP y el cuerpo de la respuesta

---

## ✅ Entregable

El proyecto `erpbalmis_3` debe tener:
- Carpeta `controller/rest/` con `ClienteRestController.java` y `ProductoRestController.java`
- Los controladores MVC del Reto 2 sin modificar (coexistencia)
- `GET /api/clientes` devuelve la lista JSON de clientes
- `GET /api/clientes/{id}` devuelve el cliente en JSON o 404
- `GET /api/productos` devuelve la lista JSON de productos
- Verificación en Postman con capturas de pantalla de los cuatro endpoints

<!-- 
## Repositorio

[github.com/lestan-balmis/sge-reto3](https://github.com/lestan-balmis/sge-reto3)
-->
