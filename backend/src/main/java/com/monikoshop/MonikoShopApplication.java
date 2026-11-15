package com.monikoshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MonikoShopApplication {
    public static void main(String[] args) {
        SpringApplication.run(MonikoShopApplication.class, args);
    }
}
