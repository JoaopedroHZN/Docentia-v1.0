package br.com.docentia.agenda.repository;
import br.com.docentia.agenda.model.Instrutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstrutorRepository extends JpaRepository<Instrutor, Long> {


    org.springframework.security.core.userdetails.UserDetails findByEmail(String email);
    List<Instrutor> findByCurso(String curso);
    List<Instrutor> findByPerfil(Enum<?> perfil);
    List<Instrutor> findByPerfilAndCurso(Enum<?> perfil, String curso);
}