package com.docusign.data;

import com.docusign.esign.client.auth.OAuth;
import com.docusign.esign.model.EnvelopeTemplateResults;

import java.util.List;

public class UserResponse {
//    private List<User> users;
//    private List<Template> templates;

//    public List<Template> getTemplates() {
//        return templates;
//    }

//    public void setTemplates(List<Template> templates) {
//        this.templates = templates;
//    }

    private OAuth.UserInfo userInfo;
    private String consentUrl;
    private String errorMessage;

//    public List<User> getUsers() {
//        return users;
//    }

//    public void setUsers(List<User> users) {
//        this.users = users;
//    }


    public OAuth.UserInfo getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(OAuth.UserInfo userInfo) {
        this.userInfo = userInfo;
    }

    public String getConsentUrl() {
        return consentUrl;
    }

    public void setConsentUrl(String consentUrl) {
        this.consentUrl = consentUrl;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
