FROM openjdk:8-jdk-alpine
VOLUME /tmp
COPY build/libs/docusign-app-0.1.0.jar docusign-app-0.1.0.jar
ENTRYPOINT ["java","-jar","/docusign-app-0.1.0.jar"]