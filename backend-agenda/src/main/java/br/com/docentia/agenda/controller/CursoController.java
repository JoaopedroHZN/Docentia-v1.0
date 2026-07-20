package br.com.docentia.agenda.controller;

import br.com.docentia.agenda.model.Curso;
import br.com.docentia.agenda.repository.CursoRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    private final CursoRepository repository;

    public CursoController(CursoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<Curso> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao);
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String termo) {
        return ResponseEntity.ok(repository.findByNomeContainingIgnoreCase(termo));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Curso> cadastrar(@RequestBody @Valid Curso curso) {
        return ResponseEntity.status(201).body(repository.save(curso));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid Curso atualizado) {
        return repository.findById(id).map(curso -> {
            curso.setNome(atualizado.getNome());
            curso.setCodigo(atualizado.getCodigo());
            curso.setCargaHoraria(atualizado.getCargaHoraria());
            curso.setAtivo(atualizado.getAtivo());
            return ResponseEntity.ok(repository.save(curso));
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