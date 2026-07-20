package br.com.docentia.agenda.repository;

import br.com.docentia.agenda.model.Agendamento;
import br.com.docentia.agenda.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    // --- QUERIES DE CONFLITO COM SOBREPOSICAO DE INTERVALO ---

    // Conflito: mesma Turma + mesmo Turno + sobreposicao de datas (para criacao)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.turma = :turma " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio")
    boolean existeConflitoTurmaTurnoPeriodo(@Param("turma") String turma,
                                            @Param("turno") Turno turno,
                                            @Param("dataInicio") LocalDate dataInicio,
                                            @Param("dataFim") LocalDate dataFim);

    // Conflito: mesma Turma + mesmo Turno + sobreposicao de datas (para edicao, ignorando o proprio ID)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.turma = :turma " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio " +
           "AND a.id <> :id")
    boolean existeConflitoTurmaTurnoPeriodoExcetoId(@Param("turma") String turma,
                                                     @Param("turno") Turno turno,
                                                     @Param("dataInicio") LocalDate dataInicio,
                                                     @Param("dataFim") LocalDate dataFim,
                                                     @Param("id") Long id);

    // Conflito: mesmo Instrutor + mesmo Turno + sobreposicao de datas (para criacao)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.instrutor.id = :instrutorId " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio")
    boolean existeConflitoInstrutorTurnoPeriodo(@Param("instrutorId") Long instrutorId,
                                                 @Param("turno") Turno turno,
                                                 @Param("dataInicio") LocalDate dataInicio,
                                                 @Param("dataFim") LocalDate dataFim);

    // Conflito: mesmo Instrutor + mesmo Turno + sobreposicao de datas (para edicao, ignorando o proprio ID)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.instrutor.id = :instrutorId " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio " +
           "AND a.id <> :id")
    boolean existeConflitoInstrutorTurnoPeriodoExcetoId(@Param("instrutorId") Long instrutorId,
                                                          @Param("turno") Turno turno,
                                                          @Param("dataInicio") LocalDate dataInicio,
                                                          @Param("dataFim") LocalDate dataFim,
                                                          @Param("id") Long id);

    // Conflito: mesma Sala + mesmo Turno + sobreposicao de datas (para criacao)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.sala = :sala " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio")
    boolean existeConflitoSalaTurnoPeriodo(@Param("sala") String sala,
                                           @Param("turno") Turno turno,
                                           @Param("dataInicio") LocalDate dataInicio,
                                           @Param("dataFim") LocalDate dataFim);

    // Conflito: mesma Sala + mesmo Turno + sobreposicao de datas (para edicao, ignorando o proprio ID)
    @Query("SELECT COUNT(a) > 0 FROM Agendamento a " +
           "WHERE a.sala = :sala " +
           "AND a.turno = :turno " +
           "AND a.dataInicio <= :dataFim " +
           "AND a.dataFim >= :dataInicio " +
           "AND a.id <> :id")
    boolean existeConflitoSalaTurnoPeriodoExcetoId(@Param("sala") String sala,
                                                     @Param("turno") Turno turno,
                                                     @Param("dataInicio") LocalDate dataInicio,
                                                     @Param("dataFim") LocalDate dataFim,
                                                     @Param("id") Long id);

    // --- QUERIES DE BUSCA (atualizadas para os novos campos) ---

    // Filtra o turno especifico
    List<Agendamento> findByTurno(Turno turno);

    // Filtra salas e turnos iguais
    List<Agendamento> findBySalaAndTurno(String sala, Turno turno);

    // Filtra todas as aulas de um dia especifico (verifica se o dia esta dentro do intervalo)
    @Query("SELECT a FROM Agendamento a WHERE a.dataInicio <= :data AND a.dataFim >= :data")
    List<Agendamento> findByData(@Param("data") LocalDate data);

    // Filtro de todas as aulas de um instrutor especifico
    List<Agendamento> findByInstrutorId(Long instrutorId);

    // Busca por curso (turma) com termo parcial
    List<Agendamento> findByCursoContainingIgnoreCase(String termo);

    // Busca agendamentos que ocupam salas no período/turno (para verificar disponibilidade)
    @Query("SELECT a FROM Agendamento a WHERE a.turno = :turno AND a.dataInicio <= :dataFim AND a.dataFim >= :dataInicio")
    List<Agendamento> findOcupadosNoPeriodoTurno(@Param("turno") Turno turno,
                                                   @Param("dataInicio") LocalDate dataInicio,
                                                   @Param("dataFim") LocalDate dataFim);

    // Busca agendamentos pelo email do instrutor
    List<Agendamento> findByInstrutorEmail(String email);
}
