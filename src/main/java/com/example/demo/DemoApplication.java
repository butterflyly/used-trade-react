package com.example.demo;

import org.springframework.core.env.Environment;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableJpaAuditing // 추가
public class DemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(DemoApplication.class, args);
	}

	@Bean
	public ApplicationRunner checkMailConfig(Environment env) {
		return args -> {
			System.out.println("SMTP Host: "
					+ env.getProperty("spring.mail.host"));

			System.out.println("SMTP Port: "
					+ env.getProperty("spring.mail.port"));

			System.out.println("SMTP Username: "
					+ env.getProperty("spring.mail.username"));
		};
	}
}
