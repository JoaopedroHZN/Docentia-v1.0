package br.com.docentia.agenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "turmas")
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O codigo da turma e obrigatorio")
    @Column(nullable = false, unique = true)
    private String codigo;

    @NotBlank(message = "O curso vinculado e obrigatorio")
    @Column(nullable = false)
    private String curso;

    @Column(nullable = false)
    private String turnoPadrao = "MATUTINO";

    @NotBlank(message = "O periodo letivo e obrigatorio")
    @Column(nullable = false)
    private String periodoLetivo;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Turma() {}

    public Turma(String codigo, String curso, String turnoPadrao, String periodoLetivo, Boolean ativo) {
        this.codigo = codigo;
        this.curso = curso;
        this.turnoPadrao = turnoPadrao;
        this.periodoLetivo = periodoLetivo;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public String getTurnoPadrao() { return turnoPadrao; }
    public void setTurnoPadrao(String turnoPadrao) { this.turnoPadrao = turnoPadrao; }
    public String getPeriodoLetivo() { return periodoLetivo; }
    public void setPeriodoLetivo(String periodoLetivo) { this.periodoLetivo = periodoLetivo; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}