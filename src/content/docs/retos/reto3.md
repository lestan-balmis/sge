---
title: "Reto 3: La Transición"
description: Transformar los controladores MVC del Reto 2 en una primera API REST con @RestController y Postman.
---

> **Reto anterior:** [Reto 2 — La Vista](/sge/retos/reto2)

## 📌 Resumen del Reto

Añadirás una capa de API REST al proyecto del Reto 2:
- **`@RestController`:** La diferencia con `@Controller` explicada con código
- **Endpoints GET JSON:** Clientes y Productos devueltos en formato JSON
- **404 con `ResponseEntity`:** Respuesta HTTP correcta cuando el recurso no existe
- **Coexistencia MVC + REST:** Las vistas Thymeleaf y la API comparten los mismos repositorios
- **Navegador:** Verificación de los endpoints con la herramienta de API

> **Conceptos teóricos:** La diferencia entre `@Controller` y `@RestController`, Jackson y los códigos de estado HTTP se explican en [UD5b — secciones 5 a 8](/sge/spring/ud5b).

## 1. Preparación

### Crea una copia del proyecto
- Desde tu carpeta de trabajo **workspace-spring**, haz una copia de tu carpeta **spring**, manteniendo el nombre por defecto de **spring - copia**. Cambia el nombre del proyecto original **spring** por **reto2**, y cambia también el nombre de **spring - copia** por **spring**. 
- Desde el IDE de VSCode, añadiremos la capa REST

## 2. `ClienteRestController`

Dentro de la carpeta `controller` creamos la carpeta `rest`.
Dentro de la carpeta `rest` creamos el fichero `ClienteRestController.java` con el siguiente contenido:

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

**Puntos clave:**
- **`@RestController`:** combina `@Controller` y `@ResponseBody`. Todo método devuelve el objeto serializado como JSON por Jackson (incluido automáticamente con `spring-boot-starter-webmvc`).
- **`/api/clientes`:** prefijo `api/` para distinguir los endpoints REST de las rutas MVC.
- **`ResponseEntity<Cliente>`:** permite controlar el código HTTP de respuesta. `ResponseEntity.ok(cliente)` devuelve 200, `ResponseEntity.notFound().build()` devuelve 404 sin cuerpo.
- **`@PathVariable Long id`:** extrae el valor `{id}` de la URL y lo inyecta como parámetro.
- **`findById(id).map(...).orElse(...)`:** patrón idiomático con `Optional` — si existe el cliente lo envuelve en 200, si no devuelve 404.

## 3. `ProductoRestController`

Dentro de la carpeta `rest` creamos el fichero `ProductoRestController.java` con el siguiente contenido:

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

## 4. Ejemplos de respuesta JSON

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

## 5. Ejecución

Ejecutamos de forma gráfica con el icono lateral de `Spring Boot Dashboard`, o desde el terminal.

```bash
# Compilar
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

Los endpoints GET se pueden probar directamente en el navegador y verse el JSON en la pantalla.

Se pueden probar estas peticiones:

- `http://localhost:9000/api/clientes`

   ![Api Clientes del reto 3](/sge/ud5/b/reto3_api_clientes.png)

- `http://localhost:9000/api/clientes/1`

   ![Api Clientes 1 del reto 3](/sge/ud5/b/reto3_api_clientes_1.png)

- `http://localhost:9000/api/clientes/999` ← debe devolver **404**

   ![Api Clientes 999 del reto 3](/sge/ud5/b/reto3_api_clientes_999.png)

- `http://localhost:9000/api/productos`

   ![Api Productos del reto 3](/sge/ud5/b/reto3_api_productos.png)

## 6. Entrega del Reto 3

### Estructura esperada

La estructura final del proyecto será:

```
src/
└── main/
    ├── java/com/iesdoctorbalmis/spring/
    │   ├── Application.java
    │   ├── controller/              (sin cambios — MVC del Reto 2)
    │   │   ├── HomeController.java
    │   │   ├── ClienteController.java
    │   │   ├── EmpleadoController.java
    │   │   └── ProductoController.java
    │   ├── controller/rest/         ← NUEVO en Reto 3
    │   │   ├── ClienteRestController.java
    │   │   └── ProductoRestController.java
    │   ├── entity/                  (sin cambios)
    │   └── repository/              (sin cambios)
    └── resources/                   (sin cambios — MVC del Reto 2)
```

> El pom.xml, application.properties, import.sql y las plantillas Thymeleaf no cambian.


### Requisitos de entrega

1. **Repositorio Git:** Crea un repositorio en tu organización con el nombre **Reto3_Apellido1_Nombre** (ejemplo: **Reto3_Estañ_Luis**)

2. **Commits en Git:** 
   - Realiza commits necesarios conforme avanzas en el reto.
   - Usa mensajes descriptivos (ej: "Añadir anotaciones JPA", "Configurar H2 database", etc.)
   - Usa Control de Código Fuente en VSCode para hacer commit y push

3. **.gitignore:** Asegúrate de que tu repositorio incluya un `.gitignore` con contenido mínimo:
   ```
   target/
   .DS_Store
   .vscode/
   .idea/
   *.log
   ```

4. **README.md:** Incluye un archivo `README.md` con:
   - Título del reto
   - Descripción breve
   - Instrucciones para ejecutar la aplicación

5. **Push al repositorio:** Sube todos tus cambios a la rama `main` de tu repositorio remoto antes de la fecha de entrega

6. **Acceso al profesor:** Asegúrate de que tu profesor tiene acceso a tu organización para revisar el trabajo

---
