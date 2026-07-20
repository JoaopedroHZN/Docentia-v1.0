package br.com.docentia.agenda;

import br.com.docentia.agenda.model.Instrutor;
import br.com.docentia.agenda.model.Perfil;
import br.com.docentia.agenda.repository.InstrutorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class DocentiaApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocentiaApplication.class, args);
	}

	@Bean
	public CommandLineRunner testeBanco(InstrutorRepository repository) {
		return args -> {
			// So tenta salvar o admin padrao SE a tabela estiver vazia (count == 0)!
			if (repository.count() == 0) {
				System.out.println("---  BANCO VAZIO! CADASTRANDO ADMIN PADRAO ---");
				BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
				String senhaCriptografada = encoder.encode("senha_secreta_123");
				Instrutor admin = new Instrutor("Alex Coordenador", "alex@docentia.com", senhaCriptografada, Perfil.ADMIN, null);
				repository.save(admin);
				System.out.println("---  ADMIN CADASTRADO COM ID: " + admin.getId() + " ---");
			} else {
				System.out.println("---  O BANCO JA TEM USUARIOS CADASTRADOS. PULANDO TESTE ---");
			}
		};
	}
}