package br.com.docentia.agenda.model;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "instrutores")
public class Instrutor implements org.springframework.security.core.userdetails.UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório e não pode estar em branco!")
    @Column(nullable = false) //nullable proibido existir instrutor sem nome no banco
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    @Column(nullable = false, unique = true)//unique = true nao pode ter usuario com email duplicado
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // Apenas escrita, para leitura esconde
    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Perfil perfil;

    @Column
    private String curso;

    public Instrutor() {
    }

    public Instrutor(String nome, String email, String senha, Perfil perfil, String curso) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.curso = curso;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public void setPerfil(Perfil perfil) {
        this.perfil = perfil;
    }

    public String getCurso() {
        return curso;
    }

    public void setCurso(String curso) {
        this.curso = curso;
    }

    @Override
    @com.fasterxml.jackson.annotation.JsonIgnore
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities(){
        //Se for admin tem o poder de admin e de instrutor normal
        if (this.perfil.toString().equals("ADMIN")){
            return java.util.List.of(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"),
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_INSTRUTOR")
            );
        }else{
            //se for instrutor tem so o poder base
            return java.util.List.of(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_INSTRUTOR")
            );
        }
    }

    @Override
    public String getPassword(){
        return this.senha;
    }

    @Override
    public String getUsername(){
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}
