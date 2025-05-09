server {
    listen 80;
    server_name localhost;

    # Raíz por defecto, se espera que los assets de los frontends estén aquí
    # Ejemplo: /usr/share/nginx/html/main/dashboard/index.html
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        # Intenta servir el archivo directamente, luego como directorio, luego fallback al index.html principal (si existe)
        # Esto es muy básico y necesitará mejoras para SPAs múltiples.
        try_files $uri $uri/ /index.html; 
    }

    ##FRONTEND_LOCATIONS##

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}