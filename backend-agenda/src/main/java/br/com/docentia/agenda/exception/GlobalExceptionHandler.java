package br.com.docentia.agenda.exception;


import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErroResposta> tratarErroDeNegocio(BusinessException ex, HttpServletRequest request) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Conflito de Agendamento",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErroResposta> tratarArgumentoInvalido(IllegalArgumentException ex, HttpServletRequest request) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Dados Invalidos",
                ex.getMessage(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> tratarErroDeBanco(DataIntegrityViolationException ex, HttpServletRequest request){
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Erro de Integridade do Banco de Dados",
                "Violação de Restrição no Banco. Verifique os campos obrigatórios",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> tratarErrosDeValidacao(org.springframework.web.bind.MethodArgumentNotValidException ex, HttpServletRequest request){
        //Construtor de texto para juntar todos os erros encontrados
        StringBuilder mensagensDeErro = new StringBuilder();

        //Loop para os campos q falharam na inspecao
        for (org.springframework.validation.FieldError campo : ex.getBindingResult().getFieldErrors()){
            mensagensDeErro.append("[").append(campo.getField()).append(": ").append(campo.getDefaultMessage()).append("] ");
        }
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Dados Invalidos",
                mensagensDeErro.toString(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResposta> tratarErroEnumInvalido(org.springframework.http.converter.HttpMessageNotReadableException ex, HttpServletRequest request) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Campo Inválido ou Mal Formatado",
                "O valor enviado para o perfil está incorreto. Escolha estritamente entre ADMIN ou INSTRUTOR.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }
}
