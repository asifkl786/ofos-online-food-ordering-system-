package com.ofos;

import java.net.URI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class OnlineFoodOrderingSystemApplication {
 
 public static void main(String[] args) {
     configureRenderDatabaseUrl();
     SpringApplication.run(OnlineFoodOrderingSystemApplication.class, args);
 }

 private static void configureRenderDatabaseUrl() {
     String databaseUrl = System.getenv("DATABASE_URL");
     if (databaseUrl == null || databaseUrl.isBlank() || System.getenv("DB_URL") != null) {
         return;
     }

     URI uri = URI.create(databaseUrl);
     String[] userInfo = uri.getUserInfo() != null ? uri.getUserInfo().split(":", 2) : new String[] {"", ""};
     String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();

     System.setProperty("DB_URL", jdbcUrl);
     if (System.getenv("DB_USERNAME") == null && userInfo.length > 0) {
         System.setProperty("DB_USERNAME", userInfo[0]);
     }
     if (System.getenv("DB_PASSWORD") == null && userInfo.length > 1) {
         System.setProperty("DB_PASSWORD", userInfo[1]);
     }
 }
}
