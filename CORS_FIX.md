# CORS Fix for Spring Boot Backend

Add this configuration to your main Spring Boot application class:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "https://phonepe-react-frontend.onrender.com",
                    "https://phonepay-api-backend-1.onrender.com",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

OR add to application.properties:

```properties
# CORS Configuration
spring.mvc.cors.allowed-origins=https://phonepe-react-frontend.onrender.com,https://phonepay-api-backend-1.onrender.com,http://localhost:3000
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true
```

Deploy this to your backend repository and redeploy!
