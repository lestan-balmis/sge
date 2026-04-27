---
title: UD1 — Identificación ERP-CRM
description: Axelor como referencia funcional — qué es un ERP, qué es un CRM, instalación con Docker
---

## ¿Qué es un ERP?

Un **ERP** *(Enterprise Resource Planning)* es el software que gestiona **toda** una empresa en un único sistema integrado: ventas, compras, RRHH, contabilidad, almacén...

## ¿Qué es un CRM?

Un **CRM** *(Customer Relationship Management)* gestiona la relación con los clientes: prospectos, contactos, oportunidades, seguimiento comercial.

> El CRM es normalmente un módulo dentro del ERP.

## Axelor — nuestra referencia

**Axelor** es un ERP Open Source (GNU AGPL) desarrollado en Java + Angular con más de 30 módulos integrados.

| Característica | Valor |
|---|---|
| Licencia | GNU AGPL (Open Source) |
| Lenguaje | Java + Angular |
| Base de datos | PostgreSQL |
| Módulos | +30 |
| Docker | `axelor/aos-ce:latest` |

## Instalación con Docker

```yaml
version: '3.8'
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: axelor
      POSTGRES_USER: axelor
      POSTGRES_PASSWORD: axelor
  axelor:
    image: axelor/aos-ce:latest
    ports:
      - "8080:8080"
    depends_on:
      - db
```

Acceso: `http://localhost:8080` — usuario: `admin` / contraseña: `admin`

## Comparativa de ERPs

| ERP | Licencia | Lenguaje | Tipo de empresa |
|---|---|---|---|
| **Axelor** | Open Source (GNU AGPL) | Java | PYME → Gran empresa |
| Odoo | Open Source (Community) | Python | PYME → Gran empresa |
| SAP | Propietaria | ABAP / Java | Gran empresa |

## Conexión con ERP Balmis

| Axelor | ERP Balmis |
|---|---|
| Módulo CRM → Cliente | Clase `Cliente.java` + enum `TipoCliente` |
| Lista de clientes | `GET /api/clientes` |
| Módulo Ventas → Pedido | `Pedido.java` + `LineaPedido.java` |
| Roles y permisos | Spring Security + JWT + Roles |

## Actividades de la UD1

1. Accede a Axelor Demo o instalación Docker
2. Navega por los módulos y anota su función
3. Crea un cliente en el módulo CRM
4. Compara la ficha de cliente de Axelor con la clase `Cliente.java` del ERP Balmis
5. Elabora una tabla comparativa de 3 ERPs del mercado
