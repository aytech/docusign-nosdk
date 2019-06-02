package com.docusign.data;

public class SignRequest {
    private String email;
    private String name;
    private String subject;
    private String message;
    private boolean createTemplate;
    private String templateId;
    private String templateName;
    private String userId;
    private int documentCount;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public boolean isCreateTemplate() {
        return createTemplate;
    }

    public void setCreateTemplate(boolean createTemplate) {
        this.createTemplate = createTemplate;
    }

    public String isTemplateId() {
        return templateId;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getDocumentCount() {
        return documentCount;
    }

    public void setDocumentCount(int documentCount) {
        this.documentCount = documentCount;
    }

    @Override
    public String toString() {
        return "SignRequest{" +
                "email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", subject='" + subject + '\'' +
                ", createTemplate='" + createTemplate + '\'' +
                ", message='" + message + '\'' +
                ", documentCount='" + documentCount + '\'' +
                '}';
    }
}
