package br.com.docentia.agenda.service;

import br.com.docentia.agenda.exception.BusinessException;
import br.com.docentia.agenda.model.Agendamento;
import br.com.docentia.agenda.model.Instrutor;
import br.com.docentia.agenda.repository.AgendamentoRepository;
import br.com.docentia.agenda.repository.InstrutorRepository;
import org.springframework.stereotype.Service;

/**
 * Service responsável pela regra de negócio de Agendamentos,
 * incluindo validações de conflito de Turma, Instrutor e Sala.
 */
@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final InstrutorRepository instrutorRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository,
                              InstrutorRepository instrutorRepository) {
        this.agendamentoRepository = agendamentoRepository;
        this.instrutorRepository = instrutorRepository;
    }

    /**
     * Cria um novo agendamento após validar todas as regras de conflito.
     */
    public Agendamento criar(Agendamento agendamento) {
        validarDatas(agendamento);
        validarInstrutorNaoAdmin(agendamento);
        validarConflitosParaCriacao(agendamento);

        // Garante que o instrutor seja o gerenciado pelo JPA
        Instrutor instrutorGerenciado = instrutorRepository.findById(agendamento.getInstrutor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Instrutor nao encontrado."));
        agendamento.setInstrutor(instrutorGerenciado);

        return agendamentoRepository.save(agendamento);
    }

    /**
     * Atualiza um agendamento existente após validar todas as regras de conflito.
     */
    public Agendamento atualizar(Long id, Agendamento atualizado) {
        Agendamento existente = agendamentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agendamento nao encontrado."));

        validarDatas(atualizado);
        validarInstrutorNaoAdmin(atualizado);
        validarConflitosParaEdicao(id, atualizado);

        // Atualiza os campos
        existente.setDataInicio(atualizado.getDataInicio());
        existente.setDataFim(atualizado.getDataFim());
        existente.setTurno(atualizado.getTurno());
        existente.setCurso(atualizado.getCurso());
        existente.setTurma(atualizado.getTurma());
        existente.setUnidadeCurricular(atualizado.getUnidadeCurricular());
        existente.setObservacoes(atualizado.getObservacoes());
        existente.setSala(atualizado.getSala());
        existente.setHorario(atualizado.getHorario());

        Instrutor instrutorGerenciado = instrutorRepository.findById(atualizado.getInstrutor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Instrutor nao encontrado."));
        existente.setInstrutor(instrutorGerenciado);

        return agendamentoRepository.save(existente);
    }

    // -------------------------------------------------------
    // VALIDAÇÕES PRIVADAS
    // -------------------------------------------------------

    private void validarDatas(Agendamento agendamento) {
        if (agendamento.getDataInicio() == null || agendamento.getDataFim() == null) {
            throw new IllegalArgumentException("As datas de inicio e fim sao obrigatorias.");
        }
        if (agendamento.getDataFim().isBefore(agendamento.getDataInicio())) {
            throw new IllegalArgumentException("A data de fim nao pode ser anterior a data de inicio.");
        }
    }

    private void validarInstrutorNaoAdmin(Agendamento agendamento) {
        Instrutor instrutor = instrutorRepository.findById(agendamento.getInstrutor().getId())
                .orElseThrow(() -> new IllegalArgumentException("Instrutor nao encontrado."));

        if ("ADMIN".equals(instrutor.getPerfil().toString())) {
            throw new BusinessException("Erro: Usuarios com perfil ADMIN nao podem ministrar aulas!");
        }
    }

    private void validarConflitosParaCriacao(Agendamento agendamento) {
        // 1. Conflito: mesma Turma (código) + mesmo Turno + sobreposicao de datas
        if (agendamentoRepository.existeConflitoTurmaTurnoPeriodo(
                agendamento.getTurma(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim())) {
            throw new BusinessException(
                    "Conflito de agendamento: A turma " + agendamento.getTurma()
                            + " ja possui aula no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }

        // 2. Conflito: mesmo Instrutor + mesmo Turno + sobreposicao de datas (em qualquer turma)
        if (agendamentoRepository.existeConflitoInstrutorTurnoPeriodo(
                agendamento.getInstrutor().getId(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim())) {
            throw new BusinessException(
                    "Conflito de agendamento: O professor ja esta alocado em outra turma "
                            + "no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }

        // 3. Conflito: mesma Sala + mesmo Turno + sobreposicao de datas
        if (agendamentoRepository.existeConflitoSalaTurnoPeriodo(
                agendamento.getSala(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim())) {
            throw new BusinessException(
                    "Conflito de agendamento: A sala " + agendamento.getSala()
                            + " ja esta ocupada no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }
    }

    private void validarConflitosParaEdicao(Long id, Agendamento agendamento) {
        // 1. Conflito: mesma Turma (código) + mesmo Turno + sobreposicao de datas (ignorando o proprio ID)
        if (agendamentoRepository.existeConflitoTurmaTurnoPeriodoExcetoId(
                agendamento.getTurma(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim(),
                id)) {
            throw new BusinessException(
                    "Conflito de agendamento: A turma " + agendamento.getTurma()
                            + " ja possui aula no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }

        // 2. Conflito: mesmo Instrutor + mesmo Turno + sobreposicao de datas (ignorando o proprio ID)
        if (agendamentoRepository.existeConflitoInstrutorTurnoPeriodoExcetoId(
                agendamento.getInstrutor().getId(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim(),
                id)) {
            throw new BusinessException(
                    "Conflito de agendamento: O professor ja esta alocado em outra turma "
                            + "no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }

        // 3. Conflito: mesma Sala + mesmo Turno + sobreposicao de datas (ignorando o proprio ID)
        if (agendamentoRepository.existeConflitoSalaTurnoPeriodoExcetoId(
                agendamento.getSala(),
                agendamento.getTurno(),
                agendamento.getDataInicio(),
                agendamento.getDataFim(),
                id)) {
            throw new BusinessException(
                    "Conflito de agendamento: A sala " + agendamento.getSala()
                            + " ja esta ocupada no turno " + agendamento.getTurno()
                            + " para este periodo.");
        }
    }
}