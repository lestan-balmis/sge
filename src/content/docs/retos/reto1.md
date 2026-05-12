---
title: "Reto 1: De la Semilla a la Raíz"
description: Transformar Reto 0 (ArrayList) en Entidades JPA persistentes con H2 Database.
---

### Reto 1 · De la Semilla a la Raíz
**Módulo SGE · DAM · IES Balmis**

---

> **Duración:** 6 horas  
> **Teoría requerida:** [UD4 — JPA, Hibernate, H2](/docs/spring/ud4#9-jpa-java-persistence-api)  
> **Reto anterior:** [Reto 0 — La Semilla](/docs/retos/reto0)

---

## 📌 Resumen del Reto

Transformarás el Reto 0 añadiendo:
- **Anotaciones JPA:** `@Entity`, `@Id`, `@Column`, etc.
- **Repositorios JPA:** `JpaRepository` en lugar de ArrayList
- **Base de datos H2:** Persistencia real
- **H2 Console:** Inspeccionar datos en la BD
- **import.sql:** Datos iniciales

---

## Guía de Implementación

### 1. Prepara el Reto 0 para evolucionar

Copia tu proyecto del Reto 0 y trabaja sobre la copia. Mueve las entidades de `model/` a `entity/` y actualiza los `package`:

```java
// Cambiar de:
package com.iesdoctorbalmis.spring.model;

// A:
package com.iesdoctorbalmis.spring.entity;
```

Verifica que `pom.xml` contenga:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 2. Anotaciones JPA

Transforma tus POJOs añadiendo `@Entity` y anotaciones de columnas.

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

**Producto.java**

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

**Empleado.java**

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

**TipoCliente.java**

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

### 3. Configurar H2 Database

Actualiza `src/main/resources/application.properties`:

```properties
spring.application.name=spring
server.port=9000

spring.datasource.url=jdbc:h2:mem:erpbalmis
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.defer-datasource-initialization=true

spring.sql.init.mode=always

logging.level.root=INFO
logging.level.com.iesdoctorbalmis.spring=DEBUG
```

### 4. Repositorios JPA

Borra los repositorios ArrayList del Reto 0 y crea los nuevos:

**ClienteRepository.java**

```java
package com.iesdoctorbalmis.spring.repository;

import com.iesdoctorbalmis.spring.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByEmail(String email);
    Optional<Cliente> findByCodigoCliente(String codigoCliente);
    boolean existsByEmail(String email);
    boolean existsByCodigoCliente(String codigoCliente);
}
```

**ProductoRepository.java**

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

**EmpleadoRepository.java**

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

### 5. Datos Iniciales

Crea `src/main/resources/import.sql`:

```sql
-- Clientes
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI001', 'Acme Corporation', 'contact@acmecorp.com', '+34-91-555-0001', 'ACTIVO', '2025-01-15', '2025-01-15');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI002', 'Juan García López', 'juan@example.com', '+34-91-555-0002', 'PROSPECTO', '2025-01-20', '2025-02-01');
INSERT INTO clientes (codigo_cliente, nombre, email, telefono, tipo_cliente, fecha_alta, fecha_modificacion) VALUES ('CLI003', 'Ayuntamiento de Madrid', 'info@madrid.es', '+34-91-555-0003', 'ACTIVO', '2025-02-01', '2025-02-01');

-- Productos
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD001', 'Juego de Mesa Premium', 29.99, 15.50, 100, '2025-01-10', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD002', 'Expansion Avanzada', 14.99, 7.00, 50, '2025-01-15', true);
INSERT INTO productos (referencia, descripcion, precio_venta, precio_coste, stock, fecha_alta, activo) VALUES ('PROD003', 'Pack Accesorios', 9.99, 4.50, 200, '2025-01-20', true);

-- Empleados
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP001', 'Maria', 'Rodriguez Garcia', 'Jefe de Ventas', 'Ventas', 'maria@iesdoctorbalmis.edu', '2024-06-01', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP002', 'Carlos', 'Martinez Lopez', 'Jefe de Almacen', 'Almacén', 'carlos@iesdoctorbalmis.edu', '2024-07-15', true);
INSERT INTO empleados (numero_empleado, nombre, apellidos, cargo, departamento, email, fecha_incorporacion, activo) VALUES ('EMP003', 'Sofia', 'Lopez Martinez', 'Administrativo', 'Administración', 'sofia@iesdoctorbalmis.edu', '2024-08-01', true);
```

### 6. Limpia Application.java

Elimina el `CommandLineRunner` del Reto 0:

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

### 7. Verificación

```bash
mvn spring-boot:run
```

Abre `http://localhost:9000/h2-console` para inspeccionar la BD.

---

## Actividades a realizar

1. [ ] Transforma POJOs en Entidades JPA (@Entity, @Column, @Enumerated)
2. [ ] Configura H2 en application.properties
3. [ ] Crea los 3 repositorios JpaRepository
4. [ ] Crea import.sql con datos iniciales
5. [ ] Limpia Application.java (elimina CommandLineRunner)
6. [ ] Ejecuta la aplicación sin errores
7. [ ] Accede a H2 Console y consulta las tablas
8. [ ] Haz commit en Git con mensaje "Reto 1 completado"

---

## Entregable

### Validación

- [ ] Compila sin errores (`mvn clean compile`)
- [ ] Contiene entidades JPA con anotaciones correctas
- [ ] Repositorios extienden `JpaRepository`
- [ ] H2 Console accesible en `http://localhost:9000/h2-console`
- [ ] Tablas creadas automáticamente
- [ ] Datos de import.sql insertados correctamente
- [ ] Commit realizado en Git

### Estructura esperada

```
spring/
├── pom.xml (con Spring Data JPA y H2)
├── src/main/
│   ├── java/com/iesdoctorbalmis/spring/
│   │   ├── entity/ (Cliente, Producto, Empleado, TipoCliente)
│   │   ├── repository/ (ClienteRepository, ProductoRepository, EmpleadoRepository - JpaRepository)
│   │   └── Application.java
│   └── resources/
│       ├── application.properties (con H2)
│       └── import.sql (datos iniciales)
└── target/
```

---

**Próximo:** [Reto 2](/docs/retos/reto2) → REST Controllers, DTO, Validaciones
