package com.docusign.data;

import java.util.List;

public class UserResponse {
    private List<User> users;
    private User userInfo;
    private String jwtUrl;
    private String errorMessage;

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    public User getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(User userInfo) {
        this.userInfo = userInfo;
    }

    public String getJwtUrl() {
        return jwtUrl;
    }

    public void setJwtUrl(String jwtUrl) {
        this.jwtUrl = jwtUrl;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
