package br.com.docentia.agenda.controller;

import br.com.docentia.agenda.model.Sala;
import br.com.docentia.agenda.model.Turno;
import br.com.docentia.agenda.repository.AgendamentoRepository;
import br.com.docentia.agenda.repository.SalaRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/salas")
public class SalaController {

    private final SalaRepository repository;
    private final AgendamentoRepository agendamentoRepository;

    public SalaController(SalaRepository repository, AgendamentoRepository agendamentoRepository) {
        this.repository = repository;
        this.agendamentoRepository = agendamentoRepository;
    }

    @GetMapping
    public Page<Sala> listarTodos(Pageable paginacao) {
        return repository.findAll(paginacao);
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String termo) {
        return ResponseEntity.ok(repository.findByNomeContainingIgnoreCase(termo));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Sala> cadastrar(@RequestBody @Valid Sala sala) {
        return ResponseEntity.status(201).body(repository.save(sala));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid Sala atualizada) {
        return repository.findById(id).map(sala -> {
            sala.setNome(atualizada.getNome());
            sala.setCapacidade(atualizada.getCapacidade());
            sala.setTipo(atualizada.getTipo());
            sala.setAtivo(atualizada.getAtivo());
            return ResponseEntity.ok(repository.save(sala));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<?> listarDisponiveis(@RequestParam String turno,
                                               @RequestParam String dataInicio,
                                               @RequestParam String dataFim) {
        Turno t = Turno.valueOf(turno.toUpperCase());
        LocalDate inicio = LocalDate.parse(dataInicio);
        LocalDate fim = LocalDate.parse(dataFim);

        // Salas ocupadas no período/turno
        Set<String> salasOcupadas = agendamentoRepository.findOcupadosNoPeriodoTurno(t, inicio, fim)
                .stream()
                .map(a -> a.getSala())
                .collect(Collectors.toSet());

        // Retorna apenas salas ativas que NÃO estão ocupadas
        var disponiveis = repository.findByAtivoTrue().stream()
                .filter(s -> !salasOcupadas.contains(s.getNome()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(disponiveis);
    }
}
