---
title: "UD4 — Reto 1: De la Semilla a la Raíz"
description: Introducción a JPA, entidades persistentes y H2 Database. Transformación del Reto 0 con persistencia real.
---

### Proyecto Spring Boot · De la Semilla a la Raíz
**Módulo SGE · DAM · IES Balmis**

---

> **Duración:** 6 horas  
> **Herramienta:** Spring Boot (JPA, Hibernate, H2 Database)  
> **Objetivo:** Transformar el código ArrayList del Reto 0 en entidades JPA persistentes. Comprender cómo Hibernate traduce anotaciones Java a SQL, usar H2 Console para inspeccionar la base de datos, y trabajar con `JpaRepository` en lugar de gestionar listas manualmente.

---

## Índice

1. [Introducción a Reto 1](#1-introducción-a-reto-1)
2. [Conceptos clave: JPA y Hibernate](#2-conceptos-clave-jpa-y-hibernate)
3. [Del ArrayList a JpaRepository: El gran cambio](#3-del-arraylist-a-jparepository-el-gran-cambio)
4. [Preparación del Reto 0 para la evolución](#4-preparación-del-reto-0-para-la-evolución)
5. [Transformar POJO a Entidades JPA](#5-transformar-pojo-a-entidades-jpa)
   - 5.1 [Entidad Cliente con @Entity](#51-entidad-cliente-con-entity)
   - 5.2 [Entidad Producto persistente](#52-entidad-producto-persistente)
   - 5.3 [Entidad Empleado persistente](#53-entidad-empleado-persistente)
   - 5.4 [Enum TipoCliente en la BD](#54-enum-tipocliente-en-la-bd)
6. [Configuración de H2 Database](#6-configuración-de-h2-database)
7. [Crear Repositorios con JpaRepository](#7-crear-repositorios-con-jparepository)
   - 7.1 [ClienteRepository: Del ArrayList a la BD](#71-clienterepository-del-arraylist-a-la-bd)
   - 7.2 [ProductoRepository](#72-productorepository)
   - 7.3 [EmpleadoRepository](#73-empleadorepository)
8. [Inicialización de datos con data.sql](#8-inicialización-de-datos-con-datasql)
9. [H2 Console: Inspeccionar la BD](#9-h2-console-inspeccionar-la-bd)
10. [Transiciones y migraciones de datos](#10-transiciones-y-migraciones-de-datos)
11. [Testing con Datos Persistentes](#11-testing-con-datos-persistentes)
12. [Verificación del proyecto](#12-verificación-del-proyecto)
13. [Reflexión: Reto 1 → Reto 2](#13-reflexión-reto-1--reto-2)
14. [Actividades a realizar](#14-actividades-a-realizar)
15. [Entregable: Proyecto con JPA y H2](#15-entregable-proyecto-con-jpa-y-h2)

---

## 1. Introducción a Reto 1

El **Reto 1 — De la Semilla a la Raíz** es la evolución natural del Reto 0. Aquí introducimos **persistencia real**: datos que sobreviven a la ejecución del programa.

### Lo que cambia en Reto 1

| Aspecto | Reto 0 | Reto 1 |
|---|---|---|
| **Almacenamiento** | ArrayList en memoria | Base de datos H2 |
| **Anotaciones** | Ninguna especial (POJO) | `@Entity`, `@Id`, `@GeneratedValue`, etc. |
| **Repositorio** | Implementación manual con bucles | Interfaz que extiende `JpaRepository` |
| **Líneas de código de CRUD** | ~50 líneas de implementación | 0 líneas (heredadas) |
| **SQL** | Ninguno escrito por ti | Generado automáticamente por Hibernate |
| **BD** | N/A | H2 (en archivo o en memoria) |
| **Inicialización** | Datos hardcodeados en `@PostConstruct` | `data.sql` o scripts |

### El nombre "De la Semilla a la Raíz"

Si el Reto 0 era la **semilla** (potencialidad), el Reto 1 es el **crecimiento de las raíces** (ancla en el mundo real). Las entidades JPA son las raíces que conectan tu aplicación con la tierra: la base de datos.

---

## 2. Conceptos clave: JPA y Hibernate

### JPA (Java Persistence API)

**JPA** es una especificación (un estándar) que define cómo los objetos Java se mapean a tablas de base de datos.

Es decir, JPA dice: "Aquí están las reglas; si las sigues, los datos se persistirán".

### Hibernate

**Hibernate** es la **implementación** de JPA más popular. Es el motor que:
- Lee tus anotaciones (`@Entity`, `@Id`, etc.)
- Genera tablas SQL automáticamente
- Traduce tus consultas Java a SQL
- Maneja transacciones y sesiones

### El flujo JPA → SQL

```
Tu código Java
    ↓
Anotaciones JPA (@Entity, @Id, etc.)
    ↓
Hibernate (interpreta anotaciones)
    ↓
SQL generado automáticamente
    ↓
Base de datos
```

### Ejemplo: De POJO a Entidad

**Reto 0 (POJO puro):**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    private Long id;
    private String nombre;
    private String email;
}
```

**Reto 1 (Entidad JPA):**
```java
@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, unique = true)
    private String email;
}
```

La anotación `@Entity` dice: "Esto es una entidad persistente; Hibernate creará la tabla `clientes` automáticamente".

---

## 3. Del ArrayList a JpaRepository: El gran cambio

### En Reto 0 (ArrayList)

```java
@Component
public class ClienteRepository {
    private List<Cliente> clientes = new ArrayList<>();

    public Cliente buscarPorId(Long id) {
        for (Cliente cliente : clientes) {
            if (cliente.getId().equals(id)) {
                return cliente;
            }
        }
        return null;
    }

    public void guardar(Cliente cliente) {
        clientes.add(cliente);
    }

    public void actualizar(Cliente cliente) {
        for (int i = 0; i < clientes.size(); i++) {
            if (clientes.get(i).getId().equals(cliente.getId())) {
                clientes.set(i, cliente);
                return;
            }
        }
    }
    // ... más métodos CRUD
}
```

### En Reto 1 (JpaRepository)

```java
@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // ¡Eso es todo! No necesitas escribir nada más.
}
```

### ¿Por qué desaparece el código?

Porque `JpaRepository<Cliente, Long>` ya incluye:
- `findById(Long id)` → SELECT
- `save(Cliente cliente)` → INSERT o UPDATE
- `delete(Cliente cliente)` → DELETE
- `findAll()` → SELECT *
- Y muchos más...

Hibernate las implementa automáticamente analizando tus entidades.

---

## 4. Preparación del Reto 0 para la evolución

### Antes de cambiar: Crea una copia del proyecto

1. Copia la carpeta `erpbalmis_0` (del Reto 0) y nómbrala `erpbalmis_1`
2. Trabajaremos sobre `erpbalmis_1` añadiendo toda la funcionalidad de JPA y persistencia

### Paso 1: Verifica que el pom.xml incluye Spring Data JPA

Abre el archivo `pom.xml` del proyecto `erpbalmis_1` y verifica que tenga:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

Si no están presentes, añádelas manualmente.

### Paso 2: Limpia la carpeta model/

El código del Reto 0 que está en `model/` lo moveré a `entity/` (porque serán entidades JPA).

```bash
# En terminal, desde la raíz del proyecto:
mkdir -p src/main/java/com/iesdoctorbalmis/spring/entity

# Mueve todos los ficheros de model/ a entity/
mv src/main/java/com/iesdoctorbalmis/spring/model/* src/main/java/com/iesdoctorbalmis/spring/entity/
```

:::note
En Windows puedes usar el explorador de archivos de VS Code o el terminal PowerShell con:
```powershell
Move-Item src\main\java\com\iesdoctorbalmis\spring\model\* src\main\java\com\iesdoctorbalmis\spring\entity\
```
:::

Después de mover los ficheros, recuerda actualizar la declaración `package` en cada fichero movido:

```java
// Cambiar de:
package com.iesdoctorbalmis.spring.model;

// A:
package com.iesdoctorbalmis.spring.entity;
```

---

## 5. Transformar POJO a Entidades JPA

### 5.1 Entidad Cliente con @Entity

Abre o crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Cliente.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "clientes", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo_cliente"),
    @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "codigo_cliente", nullable = false, length = 50)
    private String codigoCliente;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    
    @Column(length = 20)
    private String telefono;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente", nullable = false)
    private TipoCliente tipoCliente;
    
    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;
    
    @Column(name = "fecha_modificacion")
    private LocalDate fechaModificacion;
}
```

### Explicación de anotaciones

| Anotación | Significado |
|---|---|
| `@Entity` | Indica que esta clase es una entidad persistente |
| `@Table(name = "clientes")` | Define el nombre de la tabla en la BD |
| `@Id` | Define el campo como clave primaria |
| `@GeneratedValue(strategy = GenerationType.IDENTITY)` | El ID se auto-incrementa en la BD |
| `@Column(...)` | Define propiedades de la columna (nullable, unique, length, etc.) |
| `@Enumerated(EnumType.STRING)` | Guarda el enum como texto (no como número) |

### 5.2 Entidad Producto persistente

Crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Producto.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "referencia", nullable = false, unique = true, length = 50)
    private String referencia;
    
    @Column(nullable = false, length = 200)
    private String descripcion;
    
    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;
    
    @Column(name = "precio_coste", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCoste;
    
    @Column(name = "stock", nullable = false)
    private Integer stock;
    
    @Column(name = "fecha_alta", nullable = false)
    private LocalDate fechaAlta;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
```

### 5.3 Entidad Empleado persistente

Crea: `src/main/java/com/iesdoctorbalmis/spring/entity/Empleado.java`

```java
package com.iesdoctorbalmis.spring.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "empleados")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Empleado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_empleado", nullable = false, unique = true, length = 20)
    private String numeroEmpleado;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, length = 100)
    private String apellidos;
    
    @Column(nullable = false, length = 100)
    private String cargo;
    
    @Column(nullable = false, length = 100)
    private String departamento;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(name = "fecha_incorporacion", nullable = false)
    private LocalDate fechaIncorporacion;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
```

### 5.4 Enum TipoCliente en la BD

Crea: `src/main/java/com/iesdoctorbalmis/spring/entity/TipoCliente.java`

**Nota importante:** En un ERP real, los valores del enum representan el **estado del cliente en el ciclo de vida**:
- **PROSPECTO**: Cliente potencial, aún no confirmado
- **ACTIVO**: Cliente vigente, realizar transacciones
- **INACTIVO**: Cliente suspendido o bloqueado

```java
package com.iesdoctorbalmis.spring.entity;

public enum TipoCliente {
    PROSPECTO("Cliente Potencial"),
    ACTIVO("Cliente Activo"),
    INACTIVO("Cliente Inactivo");
    
    private final String descripcion;
    
    TipoCliente(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
```

---

## 6. Configuración de H2 Database

### application.properties

Actualiza `src/main/resources/application.properties`:

```properties
# Nombre de la aplicación
spring.application.name=spring

# Puerto del servidor
server.port=9000

# Configuración de H2
spring.datasource.url=jdbc:h2:mem:erpbalmis
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console (para inspeccionar la BD)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.defer-datasource-initialization=true

# Inicialización de datos
spring.sql.init.mode=always

# Logging
logging.level.root=INFO
logging.level.com.iesdoctorbalmis.spring=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Explicación de propiedades

| Propiedad | Valor | Por qué |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:mem:testdb` | Base de datos en memoria (se pierde al cerrar); perfecto para desarrollo |
| `spring.h2.console.enabled` | `true` | Activa la interfaz web de H2 |
| `spring.jpa.hibernate.ddl-auto` | `create-drop` | Crea las tablas al iniciar; las borra al cerrar (desarrollo limpio) |
| `spring.jpa.show-sql` | `true` | Muestra el SQL generado en consola |

**Para producción**, cambiarías a:
- `spring.datasource.url` = `jdbc:h2:file:./data/erp_balmis`
- `spring.jpa.hibernate.ddl-auto` = `validate`

---

## 7. Crear Repositorios con JpaRepository

### Paso previo: Eliminar los ficheros de repositorio del Reto 0

La carpeta `repository/` ya existe del Reto 0, por lo que **no hay que crearla**. Sin embargo, dentro de ella hay tres ficheros con implementación manual en `ArrayList` y nombres en español que deben borrarse antes de añadir los nuevos:

```
# Ficheros a eliminar dentro de repository/:
src/main/java/com/iesdoctorbalmis/spring/repository/
    ├── ClienteRepositorio.java    ← borrar
    ├── ProductoRepositorio.java   ← borrar
    └── EmpleadoRepositorio.java   ← borrar
```

Puedes hacerlo desde el explorador de VS Code (clic derecho → *Delete*) o desde la terminal:

```powershell
Remove-Item src\main\java\com\iesdoctorbalmis\spring\repository\ClienteRepositorio.java
Remove-Item src\main\java\com\iesdoctorbalmis\spring\repository\ProductoRepositorio.java
Remove-Item src\main\java\com\iesdoctorbalmis\spring\repository\EmpleadoRepositorio.java
```

:::caution
Si algún servicio o controlador del Reto 0 importaba las clases `ClienteRepositorio`, `ProductoRepositorio` o `EmpleadoRepositorio`, IntelliJ/VS Code mostrará errores de compilación hasta que actualices esas referencias para que apunten a los nuevos repositorios JPA (sección 7.1–7.3).
:::

---

### 7.1 ClienteRepository: Del ArrayList a la BD

Crea: `src/main/java/com/iesdoctorbalmis/spring/repository/ClienteRepository.java`

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    // Búsquedas personalizadas (Spring Data genera el SQL automáticamente)
    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByCodigoCliente(String codigoCliente);
    boolean existsByEmail(String email);
    boolean existsByCodigoCliente(String codigoCliente);
}
```

### ¿Cómo funciona?

Cuando escribes `findByEmail(String email)`, Spring Data:
1. Interpreta el nombre del método
2. Genera el SQL: `SELECT * FROM clientes WHERE email = ?`
3. Ejecuta la consulta
4. Retorna un `Optional<Cliente>` (puede existir o no)

Es **magia de nomenclatura**: sigues patrones convencionales y Spring hace el resto.

### 7.2 ProductoRepository

Crea: `src/main/java/com/iesdoctorbalmis/spring/repository/ProductoRepository.java`

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    Optional<Producto> findByReferencia(String referencia);
    boolean existsByReferencia(String referencia);
}
```

### 7.3 EmpleadoRepository

Crea: `src/main/java/com/iesdoctorbalmis/spring/repository/EmpleadoRepository.java`

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    
    Optional<Empleado> findByEmail(String email);
    Optional<Empleado> findByNumeroEmpleado(String numeroEmpleado);
    boolean existsByEmail(String email);
    boolean existsByNumeroEmpleado(String numeroEmpleado);
}
```

---

## 8. Inicialización de datos con data.sql

Ahora, en lugar de usar un `@Bean CommandLineRunner` para crear datos hardcodeados, usamos un script SQL.

### Paso previo: Limpiar la clase Application

En el Reto 0, el fichero `Application.java` tenía un método `@Bean` que devolvía un `CommandLineRunner` para probar el repositorio con datos de ejemplo y referencias a las clases antiguas. **Hay que eliminarlo** junto a todos sus imports obsoletos:

```java
// ELIMINAR: estos imports del Reto 0
import com.iesdoctorbalmis.spring.model.Cliente;
import com.iesdoctorbalmis.spring.model.TipoCliente;
import com.iesdoctorbalmis.spring.repository.ClienteRepositorio;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import java.time.LocalDate;

// ELIMINAR: el método @Bean completo
@Bean
public CommandLineRunner testRepositorio(ClienteRepositorio clienteRepositorio) {
    return args -> {
        System.out.println("=== Prueba ClienteRepositorio ===");
        Cliente cliente1 = new Cliente();
        cliente1.setCodigoCliente("CLI-001");
        cliente1.setNombre("Acme Corporation");
        cliente1.setEmail("info@acme.com");
        cliente1.setTipoCliente(TipoCliente.PROSPECTO);
        cliente1.setFechaAlta(LocalDate.now());
        Cliente guardado = clienteRepositorio.guardar(cliente1);
        // ...
    };
}
```

La clase Application debe quedar limpia, **sin imports ni métodos de datos**:

```java
package com.iesdoctorbalmis.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

:::note
Los datos de inicialización ya no son responsabilidad del código Java: `import.sql` (que crearás a continuación) se encargará de poblar las tablas automáticamente cada vez que arranque la aplicación.
:::

---

### Crear import.sql

Crea: `src/main/resources/import.sql`

**Nota importante:** Usamos `import.sql` en lugar de `data.sql` porque Hibernate lo ejecuta **después** de crear las tablas (DDL). Cada sentencia INSERT debe estar **en una sola línea** para evitar errores de parsing.

```sql
-- Datos iniciales para Reto 1: De la Semilla a la Raíz
-- Hibernate ejecuta este archivo DESPUÉS de crear las tablas con @Entity

-- CLIENTES (estado en ciclo de vida: PROSPECTO, ACTIVO, INACTIVO)
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI001', 'Acme Corporation', 'contact@acmecorp.com', '+34-91-555-0001', 'ACTIVO', '2025-01-15', '2025-01-15');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI002', 'Juan García López', 'juan@example.com', '+34-91-555-0002', 'PROSPECTO', '2025-01-20', '2025-02-01');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI003', 'Ayuntamiento de Madrid', 'info@madrid.es', '+34-91-555-0003', 'ACTIVO', '2025-02-01', '2025-02-01');

-- PRODUCTOS (precioVenta para cliente, precioCoste para margen de beneficio)
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD001', 'Juego de Mesa Premium', 29.99, 15.50, 100, '2025-01-10', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD002', 'Expansion Avanzada', 14.99, 7.00, 50, '2025-01-15', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD003', 'Pack Accesorios', 9.99, 4.50, 200, '2025-01-20', true);

-- EMPLEADOS (departamento como texto, fecha_incorporacion)
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP001', 'Maria', 'Rodriguez Garcia', 'Jefe de Ventas', 'Ventas', 'maria@iesdoctorbalmis.edu', '2024-06-01', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP002', 'Carlos', 'Martinez Lopez', 'Jefe de Almacen', 'Almacén', 'carlos@iesdoctorbalmis.edu', '2024-07-15', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP003', 'Sofia', 'Lopez Martinez', 'Administrativo', 'Administración', 'sofia@iesdoctorbalmis.edu', '2024-08-01', true);
```

**Ventaja sobre Reto 0**: Los datos persisten en la BD; cuando se reinicia la app (con `create-drop`), se repueblan automáticamente desde `data.sql`.

---

## 9. H2 Console: Inspeccionar la BD

### Acceder a H2 Console

1. **Ejecuta el proyecto**: `mvn spring-boot:run`
2. **Abre tu navegador**: `http://localhost:9000/h2-console`
3. Verás una interfaz de login. Rellena si falta:
   - **Saved Settings**: `Generic H2`
   - **Setting Name**: `Generic H2`
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:mem:testdb`
   - **User Name**: `sa`
   - **Password**: (déjalo vacío)
4. Haz clic en **"Connect"**

### Explorar las tablas

En el panel izquierdo verás:
- `CLIENTES`
- `PRODUCTOS`
- `EMPLEADOS`

Puedes seleccionar una de las tablas, por ejemplo `CLIENTES`: aparecerá automáticamente la orden `SELECT` genérica para mostrar todo su contenido. Con el botón **Run** se ejecutará y se mostrarán los datos en la parte inferior. Con el botón **Clear** se borrará la instrucción y podrás repetir el proceso con otra tabla.

---

## 10. Transiciones y migraciones de datos

### Escenario: Del Reto 0 al Reto 1

Si tienes datos en ArrayList (Reto 0) que quieres migrar a BD (Reto 1):

#### Opción A: Crear un script SQL a partir del ArrayList

Si en Reto 0 tienes:
```java
@PostConstruct
public void inicializar() {
    clientes.add(new Cliente(1L, "CLI001", "Acme Corp", ...));
    clientes.add(new Cliente(2L, "CLI002", "Juan García", ...));
}
```

Conviértelo a `INSERT INTO` en `data.sql`:
```sql
INSERT INTO clientes VALUES (1, 'CLI001', 'Acme Corp', ...);
INSERT INTO clientes VALUES (2, 'CLI002', 'Juan García', ...);
```

#### Opción B: Usar un CommandLineRunner

Si quieres mantener cierta lógica Java:

```java
@Component
public class DataInitializer {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Bean
    public CommandLineRunner init() {
        return args -> {
            // Crear datos si la BD está vacía
            if (clienteRepository.count() == 0) {
                Cliente cliente1 = new Cliente(...);
                Cliente cliente2 = new Cliente(...);
                clienteRepository.saveAll(Arrays.asList(cliente1, cliente2));
            }
        };
    }
}
```

---

## 11. Testing con Datos Persistentes

Ahora tus pruebas unitarias pueden usar datos reales de la BD.

Crea: `src/test/java/com/iesdoctorbalmis/spring/repository/ClienteRepositoryTest.java`

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Cliente;
import com.iesdoctorbalmis.spring.entity.TipoCliente;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class ClienteRepositoryTest {
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Test
    public void debeGuardarUnCliente() {
        // Arrange
        Cliente cliente = new Cliente(
            null,
            "CLI999",
            "Test Cliente",
            "test@example.com",
            "+34-91-555-0099",
            TipoCliente.PERSONA_FISICA,
            LocalDate.now(),
            LocalDate.now()
        );
        
        // Act
        Cliente guardado = clienteRepository.save(cliente);
        
        // Assert
        assertNotNull(guardado.getId());
        assertEquals("Test Cliente", guardado.getNombre());
    }
    
    @Test
    public void debeBuscarClientePorEmail() {
        // Arrange
        Cliente cliente = new Cliente(
            null, "CLI888", "Test", "find@example.com",
            "+34-91-555-0088", TipoCliente.EMPRESA,
            LocalDate.now(), LocalDate.now()
        );
        clienteRepository.save(cliente);
        
        // Act
        Optional<Cliente> encontrado = clienteRepository.findByEmail("find@example.com");
        
        // Assert
        assertTrue(encontrado.isPresent());
        assertEquals("Test", encontrado.get().getNombre());
    }
}
```

**Nota**: `@DataJpaTest` crea automáticamente una BD de prueba H2 para cada test, aislando los datos.

---

## 12. Verificación del proyecto

### Compilar sin errores

```bash
mvn clean compile
```

Esperado:
```
[INFO] BUILD SUCCESS
```

### Ejecutar el proyecto

```bash
mvn spring-boot:run
```

En consola deberías ver:
```
...
[INFO] Started Application in X.XXX seconds (JVM running for X.XXX)
[INFO] Tomcat started on port 9000
```

### Verificar H2 Console

Abre `http://localhost:9000/h2-console` y verifica que las tablas existen:

```sql
SELECT * FROM clientes;
SELECT * FROM productos;
SELECT * FROM empleados;
```

---

## 13. Reflexión: Reto 1 → Reto 2

El Reto 1 te ha mostrado:
- ✓ Cómo Hibernate convierte anotaciones en tablas
- ✓ Cómo `JpaRepository` sustituye cientos de líneas de código
- ✓ Cómo H2 Console permite inspeccionar datos

En el **Reto 2** añadiremos:
- **REST Controllers**: Métodos HTTP para CRUD desde el navegador
- **DTO (Data Transfer Objects)**: Separación entre entidades BD y datos expuestos
- **Validaciones**: `@NotBlank`, `@Email`, etc.
- **Manejo de errores**: Excepciones y respuestas HTTP adecuadas

---

## 14. Actividades a realizar

1. **Transforma las POJO del Reto 0 en Entidades JPA** con anotaciones `@Entity`, `@Column`, etc.
2. **Crea los enums** `TipoCliente` y `Departamento`
3. **Configura application.properties** con H2 y Hibernate
4. **Implementa los Repositorios** extendiendo `JpaRepository`
5. **Crea data.sql** con datos iniciales
6. **Accede a H2 Console** y ejecuta consultas SQL
7. **Escribe tests** usando `@DataJpaTest`
8. **Compila y ejecuta** el proyecto sin errores

---

## 15. Entregable: Proyecto con JPA y H2

El proyecto entregable debe incluir:

### Estructura de carpetas

```
erpbalmis_1/
├── pom.xml                          # Incluye Spring Data JPA y H2
├── src/main/
│   ├── java/com/iesdoctorbalmis/spring/
│   │   ├── entity/
│   │   │   ├── Cliente.java         # @Entity
│   │   │   ├── Producto.java        # @Entity  
│   │   │   ├── Empleado.java        # @Entity
│   │   │   └── TipoCliente.java     # Enum (PROSPECTO, ACTIVO, INACTIVO)
│   │   ├── repository/
│   │   │   ├── ClienteRepository.java
│   │   │   ├── ProductoRepository.java
│   │   │   └── EmpleadoRepository.java
│   │   └── ErpBalmisReto0Application.java
│   └── resources/
│       ├── application.properties     # Configuración H2 y JPA
│       └── import.sql                 # Datos iniciales
└── src/test/
    └── java/com/iesdoctorbalmis/spring/
        └── repository/
            └── ClienteRepositoryTest.java  # Tests JPA
```

### Checklist de validación

- [x] La aplicación compila sin errores ✅
- [x] El proyecto contiene entidades `@Entity` con anotaciones JPA ✅
- [x] Los repositorios extienden `JpaRepository` ✅
- [x] Se puede acceder a H2 Console (`localhost:9000/h2-console`) ✅
- [x] Las tablas se crean automáticamente en la BD ✅
- [x] Los datos de `import.sql` se insertan correctamente ✅
- [ ] Los tests con `@DataJpaTest` pasan sin errores (Actividad para estudiantes)
- [ ] Se pueden hacer consultas en H2 Console y obtener resultados (Actividad para estudiantes)

---

**¡Reto 1 completado! Ahora tienes persistencia real. En Reto 2 expondremos estos datos a través de REST.**
