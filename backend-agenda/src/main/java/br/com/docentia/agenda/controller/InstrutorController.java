package br.com.docentia.agenda.controller;


import br.com.docentia.agenda.dto.DadosPrimeiroAcesso;
import br.com.docentia.agenda.model.Instrutor;
import br.com.docentia.agenda.repository.InstrutorRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RestController //Dados formatados como JSON
@RequestMapping("/instrutores") // endereço http://localhost:8080/instrutores
public class InstrutorController {

    private final InstrutorRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public InstrutorController(InstrutorRepository repository, BCryptPasswordEncoder passwordEncoder){
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public org.springframework.data.domain.Page<Instrutor> listarTodos(org.springframework.data.domain.Pageable paginacao){
        return repository.findAll(paginacao);
    }


    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Instrutor> cadastrar(@Valid @RequestBody Instrutor instrutor){
         if (instrutor.getSenha() != null && !instrutor.getSenha().isBlank()) {
             String senhaCriptografada = passwordEncoder.encode(instrutor.getSenha());
             instrutor.setSenha(senhaCriptografada);
         }

        Instrutor instrutorSalvo = repository.save(instrutor);
        return ResponseEntity.status(201).body(instrutorSalvo);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid Instrutor instrutorAtualizado){

        return repository.findById(id).map(instrutorAntigo ->{
            instrutorAntigo.setNome(instrutorAtualizado.getNome());
            instrutorAntigo.setEmail(instrutorAtualizado.getEmail());
            if (instrutorAtualizado.getSenha() != null && !instrutorAtualizado.getSenha().isBlank()){
                String novaSenhaCriptografada = passwordEncoder.encode(instrutorAtualizado.getSenha());
                instrutorAntigo.setSenha(novaSenhaCriptografada);
            }
            instrutorAntigo.setPerfil(instrutorAtualizado.getPerfil());
            instrutorAntigo.setCurso(instrutorAtualizado.getCurso());

            Instrutor salvo = repository.save(instrutorAntigo);

            return org.springframework.http.ResponseEntity.ok(salvo);
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<Void> deletar(@PathVariable Long id){
        //Se nao existe o instrutor ele da nao encontrado
        if(!repository.existsById(id)){
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        //Se existir ele deleta o id passado como argumento
        repository.deleteById(id);

        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @PostMapping("/primeiro-acesso")
    public ResponseEntity<?> primeiroAcesso(@RequestBody @Valid DadosPrimeiroAcesso dados){

        // Avisamos ao Java com (Instrutor) que o resultado da busca é a nossa classe original!
        Instrutor instrutor = (Instrutor) repository.findByEmail(dados.email());

        if (instrutor == null){
            return ResponseEntity.status(404).body("Email nao encontrado! Verifique se a coordenacao ja realizou seu cadastro");
        }

        // Agora o getSenha() e o setSenha() voltam a aparecer perfeitamente!
        if (instrutor.getSenha() != null && !instrutor.getSenha().isBlank()){
            return ResponseEntity.badRequest().body("Este email ja possui uma senha cadastrada. Faca o login normal!");
        }

        String senhaCriptografada = passwordEncoder.encode(dados.novaSenha());
        instrutor.setSenha(senhaCriptografada);
        repository.save(instrutor);

        return ResponseEntity.ok("Senha cadastrada com sucesso! Agora voce ja pode entrar no sistema.");
    }

    @GetMapping("/por-curso")
    public ResponseEntity<?> listarPorCurso(@RequestParam String curso) {
        return ResponseEntity.ok(repository.findByCurso(curso));
    }


}
