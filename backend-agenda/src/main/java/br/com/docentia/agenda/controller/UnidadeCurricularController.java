package br.com.docentia.agenda.controller;

import br.com.docentia.agenda.model.UnidadeCurricular;
import br.com.docentia.agenda.repository.UnidadeCurricularRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ucs")
public class UnidadeCurricularController {

    private final UnidadeCurricularRepository repository;

    public UnidadeCurricularController(UnidadeCurricularRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<UnidadeCurricular> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao);
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String termo) {
        return ResponseEntity.ok(repository.findByNomeContainingIgnoreCase(termo));
    }

    @GetMapping("/por-curso")
    public ResponseEntity<?> listarPorCurso(@RequestParam String curso) {
        return ResponseEntity.ok(repository.findByCurso(curso));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnidadeCurricular> cadastrar(@RequestBody @Valid UnidadeCurricular uc) {
        return ResponseEntity.status(201).body(repository.save(uc));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid UnidadeCurricular atualizada) {
        return repository.findById(id).map(uc -> {
            uc.setNome(atualizada.getNome());
            uc.setCargaHoraria(atualizada.getCargaHoraria());
            uc.setCurso(atualizada.getCurso());
            uc.setAtivo(atualizada.getAtivo());
            return ResponseEntity.ok(repository.save(uc));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}