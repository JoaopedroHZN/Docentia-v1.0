package br.com.docentia.agenda.repository;

import br.com.docentia.agenda.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByNomeContainingIgnoreCase(String termo);
    boolean existsByCodigo(String codigo);
    List<Curso> findByAtivoTrue();
}