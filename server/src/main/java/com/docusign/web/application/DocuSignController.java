package com.docusign.web.application;

import com.docusign.data.SignRequest;
import com.docusign.data.User;
import com.docusign.data.UserResponse;
import com.docusign.esign.api.EnvelopesApi;
import com.docusign.esign.api.TemplatesApi;
import com.docusign.esign.api.UsersApi;
import com.docusign.esign.client.ApiClient;
import com.docusign.esign.client.ApiException;
import com.docusign.esign.client.Configuration;
import com.docusign.esign.client.auth.OAuth;
import com.docusign.esign.model.*;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.List;

@RestController
@RequestMapping(value = "/api")
public class DocuSignController {

    private ApiClient apiClient;
    private String BaseUrl = "https://demo.docusign.net";
    private String accountID;

    @Autowired
    public DocuSignController() {
        apiClient = new ApiClient(BaseUrl + "/restapi");
        Configuration.setDefaultApiClient(apiClient);
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/jwt/{userId}")
    public HttpEntity<UserResponse> authenticateJWT(@PathVariable("userId") String userId) throws IOException {

        UserResponse response = new UserResponse();
        String integratorKey = "e1127ed3-f1b5-40e4-b431-06c19f3983bd";

        /////////////////////////////////////////////////////////////////////////////
        // STEP 1: AUTHENTICATE TO RETRIEVE ACCOUNTID & BASEURL
        /////////////////////////////////////////////////////////////////////////////
        // IMPORTANT NOTE:
        // the first time you ask for a JWT access token, you should grant access
        // by making the following call get DocuSign OAuth authorization url:
        // String oauthLoginUrl = apiClient.getJWTUri(IntegratorKey, RedirectURI, AuthServerUrl);
        // open DocuSign OAuth authorization url in the browser, login and grant access
        // Desktop.getDesktop().browse(URI.create(oauthLoginUrl));
        List<String> scopes = new ArrayList<>();
        scopes.add(OAuth.Scope_SIGNATURE);
        scopes.add(OAuth.Scope_IMPERSONATION);
        InputStream keyStream = new ClassPathResource("jwt/id_rsa_docusign_user_ddabf716.pem").getInputStream();
        byte[] privateKeyFile = IOUtils.toByteArray(keyStream);

        try {
            OAuth.OAuthToken token = apiClient.requestJWTUserToken(
                    integratorKey, userId, scopes, privateKeyFile, 3600); // request for a fresh JWT token valid for 1 hour
            apiClient.setAccessToken(token.getAccessToken(), token.getExpiresIn());
            OAuth.UserInfo userInfo = apiClient.getUserInfo(apiClient.getAccessToken());
            BaseUrl = userInfo.getAccounts().get(0).getBaseUri();
            apiClient.setBasePath(BaseUrl + "/restapi");
            accountID = userInfo.getAccounts().get(0).getAccountId();

            response.setUserInfo(getUserFromUserInfo(userInfo));
            response.setUsers(retrieveSystemUsers(userId));
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ApiException e) {
            System.out.println("Error authenticating JWT: " + e.getMessage());
            e.printStackTrace();
            // configure the authorization flow on the api client
            // must match a redirect URI (case-sensitive) you configured on the key
            String redirectUri = "http://localhost:3000";
            // point to the demo (sandbox) environment. For production requests your account sub-domain
            // will vary, you should always use the base URI that is returned from authentication to
            // ensure your integration points to the correct endpoints (in both environments)
            // use demo authentication server (remove -d for production)
            String authServerUrl = "https://account-d.docusign.com";
            response.setJwtUrl(apiClient.getJWTUri(integratorKey, redirectUri, authServerUrl));
            response.setErrorMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/authenticated")
    public HttpEntity<UserResponse> isAuthenticated() {
        try {
            OAuth.UserInfo userInfo = apiClient.getUserInfo(apiClient.getAccessToken());
            User user = getUserFromUserInfo(userInfo);
            UserResponse response = new UserResponse();
            response.setUserInfo(user);
            response.setUsers(retrieveSystemUsers(user.getId()));
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ApiException e) {
            System.out.println("User not authenticated: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "sign")
    public HttpEntity<EnvelopeSummary> signDocument(@RequestBody SignRequest request) throws IOException, ApiException {

        EnvelopeTemplate envelopeTemplate = new EnvelopeTemplate();
        String brandId = "4c7bbcc1-65ad-4326-bf51-34595a55f7fa";

        Document document = new Document();
        InputStream documentFile = new ClassPathResource("static/demo_document.pdf").getInputStream();
        String base64Doc = Base64.getEncoder().encodeToString(IOUtils.toByteArray(documentFile));
        document.setDocumentBase64(base64Doc);
        document.setDocumentId("1");
        document.setName("Test document");

        List<Document> documents = new ArrayList<>();
        documents.add(document);

        envelopeTemplate.setDocuments(documents);
        envelopeTemplate.setBrandId(brandId);
        envelopeTemplate.setEmailSubject(request.getSubject());

        EnvelopeTemplateDefinition envelopeTemplateDefinition = new EnvelopeTemplateDefinition();
        envelopeTemplate.setEnvelopeTemplateDefinition(envelopeTemplateDefinition);

        TemplatesApi templatesApi = new TemplatesApi();
        TemplateSummary templateSummary = templatesApi.createTemplate(accountID, envelopeTemplate);

        // create a new envelope to manage the signature request
        EnvelopeDefinition envelopeDefinition = new EnvelopeDefinition();
        envelopeDefinition.setEmailSubject(request.getSubject());
        envelopeDefinition.setTemplateId(templateSummary.getTemplateId());

        TemplateRole templateRole = new TemplateRole();
        templateRole.setRoleName(request.getName());
        templateRole.setName(request.getName());
        templateRole.setEmail(request.getEmail());

        List<TemplateRole> templateRoles = new ArrayList<>();
        templateRoles.add(templateRole);

        envelopeDefinition.setTemplateRoles(templateRoles);

        // send the envelope by setting |status| to "sent". To save as a draft set to "created"
        envelopeDefinition.setStatus("sent");

        try {
            EnvelopesApi envelopesApi = new EnvelopesApi();
            EnvelopeSummary envelopeSummary = envelopesApi.createEnvelope(accountID, envelopeDefinition);
            return new ResponseEntity<>(envelopeSummary, HttpStatus.OK);
        } catch (ApiException ex) {
            ex.printStackTrace();
            System.out.println("Error creating envelope: " + ex.getMessage());
            return new ResponseEntity<>(null, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private User getUserFromUserInfo(OAuth.UserInfo userInfo) {
        User user = new User();
        user.setId(userInfo.getSub());
        user.setFirstName(userInfo.getGivenName());
        user.setLastName(userInfo.getFamilyName());
        user.setEmail(userInfo.getEmail());
        return user;
    }

    private List<User> retrieveSystemUsers(String currentUserId) throws ApiException {
        UsersApi usersApi = new UsersApi();
        usersApi.setApiClient(apiClient);
        List<User> users = new ArrayList<>();
        for (UserInformation userInformation : usersApi.list(accountID).getUsers()) {
            if (!userInformation.getUserId().equals(currentUserId)) {
                User user = new User();
                user.setId(userInformation.getUserId());
                user.setFirstName(userInformation.getFirstName());
                user.setLastName(userInformation.getLastName());
                user.setEmail(userInformation.getEmail());
                users.add(user);
            }
        }
        return users;
    }
}
