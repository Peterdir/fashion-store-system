package org.example.fashionstoresystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FashionStoreSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(FashionStoreSystemApplication.class, args);
	}

}
