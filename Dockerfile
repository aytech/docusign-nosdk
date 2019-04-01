# Stage 1 - build UI
FROM node:alpine as node
WORKDIR '/app'
COPY client/package.json .
RUN npm install
COPY client/public/ public/
COPY client/src/ src/
RUN npm run build

# Stage 2 - build server
FROM openjdk:8-jdk-alpine as server
WORKDIR '/app'
COPY server/gradle gradle
COPY server/src src
COPY server/build.gradle .
COPY server/gradlew .
COPY server/settings.gradle .
COPY --from=node /app/build /app/src/main/resources/static
RUN ./gradlew build

# Stage 3 - run the app
FROM openjdk:8-jdk-alpine
LABEL maintainer="Oleg Yapparov <oleg.yapparov@infor.com>"
VOLUME /tmp
COPY --from=server /app/build/libs/docusign-app-0.1.0.jar .
ENTRYPOINT ["java","-jar","docusign-app-0.1.0.jar"]
