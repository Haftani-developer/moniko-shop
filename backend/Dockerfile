FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# تست‌ها در CI (GitHub Actions) اجرا می‌شوند؛ اینجا حتی کامپایل تست‌ها هم رد می‌شود تا دیپلوی هیچ‌وقت به‌خاطر تست نشکند
RUN mvn -q -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
