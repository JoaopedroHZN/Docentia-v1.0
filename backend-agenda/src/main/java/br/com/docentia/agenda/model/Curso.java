package br.com.docentia.agenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome do curso e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "O codigo do curso e obrigatorio")
    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private Integer cargaHoraria = 0;

    @Column(nullable = false)
    private Boolean ativo = true;

    public Curso() {}

    public Curso(String nome, String codigo, Integer cargaHoraria, Boolean ativo) {
        this.nome = nome;
        this.codigo = codigo;
        this.cargaHoraria = cargaHoraria;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public Integer getCargaHoraria() { return cargaHoraria; }
    public void setCargaHoraria(Integer cargaHoraria) { this.cargaHoraria = cargaHoraria; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}