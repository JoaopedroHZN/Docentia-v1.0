package br.com.docentia.agenda.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "agendamentos")
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "A data de inicio da aula e obrigatoria!")
    @Column(nullable = false)
    private LocalDate dataInicio;

    @NotNull(message = "A data de fim da aula e obrigatoria!")
    @Column(nullable = false)
    private LocalDate dataFim;

    @NotNull(message = "O turno e obrigatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Turno turno;

    @NotBlank(message = "O nome da turma nao pode ficar em branco")
    @Column(nullable = false)
    private String curso;

    @NotBlank(message = "O codigo da turma e obrigatorio")
    @Column(nullable = false)
    private String turma;

    @NotBlank(message = "A unidade curricular e obrigatoria!")
    @Column(nullable = false)
    private String unidadeCurricular;

    @Column(length = 500)
    private String observacoes;

    @NotBlank(message = "A sala/laboratorio e obrigatoria!")
    @Column(nullable = false)
    private String sala;

    @NotBlank(message = "O horario da aula e obrigatorio!")
    @Column(nullable = false)
    private String horario;

    @NotNull(message = "O instrutor responsavel e obrigatorio")
    @ManyToOne
    @JoinColumn(name = "instrutor_id", nullable = false)
    private Instrutor instrutor;

    public Agendamento() {
    }

    public Agendamento(LocalDate dataInicio, LocalDate dataFim, Turno turno, String curso, String turma,
                        String unidadeCurricular, String observacoes, String sala, String horario, Instrutor instrutor) {
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.turno = turno;
        this.curso = curso;
        this.turma = turma;
        this.unidadeCurricular = unidadeCurricular;
        this.observacoes = observacoes;
        this.sala = sala;
        this.horario = horario;
        this.instrutor = instrutor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Turno getTurno() {
        return turno;
    }

    public void setTurno(Turno turno) {
        this.turno = turno;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    public String getTurma() {
        return turma;
    }

    public void setTurma(String turma) {
        this.turma = turma;
    }

    public String getUnidadeCurricular() {
        return unidadeCurricular;
    }

    public void setUnidadeCurricular(String unidadeCurricular) {
        this.unidadeCurricular = unidadeCurricular;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public String getSala() {
        return sala;
    }

    public void setSala(String sala) {
        this.sala = sala;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public Instrutor getInstrutor() {
        return instrutor;
    }

    public void setInstrutor(Instrutor instrutor) {
        this.instrutor = instrutor;
    }
}