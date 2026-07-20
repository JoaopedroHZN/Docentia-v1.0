package br.com.docentia.agenda.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "salas")
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome da sala e obrigatorio")
    @Column(nullable = false)
    private String nome;

    @NotNull(message = "A capacidade e obrigatoria")
    @Min(value = 1, message = "A capacidade minima e 1")
    @Column(nullable = false)
    private Integer capacidade;

    @NotBlank(message = "O tipo de sala e obrigatorio")
    @Column(nullable = false)
    private String tipo; // Ex: "Sala de Aula", "Laboratorio", "Auditorio"

    @Column(nullable = false)
    private Boolean ativo = true;

    public Sala() {}

    public Sala(String nome, Integer capacidade, String tipo, Boolean ativo) {
        this.nome = nome;
        this.capacidade = capacidade;
        this.tipo = tipo;
        this.ativo = ativo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Integer getCapacidade() { return capacidade; }
    public void setCapacidade(Integer capacidade) { this.capacidade = capacidade; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}