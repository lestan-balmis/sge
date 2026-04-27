---
title: Presentación del módulo SGE
description: Primera clase del módulo — visión general del módulo y del proyecto ERP Balmis
---

## ¿Qué vamos a hacer este curso?

> Vamos a aprender cómo funciona un ERP de clase mundial... **y luego vamos a construir uno desde cero.**

Al final del módulo podrás decir:
- ✅ *"Sé cómo funciona un ERP/CRM de clase mundial."*
- ✅ *"Sé construir la arquitectura que lo sostiene desde cero."*

---

## El módulo en dos fases

| Fase | Herramienta | Horas | Lo que aprendemos |
|---|---|---|---|
| 🔍 Referencia | **Axelor** | 14h | Qué hace un ERP profesional |
| 🔨 Implementación | **Spring Boot** | 54h | Cómo se construye desde cero |

---

## El proyecto: ERP Balmis

Un **mini ERP/CRM funcional** construido con Spring Boot, inspirado en Axelor.

El nombre *Balmis* rinde homenaje a **Francisco Javier Balmis**, médico alicantino que organizó la primera expedición vacunadora global de la historia (1803).

### Módulos del ERP Balmis

| Módulo | Contenido |
|---|---|
| Core | Usuarios, roles, autenticación |
| CRM | Clientes, contactos |
| Ventas | Productos, pedidos, facturas |
| Compras | Proveedores, órdenes de compra |
| RRHH | Empleados, departamentos |
| Dashboard | KPIs en tiempo real |

---

## Las tecnologías

| Capa | Tecnología | ¿Cuándo entra? |
|---|---|---|
| Framework | **Spring Boot 4** | Desde el inicio |
| Persistencia | **Spring Data JPA** | Reto 1 |
| Base de datos dev | **H2** | Reto 1 |
| Vistas web | **Thymeleaf** | Reto 2 |
| API REST | **@RestController** | Reto 3 |
| Documentación API | **Swagger / OpenAPI 3** | Reto 4 |
| Seguridad | **Spring Security + JWT** | Reto 6 |
| Build | **Apache Maven** | Desde el inicio |

---

## Los 9 Retos

```
RETO 0  →  RETO 1  →  RETO 2  →  RETO 3  →  RETO 4
La Semilla  El Modelo  La Vista   La Trans.   El CRM
(4h)        (6h)       (4h)       (4h)        (10h)
POJO +      JPA +     Thymeleaf   REST +      CRUD +
ArrayList   H2 BD      HTML       Postman    Swagger

RETO 5  →  RETO 6  →  RETO 7  →  RETO FINAL
Las Ventas  La Segur.  Las Compras ERP Completo
(8h)        (8h)       (4h)        (6h)
Pedidos +   JWT +      Proveed. +  Dashboard +
workflow    Roles      Órdenes     RRHH + Git
```

---

## Evaluación

| Evaluación | Horas | Contenido |
|---|---|---|
| 1ª Evaluación | 32h | UD1-UD3 Axelor + Retos 0, 1, 2, 3 |
| ⚠️ Examen Práctico 1 | — | JPA + Thymeleaf + REST básico |
| 2ª Evaluación | 30h | Retos 4, 5, 6, 7 |
| ⚠️ Examen Práctico 2 | — | CRM + Swagger + JWT |
| Reto Final | 6h | Dashboard + presentación |

### ¿Cuánto necesito para aprobar?

| Nivel | Retos completados |
|---|---|
| **Aprobado** | Retos 0 → 4 |
| **Notable** | Retos 0 → 7 |
| **Sobresaliente** | Todos + Reto Final |
