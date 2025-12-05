# tbd-2-2025
base de datos de taller de base de datos

# 🌱 Créditos Verdes – README Oficial

Guía completa para **instalar, configurar y ejecutar ** el proyecto Créditos Verdes (Backend + Frontend).



# 🛠 Requisitos previos

Asegúrate de tener instalado:

- Node.js 18+
- NPM 9+
- MySQL 8.x
- Git
- (Opcional) Prisma Studio

---

# 🧩 Backend – Instalación y ejecución

### 1. Entrar a la carpeta

```bash
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

Crear en `/backend`:

```
DATABASE_URL="mysql://usuario:password@localhost:3306/creditos_verdes"
JWT_SECRET="supersecreto123"
PORT=4000
FILE_UPLOAD_PATH=uploads
```

### 4. Crear base de datos MySQL

```sql
CREATE DATABASE creditos_verdes;
```

### 5. Ejecutar migraciones Prisma

```bash
npx prisma migrate deploy
```

Opcional:

```bash
npx prisma studio
```

### 6. Iniciar backend

```bash
npm run dev
```

Backend activo en:

```
http://localhost:4000/api
```

---

# 💻 Frontend – Instalación y ejecución

### 1. Entrar a la carpeta

```bash
cd ../frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

```
VITE_API_URL=http://localhost:4000/api
```

### 4. Ejecutar frontend

```bash
npm run dev
```

Abrir en navegador:

```
http://localhost:5173
```

---

# 🔗 Comunicación Backend ↔ Frontend

Probar conexión:

```
http://localhost:4000/api/auth/me
```

- Si no hay token → responde **401**
- Con token válido → devuelve usuario autenticado

---


# 🧪 Scripts útiles

## Backend
```
npm run dev
npm run start
npm run build
npx prisma studio
```

## Frontend
```
npm run dev
npm run build
npm run preview
```

`# ⚠ Notas importantes

- La carpeta `/uploads` debe existir y tener permisos.
- Verificar `FILE_BASE_URL` para mostrar imágenes.
- Revisar CORS si el frontend no puede conectarse.
- Comprobar que `VITE_API_URL` esté correcto en producción.

---

# 🎉 Estado del proyecto

✔ Backend funcionando  
✔ Frontend operativo  
✔ Base de datos inicializada  
✔ API modular y escalable  

Sistema listo para desarrollo, pruebas o despliegue.

---