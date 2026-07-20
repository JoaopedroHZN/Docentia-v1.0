package br.com.docentia.agenda.exception;

import java.time.LocalDateTime;

public class ErroResposta {

    private LocalDateTime timeStamp;
    private Integer status;
    private String erro;
    private String mensagem;
    private String caminho;

    public ErroResposta() {
    }

    public ErroResposta(LocalDateTime timeStamp, Integer status, String erro, String mensagem, String caminho) {
        this.timeStamp = timeStamp;
        this.status = status;
        this.erro = erro;
        this.mensagem = mensagem;
        this.caminho = caminho;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getErro() {
        return erro;
    }

    public void setErro(String erro) {
        this.erro = erro;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getCaminho() {
        return caminho;
    }

    public void setCaminho(String caminho) {
        this.caminho = caminho;
    }
}
