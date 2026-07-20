package br.com.docentia.agenda.repository;

import br.com.docentia.agenda.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    List<Sala> findByNomeContainingIgnoreCase(String termo);
    List<Sala> findByAtivoTrue();
}