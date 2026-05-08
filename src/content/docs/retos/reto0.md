---
title: Reto 0 — La Semilla
description: UD4 · Proyecto Spring Boot inicial con entidades POJO y repositorios ArrayList
---

## Objetivo

Crear el proyecto Spring Boot base del ERP Balmis con entidades Java puras y repositorios manuales con `ArrayList`.

**Por qué:** entender exactamente qué hace JPA antes de usarlo. Si implementamos el CRUD a mano, sabremos lo que Spring hace por nosotros en el Reto 1.

## Duración

4 horas

## Repositorio

[github.com/lestan-balmis/sge-reto0](https://github.com/lestan-balmis/sge-reto0)

## Entidades

```java
public class Cliente {
    private Long id;
    private String nombre;
    private String email;
    private TipoCliente tipo; // ACTIVO, PROSPECTO, INACTIVO
}

public class Producto {
    private Long id;
    private String nombre;
    private Double precio;
    private Integer stock;
}

public class Empleado {
    private Long id;
    private String nombre;
    private String puesto;
    private Double salario;
}
```

## Estructura del proyecto

```
src/main/java/com/iesbal/erpbalmis/
├── ErpBalmisReto0Application.java
├── modelo/
│   ├── Cliente.java
│   ├── Producto.java
│   ├── Empleado.java
│   └── TipoCliente.java
└── repositorio/
    ├── ClienteRepositorio.java
    ├── ProductoRepositorio.java
    └── EmpleadoRepositorio.java
```

## Entregable

Proyecto Spring Boot con entidades POJO + repositorios ArrayList con CRUD completo funcionando.
