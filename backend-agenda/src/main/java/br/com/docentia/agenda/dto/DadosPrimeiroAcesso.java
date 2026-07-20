package br.com.docentia.agenda.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DadosPrimeiroAcesso(
        @NotBlank(message = "O e-mail é obrigatório!")
        @Email(message = "Formato de e-mail inválido!")
        String email,

        @NotBlank(message = "A senha não pode ser vazia!")
        String novaSenha
) {}