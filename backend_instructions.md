# Guía de Implementación de Backend

Este Frontend está construido en React y actualmente utiliza un servicio simulado (`services/api.ts`) para funcionar de manera autónoma. Para convertirlo en una aplicación FullStack real utilizando la arquitectura solicitada (Python Lambda AWS + PostgreSQL), debes implementar los siguientes microservicios.

## Arquitectura Sugerida

1.  **Base de Datos (PostgreSQL en AWS RDS):**
    *   Tabla `users`: id, email, password_hash, name, role.
    *   Tabla `products`: id, name, description, price, stock, image_url, category.
    *   Tabla `orders`: id, user_id, total_amount, status, created_at.
    *   Tabla `order_items`: id, order_id, product_id, quantity, price_at_purchase.

2.  **Microservicios (AWS Lambda + API Gateway):**

    *   **Servicio de Autenticación (Auth Service):**
        *   `POST /auth/login`: Valida credenciales y retorna JWT.
        *   `POST /auth/register`: Crea nuevo usuario en BD.
        *   *Librerías Python:* `psycopg2` (BD), `pyjwt` (Tokens), `bcrypt` (Hashing pass).

    *   **Servicio de Productos (Product Catalog Service):**
        *   `GET /products`: Retorna lista JSON. Soporta filtros.
        *   `POST /products` (Admin protegido): Crea producto.
        *   `PUT /products/{id}` (Admin protegido): Actualiza stock/precios.
        *   `DELETE /products/{id}` (Admin protegido): Elimina lógico.
    
    *   **Servicio de Usuarios (User Management Service) [NUEVO]:**
        *   `GET /users` (Admin protegido): Retorna lista de todos los usuarios.
        *   `PUT /users/{id}` (Admin protegido): Actualiza datos de usuario (nombre, email, rol).
        *   `DELETE /users/{id}` (Admin protegido): Elimina usuario.

    *   **Servicio de Órdenes (Order Processing Service):**
        *   `POST /orders`: Recibe array de items + ID usuario.
            1.  Inicia transacción BD.
            2.  Verifica stock disponible.
            3.  Resta stock.
            4.  Crea registro en `orders` y `order_items`.
            5.  (Opcional) Integra pasarela de pago (Stripe/PayPal).
            6.  Commit transacción o Rollback si falla.

## Integración con Frontend

Una vez desplegados tus Lambdas, ve al archivo `src/services/api.ts` en este proyecto React y reemplaza las funciones simuladas con llamadas reales usando `fetch` o `axios`:

Ejemplo:

```typescript
// services/api.ts
const API_URL = "https://tu-api-gateway-id.execute-api.us-east-1.amazonaws.com/prod";

export const api = {
  products: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/products`);
      return res.json();
    },
    // ... resto de métodos
  }
}
```

## Principios SOLID Aplicados en Frontend

1.  **Single Responsibility:** Cada componente (Card, Navbar) tiene una única función visual. Los servicios (`api.ts`) manejan la lógica de datos, no la UI.
2.  **Open/Closed:** Los componentes como `ProductCard` están abiertos a extensión (props) pero cerrados a modificación interna compleja.
3.  **Interface Segregation:** Se usan interfaces pequeñas (`User`, `Product`) en lugar de un tipo gigante de estado global.
4.  **Dependency Inversion:** Los componentes dependen de abstracciones (Hooks `useCart`, `useAuth`) y no de la implementación concreta del almacenamiento (localStorage).