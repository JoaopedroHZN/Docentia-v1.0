package br.com.docentia.agenda.controller;

import br.com.docentia.agenda.model.Turma;
import br.com.docentia.agenda.repository.TurmaRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/turmas")
public class TurmaController {

    private final TurmaRepository repository;

    public TurmaController(TurmaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<Turma> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao);
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String termo) {
        return ResponseEntity.ok(repository.findByCodigoContainingIgnoreCase(termo));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Turma> cadastrar(@RequestBody @Valid Turma turma) {
        return ResponseEntity.status(201).body(repository.save(turma));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid Turma atualizada) {
        return repository.findById(id).map(turma -> {
            turma.setCodigo(atualizada.getCodigo());
            turma.setCurso(atualizada.getCurso());
            turma.setTurnoPadrao(atualizada.getTurnoPadrao());
            turma.setPeriodoLetivo(atualizada.getPeriodoLetivo());
            turma.setAtivo(atualizada.getAtivo());
            return ResponseEntity.ok(repository.save(turma));
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