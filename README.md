# 🐉 Dragonbane Campaign Companion

Aplicación interactiva diseñada específicamente para campañas de rol de **Dragonbane** (*Drakar och Demoner* de Free League).

---

## 🛠️ Arquitectura y Entornos

* **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons.
* **Backend:** API REST en PHP 8 con PDO y sentencias preparadas.
* **Base de datos:** MySQL (compatible con XAMPP local y Hostinger producción).

---

## 💻 1. Entorno de Desarrollo (Local en tu PC)

### Paso A: Base de Datos Local (XAMPP)
1. Abre el **Panel de Control de XAMPP** e inicia el servicio **MySQL** (y Apache si deseas, o usas el servidor PHP CLI).
2. Abre phpMyAdmin en tu navegador (`http://localhost/phpmyadmin`).
3. Puedes crear la base de datos `dragonbane_db` o simplemente ejecutar el instalador web automático abriendo:
   `http://localhost:8000/setup.php`

### Paso B: Iniciar la API Backend
Desde la raíz del proyecto o consola PowerShell:
```powershell
# Iniciar servidor backend en el puerto 8000
php -S localhost:8000 -t api
```

### Paso C: Iniciar el Frontend
En otra ventana de terminal:
```powershell
cd frontend
npm run dev
```
Abre en tu navegador: `http://localhost:5173`

---

## 🚀 2. Entorno de Producción (Hostinger)

### Paso A: Crear la Base de Datos en Hostinger
1. Entra a tu **hPanel de Hostinger**.
2. Ve a **Bases de datos MySQL**.
3. Crea una nueva base de datos (por ejemplo: `u123456789_dragonbane`).
4. Anota el **Nombre de la base de datos**, **Usuario** y **Contraseña**.
5. Abre **phpMyAdmin** desde Hostinger e importa el archivo [api/schema.sql](file:///C:/Users/Víctor/.gemini/antigravity/scratch/dragonbane-companion/api/schema.sql) (o abre la URL `https://tudominio.com/api/setup.php` una vez subidos los archivos).

### Paso B: Configurar credenciales en Hostinger
En la carpeta `api/` de tu servidor en Hostinger, crea o edita el archivo `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_dragonbane
DB_USER=u123456789_usuario
DB_PASS=TuContraseñaSegura123
```

### Paso C: Compilar y subir la aplicación
1. En tu PC, genera la versión de producción del frontend:
   ```powershell
   cd frontend
   npm run build
   ```
2. Esto creará la carpeta `frontend/dist/`.
3. Sube el contenido al Administrador de Archivos de Hostinger (`public_html`):
   * Sube todos los archivos y carpetas dentro de `frontend/dist/` directamente a la raíz de `public_html/`.
   * Sube la carpeta `api/` completa dentro de `public_html/api/`.

Estructura final en Hostinger:
```
public_html/
├── api/
│   ├── .env
│   ├── .htaccess
│   ├── config.php
│   ├── characters.php
│   ├── shops.php
│   ├── screen.php
│   └── schema.sql
├── index.html
├── assets/
│   ├── index-xxxx.js
│   └── index-xxxx.css
└── vite.svg
```

¡Y listo! Tu app estará accesible 24/7 en tu dominio para todos tus jugadores.
