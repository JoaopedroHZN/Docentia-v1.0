package br.com.docentia.agenda.config;


import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Libera TODAS as rotas da API
                .allowedOrigins("*") // Libera requisições de QUALQUER porta (ex: porta 3000 do React, 5173 do Vite, etc)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Libera os metodos
                .allowedHeaders("*"); // Libera o envio de todos os cabeçalhos (principalmente o Token JWT!)
    }
}
