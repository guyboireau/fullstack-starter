# syntax=docker/dockerfile:1
#
# API NestJS — image de développement.
# Le contexte de build est la RACINE du monorepo (voir docker-compose.yml) :
# les workspaces npm imposent d'installer les dépendances depuis la racine.
FROM node:22-alpine

WORKDIR /app

# Installe les dépendances à partir des seuls manifestes, pour que cette couche
# reste en cache tant que package.json / package-lock.json ne changent pas.
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN npm ci --workspace apps/api --include-workspace-root

# Le code source est monté en volume par docker-compose en développement ;
# cette copie sert aux builds autonomes (`docker build`).
COPY tsconfig.base.json ./
COPY apps/api ./apps/api

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "apps/api"]
