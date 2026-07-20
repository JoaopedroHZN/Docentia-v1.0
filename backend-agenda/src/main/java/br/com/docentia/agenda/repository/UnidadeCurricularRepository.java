package br.com.docentia.agenda.repository;

import br.com.docentia.agenda.model.UnidadeCurricular;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UnidadeCurricularRepository extends JpaRepository<UnidadeCurricular, Long> {
    List<UnidadeCurricular> findByNomeContainingIgnoreCase(String termo);
    List<UnidadeCurricular> findByAtivoTrue();
    List<UnidadeCurricular> findByCurso(String curso);
}