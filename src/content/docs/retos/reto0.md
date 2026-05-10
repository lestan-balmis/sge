---
title: "UD4 — Reto 0: La Semilla"
description: Proyecto Spring Boot con entidades POJO y repositorios ArrayList. Fundamentos del ERP Balmis.
---

### Proyecto Spring Boot · La Semilla
**Módulo SGE · DAM · IES Balmis**

---

> **Duración:** 4 horas  
> **Herramienta:** Spring Boot (inicialización y estructura Maven)  
> **Objetivo:** Crear el proyecto Spring Boot, modelar el dominio del ERP Balmis como clases POJO y desarrollar repositorios basados en ArrayList, comprendiendo los conceptos fundamentales de la arquitectura Java antes de introducir persistencia real con JPA.

---

## Índice

1. [Introducción a Reto 0](#1-introducción-a-reto-0)
2. [¿Por qué ArrayList antes de JPA?](#2-por-qué-arraylist-antes-de-jpa)
3. [Creación del proyecto con Spring Initializr](#3-creación-del-proyecto-con-spring-initializr)
4. [Estructura de un proyecto Maven](#4-estructura-de-un-proyecto-maven)
5. [Configuración inicial de application.properties](#5-configuración-inicial-de-applicationproperties)
6. [Modelado del Dominio: Entidades POJO](#6-modelado-del-dominio-entidades-pojo)
   - 6.1 [Entidad Cliente](#61-entidad-cliente)
   - 6.2 [Enum TipoCliente](#62-enum-tipocliente)
   - 6.3 [Entidad Producto](#63-entidad-producto)
   - 6.4 [Entidad Empleado](#64-entidad-empleado)
7. [Desarrollo de Repositorios ArrayList](#7-desarrollo-de-repositorios-arraylist)
   - 7.1 [Patrón Repositorio](#71-patrón-repositorio)
   - 7.2 [ClienteRepositorio: CRUD manual](#72-clienterepositorio-crud-manual)
   - 7.3 [ProductoRepositorio](#73-productorepositorio)
   - 7.4 [EmpleadoRepositorio](#74-empleadorepositorio)
   - 7.5 [Inyección de Dependencias con @Component](#75-inyección-de-dependencias-con-component)
8. [Verificación del proyecto](#8-verificación-del-proyecto)
9. [Reflexión: Reto 0 → Reto 1](#9-reflexión-reto-0--reto-1)
10. [Actividades a realizar](#10-actividades-a-realizar)
11. [Entregable: Proyecto Spring Boot Semilla](#11-entregable-proyecto-spring-boot-semilla)

---

## 1. Introducción a Reto 0

El **Reto 0 — La Semilla** es el primer paso en la construcción del **ERP Balmis**. No incluye vistas, no incluye persistencia en base de datos: es **Java puro**.

El objetivo es que entiendas:
- Cómo crear un proyecto Spring Boot desde cero.
- Cómo modelar el dominio de negocio como clases Java simples (POJO).
- Cómo implementar el patrón Repositorio manualmente, usando ArrayList.
- Cómo Spring gestiona la inyección de dependencias.

Al finalizar este reto, dispondrás de una estructura sólida sobre la que el **Reto 1** añadirá JPA y persistencia real. Descubrirás entonces el poder del framework: todo el código de gestión manual de ArrayList será reemplazado por una interfaz de una línea.

### El nombre "La Semilla"

Así como una semilla contiene toda la información genética de un árbol pero aún no ha germinado, el Reto 0 contiene la estructura y el modelo del ERP Balmis pero aún no persiste datos en una base de datos real. Es la **potencialidad** antes de la **manifestación**.

---

## 2. ¿Por qué ArrayList antes de JPA?

La mayoría de tutoriales saltan directamente a JPA y Spring Data. Pero esto hace que el alumno nunca entienda realmente qué hace `JpaRepository`.

### El enfoque de este Reto 0

En este reto **implementarás CRUD manualmente**: escribirás el código que busca un cliente por ID dentro de una lista, que recorre la lista para actualizar uno, que elimina por referencia, etc.

```java
public Cliente buscarPorId(Long id) {
    for (Cliente cliente : clientes) {
        if (cliente.getId().equals(id)) {
            return cliente;
        }
    }
    return null;
}
```

Sí, parece tedioso. Y **lo es**. Y eso es exactamente el punto.

Cuando en el **Reto 1** sustituyas esto por:

```java
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // Eso es todo.
}
```

Comprenderás realmente por qué JPA existe y por qué es tan poderosa. No será "magia", será **automatización inteligente** de un patrón que conoces en profundidad.

### Beneficios pedagógicos de ArrayList

| Beneficio | Explicación |
|---|---|
| **Comprensión** | Entiende exactamente qué hace cada operación CRUD |
| **Depuración** | Es fácil añadir `System.out.println()` y entender el flujo |
| **Independencia de BD** | No necesitas ni instalar H2 ni H2 Console |
| **Reutilización en Reto 1** | El mismo repositorio sirve; solo cambias la implementación interna |

---

## 3. Creación del proyecto con VS Code

### Paso 1: Abrir VS Code

Abre **Visual Studio Code** en tu equipo.

### Paso 2: Instalar la extensión Spring Boot Extension Pack

Si no la tienes instalada:
1. Haz clic en **Extensions** (Ctrl+Shift+X)
2. Busca **"Spring Boot Extension Pack"**
3. Haz clic en **Install**

Esta extensión incluye Spring Tools, Java Extensions Pack, y otras herramientas necesarias.

### Paso 3: Instalar la extensión Lombok

Si no la tienes instalada:
1. Haz clic en **Extensions** (Ctrl+Shift+X)
2. Busca **"Lombok Annotations Support for VS Code"**
3. Instala la de **GabrielBB** (icono de guindilla roja)

Esta extensión es necesaria para que VS Code reconozca los métodos generados por Lombok (`getters`, `setters`, constructores...) y no muestre errores falsos en el editor.

### Paso 4: Crear el proyecto

1. Abre la Paleta de Comandos: **Ctrl+Shift+P**
2. Escribe: **"Spring Boot: Create Java Project"**
3. Selecciona **"Create Java Project"**
4. Se abrirá VS Code con un asistente para crear el proyecto

### Paso 5: Configuración del Proyecto

Rellena los campos siguientes:

| Campo | Valor |
|---|---|
| **Project** | Maven Project |
| **Language** | Java |
| **Spring Boot** | 4.0.x (la versión más reciente disponible) |
| **Project Metadata → Group** | `com.iesdoctorbalmis` |
| **Project Metadata → Artifact** | `spring` |
| **Project Metadata → Name** | `spring` |
| **Project Metadata → Description** | `La Semilla: Proyecto Spring Boot con ArrayList y POJO` |
| **Project Metadata → Package name** | `com.iesdoctorbalmis.spring` |
| **Packaging** | Jar |
| **Java** | 25 |

### Paso 6: Seleccionar Dependencias

Haz clic en **"Add Dependencies"** y selecciona:

- **Spring Web** → Proporciona `@RestController` y permite iniciar un servidor web.
- **Spring Data JPA** → No lo usaremos en este reto, pero lo necesitaremos en el siguiente; mejor preparar el proyecto.
- **H2 Database** → Base de datos en memoria; la usaremos en Reto 1.
- **Lombok** → Genera automáticamente getters, setters y constructores.
- **Validation** → Anotaciones `@NotBlank`, `@Email` para validaciones.
- **Spring Boot DevTools** → Reinicio automático del servidor al guardar cambios durante el desarrollo.

Sigue el asistente y confirma los parámetros indicados en el paso anterior. VS Code creará automáticamente la estructura del proyecto.

### Paso 7: Verificación del proyecto en VS Code

Una vez creado, VS Code abrirá automáticamente el proyecto. Verás notificaciones de descarga de dependencias Maven en la esquina inferior derecha.

### Paso 8: Verificar la Estructura

Abre el terminal del IDE y ejecuta:

```bash
mvn clean verify
```

Si todo es correcto, verás:

```
[INFO] BUILD SUCCESS
```

---

## 4. Estructura de un proyecto Maven

Después de generar e importar el proyecto, encontrarás esta estructura:

```
spring/
├── pom.xml                          # Configuración de Maven
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/iesdoctorbalmis/spring/
│   │   │       └── Application.java  # Main
│   │   └── resources/
│   │       └── application.properties              # Configuración
│   └── test/
│       └── java/
│           └── com/iesdoctorbalmis/spring/
│               └── ApplicationTests.java
├── target/                          # Clases compiladas (generado automáticamente)
└── .gitignore                       # Archivos a ignorar en Git
```

### Explicación de `pom.xml`

El archivo `pom.xml` (*Project Object Model*) es el "corazón" del proyecto Maven. Define:

- **Versión del proyecto**: `<version>0.0.1-SNAPSHOT</version>`
- **Dependencias**: librerías que necesita el proyecto (Spring Web, Lombok, etc.)
- **Plugins**: herramientas para compilar, empaquetar, ejecutar pruebas

Aquí tienes un fragmento:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

### Carpeta `src/main/java`

Aquí iré creando todas mis clases:

```
src/main/java/com/iesdoctorbalmis/spring/
├── controller/      # Controladores REST (Reto 3 en adelante)
├── dto/             # Data Transfer Objects (Reto 4 en adelante)
├── entity/          # Entidades JPA (Reto 1 en adelante)
├── model/           # POJOs puros (Reto 0)
├── repository/      # Repositorios (Reto 0: ArrayList; Reto 1: JpaRepository)
├── service/         # Servicios de negocio (Reto 4 en adelante)
├── security/        # Autenticación y JWT (Reto 6)
└── Application.java  # Clase main
```

En el **Reto 0**, solo usaremos las carpetas `model/` y `repository/`.

---

## 5. Configuración inicial de application.properties

Abre el archivo `src/main/resources/application.properties` y añade la siguiente configuración:

```properties
# Nombre de la aplicación
spring.application.name=spring

# Puerto del servidor
server.port=9000

# Logging
logging.level.root=INFO
logging.level.com.iesdoctorbalmis.spring=DEBUG
```

### Explicación

| Propiedad | Valor | Por qué |
|---|---|---|
| `server.port` | `9000` | Evita conflictos con otros servidores locales (8080 es demasiado común) |
| `spring.application.name` | `spring` | Nombre del proyecto en logs y consola |
| `logging.level.root` | `INFO` | Solo mensajes importantes del sistema |
| `logging.level.com.iesdoctorbalmis.spring` | `DEBUG` | Nuestro código en DEBUG para ver más detalles |

---

## 6. Modelado del Dominio: Entidades POJO

Antes de crear las entidades, crea la carpeta `model` dentro del paquete principal. En VS Code, haz clic derecho sobre `src/main/java/com/iesdoctorbalmis/spring/` y selecciona **New Folder**, con el nombre `model`.

La estructura quedará así:

```
src/main/java/com/iesdoctorbalmis/spring/
└── model/
    ├── Cliente.java
    ├── TipoCliente.java
    ├── Producto.java
    └── Empleado.java
```

Todas las clases de los apartados 6.1 a 6.4 irán dentro de esta carpeta.

---

### 6.1 Entidad Cliente

Crea la clase `src/main/java/com/iesdoctorbalmis/spring/model/Cliente.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    private Long id;
    private String codigoCliente;
    private String nombre;
    private String email;
    private String telefono;
    private TipoCliente tipoCliente;
    private LocalDate fechaAlta;
}
```

> ⚠️ **Normal ver errores en este punto**: Al escribir `TipoCliente`, VS Code mostrará la referencia subrayada en rojo porque el enum aún no existe. Es completamente normal. Los errores desaparecerán en cuanto completes el apartado **6.2 Enum TipoCliente**.

### ¿Qué hace Lombok aquí?

| Anotación | Genera |
|---|---|
| `@Data` | Getters, setters, `toString()`, `equals()`, `hashCode()` |
| `@NoArgsConstructor` | Constructor vacío: `new Cliente()` |
| `@AllArgsConstructor` | Constructor con todos los parámetros: `new Cliente(id, codigoCliente, ...)` |

**Beneficio**: Sin Lombok, tendrías que escribir 100 líneas de código boilerplate. Con Lombok, son 9 líneas.

---

### 6.2 Enum TipoCliente

Crea `src/main/java/com/iesdoctorbalmis/spring/model/TipoCliente.java`:

```java
package com.iesdoctorbalmis.spring.model;

public enum TipoCliente {
    PROSPECTO,
    ACTIVO,
    INACTIVO
}
```

Un **enum** es una enumeración: una clase que solo puede tener tres valores posibles. Esto asegura que un cliente solo puede estar en uno de estos tres estados.

**Uso**: 
```java
Cliente cliente = new Cliente();
cliente.setTipoCliente(TipoCliente.PROSPECTO);  // ✅ Válido
cliente.setTipoCliente(TipoCliente.CANCELADO);  // ❌ Error: no existe
```

---

### 6.3 Entidad Producto

Crea `src/main/java/com/iesdoctorbalmis/spring/model/Producto.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    private Long id;
    private String referencia;
    private String descripcion;
    private BigDecimal precioVenta;
    private BigDecimal precioCosto;
    private String imagen;
    private Integer stock;
}
```

**Nota sobre BigDecimal**: En software empresarial, **nunca** uses `float` o `double` para dinero. `BigDecimal` garantiza precisión exacta.

```java
// ❌ Mal (loss de precisión)
double precio = 19.99;

// ✅ Bien (precisión garantizada)
BigDecimal precio = new BigDecimal("19.99");
```

---

### 6.4 Entidad Empleado

Crea `src/main/java/com/iesdoctorbalmis/spring/model/Empleado.java`:

```java
package com.iesdoctorbalmis.spring.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empleado {
    private Long id;
    private String numeroEmpleado;
    private String nombre;
    private String apellidos;
    private String cargo;
    private String departamento;
    private String email;
    private LocalDate fechaIncorporacion;
}
```

---

## 7. Desarrollo de Repositorios ArrayList

### 7.1 Patrón Repositorio

El **patrón Repositorio** es una capa de abstracción entre la lógica de negocio y el almacenamiento de datos.

Antes de crear los repositorios, crea la carpeta `repository` dentro del paquete principal. En VS Code, haz clic derecho sobre `src/main/java/com/iesdoctorbalmis/spring/` y selecciona **New Folder**, con el nombre `repository`.

La estructura quedará así:

```
src/main/java/com/iesdoctorbalmis/spring/
└── repository/
    ├── ClienteRepositorio.java
    ├── ProductoRepositorio.java
    └── EmpleadoRepositorio.java
```

Todos los repositorios de los apartados 7.2 a 7.4 irán dentro de esta carpeta.

La idea es que si hoy almacenas datos en ArrayList y mañana necesitas cambiar a una base de datos, tu código de negocio no cambia.

### Estructura básica

```java
public interface ClienteRepositorio {
    void guardar(Cliente cliente);
    Cliente buscarPorId(Long id);
    List<Cliente> buscarTodos();
    void actualizar(Cliente cliente);
    void eliminar(Long id);
}
```

Y luego tienes una **implementación** que usa ArrayList:

```java
@Component
public class ClienteRepositorioArrayList implements ClienteRepositorio {
    private List<Cliente> clientes = new ArrayList<>();
    
    @Override
    public void guardar(Cliente cliente) {
        clientes.add(cliente);
    }
    
    // ... resto de métodos
}
```

En el **Reto 1**, la implementación cambiaremos a JPA, pero la interfaz y el uso siguen siendo iguales.

---

### 7.2 ClienteRepositorio: CRUD manual

Crea `src/main/java/com/iesdoctorbalmis/spring/repository/ClienteRepositorio.java`:

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.model.Cliente;
import com.iesdoctorbalmis.spring.model.TipoCliente;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class ClienteRepositorio {
    private List<Cliente> clientes = new ArrayList<>();
    private Long proximoId = 1L;

    /**
     * Guarda un nuevo cliente en la lista. Asigna ID automáticamente.
     */
    public Cliente guardar(Cliente cliente) {
        cliente.setId(proximoId++);
        clientes.add(cliente);
        return cliente;
    }

    /**
     * Busca todos los clientes.
     */
    public List<Cliente> buscarTodos() {
        return new ArrayList<>(clientes);
    }

    /**
     * Busca un cliente por ID.
     */
    public Cliente buscarPorId(Long id) {
        for (Cliente cliente : clientes) {
            if (cliente.getId().equals(id)) {
                return cliente;
            }
        }
        return null;
    }

    /**
     * Actualiza un cliente existente.
     */
    public Cliente actualizar(Cliente clienteActualizado) {
        for (int i = 0; i < clientes.size(); i++) {
            if (clientes.get(i).getId().equals(clienteActualizado.getId())) {
                clientes.set(i, clienteActualizado);
                return clienteActualizado;
            }
        }
        return null;
    }

    /**
     * Elimina un cliente por ID.
     */
    public boolean eliminar(Long id) {
        for (int i = 0; i < clientes.size(); i++) {
            if (clientes.get(i).getId().equals(id)) {
                clientes.remove(i);
                return true;
            }
        }
        return false;
    }

    /**
     * Busca clientes por tipo (PROSPECTO, ACTIVO, INACTIVO).
     */
    public List<Cliente> buscarPorTipo(TipoCliente tipo) {
        List<Cliente> resultado = new ArrayList<>();
        for (Cliente cliente : clientes) {
            if (cliente.getTipoCliente() == tipo) {
                resultado.add(cliente);
            }
        }
        return resultado;
    }

    /**
     * Retorna el número total de clientes.
     */
    public Integer contar() {
        return clientes.size();
    }
}
```

### Desglose de métodos

| Método | Parámetros | Retorna | Qué hace |
|---|---|---|---|
| `guardar()` | `Cliente` | `Cliente` con ID asignado | Añade a la lista y genera ID automático |
| `buscarTodos()` | (ninguno) | `List<Cliente>` | Devuelve copia de la lista completa |
| `buscarPorId()` | `Long id` | `Cliente` o `null` | Recorre la lista buscando por ID |
| `actualizar()` | `Cliente` | `Cliente` o `null` | Reemplaza el cliente con ese ID |
| `eliminar()` | `Long id` | `boolean` | Elimina el cliente; retorna éxito/fallo |
| `buscarPorTipo()` | `TipoCliente` | `List<Cliente>` | Retorna clientes filtrados por tipo |
| `contar()` | (ninguno) | `Integer` | Retorna número total de clientes |

---

### 7.3 ProductoRepositorio

Crea `src/main/java/com/iesdoctorbalmis/spring/repository/ProductoRepositorio.java`:

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.model.Producto;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductoRepositorio {
    private List<Producto> productos = new ArrayList<>();
    private Long proximoId = 1L;

    public Producto guardar(Producto producto) {
        producto.setId(proximoId++);
        productos.add(producto);
        return producto;
    }

    public List<Producto> buscarTodos() {
        return new ArrayList<>(productos);
    }

    public Producto buscarPorId(Long id) {
        for (Producto producto : productos) {
            if (producto.getId().equals(id)) {
                return producto;
            }
        }
        return null;
    }

    public Producto buscarPorReferencia(String referencia) {
        for (Producto producto : productos) {
            if (producto.getReferencia().equals(referencia)) {
                return producto;
            }
        }
        return null;
    }

    public Producto actualizar(Producto productoActualizado) {
        for (int i = 0; i < productos.size(); i++) {
            if (productos.get(i).getId().equals(productoActualizado.getId())) {
                productos.set(i, productoActualizado);
                return productoActualizado;
            }
        }
        return null;
    }

    public boolean eliminar(Long id) {
        for (int i = 0; i < productos.size(); i++) {
            if (productos.get(i).getId().equals(id)) {
                productos.remove(i);
                return true;
            }
        }
        return false;
    }

    public Integer contar() {
        return productos.size();
    }
}
```

---

### 7.4 EmpleadoRepositorio

Crea `src/main/java/com/iesdoctorbalmis/spring/repository/EmpleadoRepositorio.java`:

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.model.Empleado;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class EmpleadoRepositorio {
    private List<Empleado> empleados = new ArrayList<>();
    private Long proximoId = 1L;

    public Empleado guardar(Empleado empleado) {
        empleado.setId(proximoId++);
        empleados.add(empleado);
        return empleado;
    }

    public List<Empleado> buscarTodos() {
        return new ArrayList<>(empleados);
    }

    public Empleado buscarPorId(Long id) {
        for (Empleado empleado : empleados) {
            if (empleado.getId().equals(id)) {
                return empleado;
            }
        }
        return null;
    }

    public List<Empleado> buscarPorDepartamento(String departamento) {
        List<Empleado> resultado = new ArrayList<>();
        for (Empleado empleado : empleados) {
            if (empleado.getDepartamento().equals(departamento)) {
                resultado.add(empleado);
            }
        }
        return resultado;
    }

    public Empleado actualizar(Empleado empleadoActualizado) {
        for (int i = 0; i < empleados.size(); i++) {
            if (empleados.get(i).getId().equals(empleadoActualizado.getId())) {
                empleados.set(i, empleadoActualizado);
                return empleadoActualizado;
            }
        }
        return null;
    }

    public boolean eliminar(Long id) {
        for (int i = 0; i < empleados.size(); i++) {
            if (empleados.get(i).getId().equals(id)) {
                empleados.remove(i);
                return true;
            }
        }
        return false;
    }

    public Integer contar() {
        return empleados.size();
    }
}
```

---

### 7.5 Inyección de Dependencias con @Component

Observa que cada repositorio tiene la anotación `@Component`:

```java
@Component
public class ClienteRepositorio {
    ...
}
```

Esto le dice a Spring: **"Gestiona la instancia de esta clase. Crea una sola instancia (singleton) y inyéctala en las clases que la necesiten"**.

#### Cómo funciona la inyección

Imagina que tienes un servicio que necesita ClienteRepositorio:

```java
@Component
public class ClienteServicio {
    private ClienteRepositorio clienteRepositorio;

    // Constructor: Spring inyecta automáticamente
    public ClienteServicio(ClienteRepositorio clienteRepositorio) {
        this.clienteRepositorio = clienteRepositorio;
    }

    public void crear(Cliente cliente) {
        clienteRepositorio.guardar(cliente);
    }
}
```

Spring automáticamente:
1. Detecta que `ClienteRepositorio` está anotado con `@Component`.
2. Crea una instancia única.
3. Ve que `ClienteServicio` necesita esa instancia en su constructor.
4. Inyecta la misma instancia en el constructor.

**Beneficio**: Tu código de negocio no necesita saber **cómo** se crea el repositorio. Si en el Reto 1 cambias a `JpaRepository`, el servicio no cambia: Spring automáticamente inyectará la nueva implementación.

---

## 8. Verificación del proyecto

### Paso 1: Ejecutar la aplicación

Abre el terminal en la raíz del proyecto y ejecuta:

```bash
mvn spring-boot:run
```

O si usas IntelliJ IDEA, haz clic en el botón verde "Run" junto a la clase main.

Deberías ver algo como:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| ._ \_| |_|_| |_|\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v4.0.x)

2026-05-08 13:45:00.123  INFO  : Starting Application...
2026-05-08 13:45:02.456  INFO  : Started Application in 2.333 seconds (JVM running for 2.789)
```

La aplicación está corriendo en `http://localhost:9000/`

### Paso 2: Crear una clase de prueba

Para verificar que todo funciona, modifica la clase main `src/main/java/com/iesdoctorbalmis/spring/Application.java`:

```java
package com.iesdoctorbalmis.spring;

import com.iesdoctorbalmis.spring.model.Cliente;
import com.iesdoctorbalmis.spring.model.TipoCliente;
import com.iesdoctorbalmis.spring.repository.ClienteRepositorio;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.LocalDate;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner testRepositorio(ClienteRepositorio clienteRepositorio) {
        return args -> {
            System.out.println("=== Prueba ClienteRepositorio ===");

            // Crear y guardar un cliente
            Cliente cliente1 = new Cliente();
            cliente1.setCodigoCliente("CLI-001");
            cliente1.setNombre("Acme Corporation");
            cliente1.setEmail("info@acme.com");
            cliente1.setTipoCliente(TipoCliente.PROSPECTO);
            cliente1.setFechaAlta(LocalDate.now());

            Cliente guardado = clienteRepositorio.guardar(cliente1);
            System.out.println("- Cliente guardado con ID: " + guardado.getId());

            // Buscar todos los clientes
            System.out.println("- Total de clientes: " + clienteRepositorio.contar());

            // Buscar por ID
            Cliente encontrado = clienteRepositorio.buscarPorId(1L);
            System.out.println("- Cliente encontrado: " + encontrado.getNombre());

            // Cambiar a activo
            encontrado.setTipoCliente(TipoCliente.ACTIVO);
            clienteRepositorio.actualizar(encontrado);
            System.out.println("- Cliente actualizado a: " + encontrado.getTipoCliente());

            // Listar por tipo
            System.out.println("- Clientes ACTIVOS: " + clienteRepositorio.buscarPorTipo(TipoCliente.ACTIVO).size());
        };
    }
}
```

Cuando ejecutes la aplicación con esta clase main, verás en la consola:

```
=== Prueba ClienteRepositorio ===
- Cliente guardado con ID: 1
- Total de clientes: 1
- Cliente encontrado: Acme Corporation
- Cliente actualizado a: ACTIVO
- Clientes ACTIVOS: 1
```

Perfecto. Tu arquitectura funciona.

---

## 9. Reflexión: Reto 0 → Reto 1

Tómate un momento para observar lo que hemos logrado:

✅ Un proyecto Spring Boot completamente funcional.
✅ Tres entidades modeladas como POJOs (sin dependencias de persistencia).
✅ Tres repositorios que implementan CRUD manualmente con ArrayList.
✅ Inyección de dependencias con `@Component`.
✅ Una lógica de negocio que funciona completamente en memoria.

Ahora imagina: **¿Qué pasaría si mañana necesitásemos persistencia real?**

En el **Reto 1**:
1. Añadiremos anotaciones JPA a las entidades (`@Entity`, `@Id`, `@GeneratedValue`).
2. Cambiaremos los `ClienteRepositorio`, `ProductoRepositorio`, etc. a interfaces `JpaRepository`.
3. La clase main no cambiaría. El `CommandLineRunner` no cambiaría.

**Toda** la lógica que escribimos aquí sigue siendo válida. Lo único que cambia es **cómo** se almacenan los datos.

Eso es la potencia de una arquitectura bien diseñada: cambios sin quebrantos.

---

## 10. Actividades a realizar

### Actividad 1: Crear el Proyecto (1h)

- [ ] Acceder a https://start.spring.io/ y generar el proyecto con las dependencias especificadas.
- [ ] Descomprimir el ZIP y abrir en tu IDE.
- [ ] Ejecutar `mvn clean verify` para asegurar que el proyecto compila sin errores.
- [ ] Cambiar el puerto de 8080 a 9000 en `application.properties`.

### Actividad 2: Modelar las Entidades (1h)

- [ ] Crear la clase `Cliente` en `src/main/java/com/iesbal/erpbalmis/model/Cliente.java` con anotaciones Lombok.
- [ ] Crear el enum `TipoCliente` con tres valores: PROSPECTO, ACTIVO, INACTIVO.
- [ ] Crear las clases `Producto` y `Empleado` siguiendo el mismo patrón.
- [ ] Verificar que las clases compilan sin errores.

### Actividad 3: Implementar Repositorios (1.5h)

- [ ] Crear `ClienteRepositorio` en `src/main/java/com/iesbal/erpbalmis/repository/ClienteRepositorio.java` con métodos CRUD.
- [ ] Crear `ProductoRepositorio` con métodos CRUD.
- [ ] Crear `EmpleadoRepositorio` con métodos CRUD.
- [ ] Anotar cada repositorio con `@Component`.

### Actividad 4: Verificar y Probar (0.5h)

- [ ] Ejecutar `mvn spring-boot:run` para iniciar la aplicación.
- [ ] Crear un `CommandLineRunner` que cree, busque, actualice y liste clientes.
- [ ] Verificar en consola que todos los CRUD funcionan correctamente.

---

## 11. Entregable: Proyecto Spring Boot Semilla

### Estructura Esperada

```
spring/
├── pom.xml                          # Configuración Maven (sin cambios)
├── src/
│   ├── main/
│   │   ├── java/com/iesdoctorbalmis/spring/
│   │   │   ├── model/
│   │   │   │   ├── Cliente.java
│   │   │   │   ├── Producto.java
│   │   │   │   ├── Empleado.java
│   │   │   │   └── TipoCliente.java
│   │   │   ├── repository/
│   │   │   │   ├── ClienteRepositorio.java
│   │   │   │   ├── ProductoRepositorio.java
│   │   │   │   └── EmpleadoRepositorio.java
│   │   │   └── Application.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/...
├── .gitignore
├── README.md                        # Documento de referencia
└── .git/                            # Repositorio Git inicializado
```

### Contenido de README.md (mínimo requerido)

```markdown
# ERP Balmis — Reto 0: La Semilla

## Requisitos

- Java 21 o superior
- Maven 3.8.x o superior

## Cómo ejecutar

```bash
mvn spring-boot:run
```

## Estructura

- `model/`: Entidades POJO (Cliente, Producto, Empleado)
- `repository/`: Repositorios con ArrayList (ClienteRepositorio, ProductoRepositorio, EmpleadoRepositorio)

## Conceptos clave

- **POJO**: Clases Java puras sin anotaciones de persistencia.
- **ArrayList**: Almacenamiento en memoria de datos.
- **@Component**: Anotación que indica a Spring que gestione la instancia.
- **Inyección de dependencias**: Spring inyecta automáticamente las instancias.

## Reflexión: Reto 0 → Reto 1

En el Reto 1, sustituiremos ArrayList por JPA, pero la arquitectura seguirá siendo la misma.
```

### Criterios de Evaluación

| Criterio | Peso | Descripción |
|---|---|---|
| **Funcionamiento correcto** | 40% | La aplicación compila y ejecuta sin errores. Los CRUD funcionan en ArrayList. |
| **Arquitectura** | 30% | Las clases están bien organizadas en paquetes. Hay separación entre model y repository. |
| **Uso de Lombok** | 20% | Las entidades usan @Data, @NoArgsConstructor, @AllArgsConstructor correctamente. |
| **Documentación** | 10% | README.md presente con instrucciones claras. Código comentado en métodos complejos. |

---

### Próximos pasos

Felicidades, has completado el **Reto 0 — La Semilla**. Ya tienes un proyecto Spring Boot sólido, modelo de datos, repositorios funcionales y inyección de dependencias.

En el **Reto 1 — El Modelo**, transformarás este proyecto:
- Sustituirás ArrayList por JPA.
- Conectarás a una base de datos H2 real.
- Verás cómo `List<Cliente>` se convierte en una tabla SQL completa.

**La semilla está lista para germinar.**

---

*Reto 0 — La Semilla. Duración: 4 horas. Spring Boot inicialización · POJOs · ArrayList · @Component. Siguiente: Reto 1 — El Modelo (JPA, JpaRepository, H2).*
