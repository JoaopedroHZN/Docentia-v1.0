package br.com.docentia.agenda.repository;

import br.com.docentia.agenda.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TurmaRepository extends JpaRepository<Turma, Long> {
    List<Turma> findByCodigoContainingIgnoreCase(String termo);
    List<Turma> findByAtivoTrue();
}