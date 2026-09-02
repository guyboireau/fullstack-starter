# syntax=docker/dockerfile:1
#
# Front Astro SSR — image de développement.
# Le contexte de build est la RACINE du monorepo (voir docker-compose.yml) :
# les workspaces npm imposent d'installer les dépendances depuis la racine.
FROM node:22-alpine

WORKDIR /app

# Installe les dépendances à partir des seuls manifestes, pour que cette couche
# reste en cache tant que package.json / package-lock.json ne changent pas.
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci --workspace apps/web --include-workspace-root

# Le code source est monté en volume par docker-compose en développement ;
# cette copie sert aux builds autonomes (`docker build`).
COPY tsconfig.base.json ./
COPY apps/web ./apps/web

# Port du serveur de développement Astro.
EXPOSE 4321

# --host expose le serveur en dehors du conteneur (sinon il n'écoute que sur
# 127.0.0.1 et reste injoignable depuis la machine hôte).
CMD ["npm", "run", "dev", "--workspace", "apps/web", "--", "--host", "0.0.0.0"]
