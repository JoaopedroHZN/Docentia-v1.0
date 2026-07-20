package br.com.docentia.agenda.controller;


import br.com.docentia.agenda.model.Agendamento;
import br.com.docentia.agenda.model.Turno;
import br.com.docentia.agenda.repository.AgendamentoRepository;
import br.com.docentia.agenda.service.AgendamentoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final AgendamentoRepository repository;
    private final AgendamentoService service;

    public AgendamentoController(AgendamentoRepository repository, AgendamentoService service) {
        this.repository = repository;
        this.service = service;
    }

    @GetMapping
    public Page<Agendamento> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Agendamento>> buscarPorTurno(@RequestParam Turno turno) {
        List<Agendamento> listaFiltrada = repository.findByTurno(turno);
        return ResponseEntity.ok(listaFiltrada);
    }

    @GetMapping("/buscar-duplo")
    public ResponseEntity<List<Agendamento>> buscarPorSalaETurno(
            @RequestParam String sala,
            @RequestParam Turno turno) {
        List<Agendamento> listaFiltrada = repository.findBySalaAndTurno(sala, turno);
        return ResponseEntity.ok(listaFiltrada);
    }

    @GetMapping("/buscar-data")
    public ResponseEntity<List<Agendamento>> buscarPorData(@RequestParam LocalDate data) {
        List<Agendamento> aulasDoDia = repository.findByData(data);
        return ResponseEntity.ok(aulasDoDia);
    }

    @GetMapping("/buscar-professor")
    public ResponseEntity<List<Agendamento>> buscarPorProfessor(@RequestParam Long id) {
        List<Agendamento> aulasDoProfessor = repository.findByInstrutorId(id);
        return ResponseEntity.ok(aulasDoProfessor);
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Agendamento>> buscarMeusAgendamentos(@RequestParam String email) {
        List<Agendamento> meus = repository.findByInstrutorEmail(email);
        return ResponseEntity.ok(meus);
    }

    @GetMapping("/minhas-aulas")
    public ResponseEntity<?> minhasAulas() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Não autenticado");
        }
        String email = auth.getName();
        List<Agendamento> meus = repository.findByInstrutorEmail(email);
        return ResponseEntity.ok(meus);
    }

    @GetMapping("/buscar-curso")
    public ResponseEntity<List<Agendamento>> buscarPorCurso(@RequestParam String termo) {
        List<Agendamento> resultado = repository.findByCursoContainingIgnoreCase(termo);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Agendamento> cadastrar(@RequestBody @Valid Agendamento agendamento) {
        Agendamento salvo = service.criar(agendamento);
        return ResponseEntity.ok(salvo);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Agendamento> atualizar(@PathVariable Long id,
                                                  @RequestBody @Valid Agendamento agendamentoAtualizado) {
        Agendamento salvo = service.atualizar(id, agendamentoAtualizado);
        return ResponseEntity.ok(salvo);
    }
}