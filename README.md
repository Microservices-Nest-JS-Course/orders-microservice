<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Orders Microservice

## Dev

1. Clonar el repositorio
```bash
git clone 
```
2. Instalar dependencias
```bash
pnpm install
```
3. Crear un archivo `.env` basado en el `.env.template`
4. Ejecutar la migración de prisma
```bash
npx prisma migrate dev
```
5. Ejecutar el microservicio
```bash
pnpm start:dev
```