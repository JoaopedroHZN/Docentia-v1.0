package br.com.docentia.agenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "unidades_curriculares")
public class UnidadeCurricular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da UC e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private Integer cargaHoraria = 0;

    @NotBlank(message = "O curso e obrigatorio")
    @Column(nullable = false)
    private String curso;

    @Column(nullable = false)
    private Boolean ativo = true;

    public UnidadeCurricular() {}

    public UnidadeCurricular(String nome, Integer cargaHoraria, String curso, Boolean ativo) {
        this.nome = nome;
        this.cargaHoraria = cargaHoraria;
        this.curso = curso;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getCargaHoraria() { return cargaHoraria; }
    public void setCargaHoraria(Integer cargaHoraria) { this.cargaHoraria = cargaHoraria; }
    public String getCurso() { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}