package com.docusign.web.application;

import com.docusign.data.*;
import com.docusign.data.User;
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
import java.net.URI;
import java.util.*;
import java.util.List;

import static com.docusign.configuration.Configuration.DRILLBACK;
import static com.docusign.configuration.Configuration.TENANT_ID;

@RestController
@RequestMapping(value = "/api")
public class DocuSignApiController {

    private com.docusign.configuration.Configuration configuration;
    private ApiClient apiClient;
    private String BaseUrl = "https://demo.docusign.net";
    private String integratorKey = "e1127ed3-f1b5-40e4-b431-06c19f3983bd";
    private String accountID;
    private String envelopeID;

    @Autowired
    public DocuSignApiController() {
        configuration = new com.docusign.configuration.Configuration();
        apiClient = new ApiClient(BaseUrl + "/restapi");
        Configuration.setDefaultApiClient(apiClient);
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/code")
    public HttpEntity<URI> getCodeGrantAuthURL() {
        String randomState = String.format("{%s}.{%s}", TENANT_ID, DRILLBACK);
        List<String> scopes = new ArrayList<>();
        scopes.add(OAuth.Scope_SIGNATURE);
        URI oauthLoginUrl = apiClient.getAuthorizationUri(
                integratorKey, scopes, configuration.getRedirectUri(), OAuth.CODE, randomState);

        return new ResponseEntity<>(oauthLoginUrl, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/grant/{code}")
    public HttpEntity<OAuth.OAuthToken> authenticateWithCodeGrant(@PathVariable("code") String code) {
        String clientSecret = "c2c4519e-161f-45ea-b1ae-20f947125e82";
        try {
            OAuth.OAuthToken oAuthToken = apiClient.generateAccessToken(integratorKey, clientSecret, code);
            System.out.println("Oauth Token: " + oAuthToken);
            apiClient.setAccessToken(oAuthToken.getAccessToken(), oAuthToken.getExpiresIn());
            apiClient.addDefaultHeader("Authorization", "Bearer " + oAuthToken.getAccessToken());
            return new ResponseEntity<>(oAuthToken, HttpStatus.OK);
        } catch (ApiException | IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/jwt/{userId}")
    public HttpEntity<UserResponse> authenticateJWT(@PathVariable("userId") String userId) throws IOException {

        UserResponse response = new UserResponse();

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
            response.setJwtUrl(apiClient.getJWTUri(integratorKey, configuration.getRedirectUri(), configuration.getAuthServerURI()));
            response.setErrorMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(method = RequestMethod.GET, value = "auth/authenticated")
    public HttpEntity<UserResponse> isAuthenticated() {
        try {
            OAuth.UserInfo userInfo = apiClient.getUserInfo(apiClient.getAccessToken());
            accountID = userInfo.getAccounts().get(0).getAccountId();

            User user = getUserFromUserInfo(userInfo);
            UserResponse response = new UserResponse();

            response.setUserInfo(user);
            response.setUsers(retrieveSystemUsers(user.getId()));

            response.setTemplates(retrieveUserTemplates());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (ApiException e) {
            System.out.println("User not authenticated: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "sign")
    public HttpEntity<EnvelopeResponse> signDocument(@RequestBody SignRequest request) throws IOException, ApiException {

        EnvelopeDefinition envelopeDefinition = new EnvelopeDefinition();
        envelopeDefinition.setEmailSubject(request.getSubject());

        // Set tenant name
        CustomFields customFields = new CustomFields();
        List<TextCustomField> fields = new ArrayList<>();
        TextCustomField textCustomField = new TextCustomField();
        textCustomField.setName("tenant");
        textCustomField.setValue("infor");
        fields.add(textCustomField);
        customFields.setTextCustomFields(fields);
        envelopeDefinition.setCustomFields(customFields);

        // Add document to the envelope
        List<Document> documents = new ArrayList<>();
        Document document = new Document();
        InputStream documentFile = new ClassPathResource("static/demo_document.pdf").getInputStream();
        String base64Doc = Base64.getEncoder().encodeToString(IOUtils.toByteArray(documentFile));
        document.setDocumentBase64(base64Doc);
        document.setFileExtension("pdf");
        document.setDocumentId("1"); // @todo: try to generate a UUID
        document.setName("Test document");
        documents.add(document);
        envelopeDefinition.setDocuments(documents);

        // Add recipients to the envelope
        Recipients recipients = new Recipients();
        Signer signer = new Signer();
        signer.setName(request.getName());
        signer.setEmail(request.getEmail());
        signer.setRecipientId(request.getUserId());
        signer.setRoutingOrder("1");
        recipients.setSigners(Collections.singletonList(signer));
        envelopeDefinition.setRecipients(recipients);

        if (request.isCreateTemplate()) {
            TemplateSummary templateSummary = createTemplate(documents, request);
            request.setTemplateId(templateSummary.getTemplateId());
            System.out.println("Summary: " + templateSummary);
        }

        envelopeDefinition.setTemplateId(request.getTemplateId());

        // send the envelope by setting |status| to "sent". To save as a draft set to "created"
        envelopeDefinition.setStatus("sent");

        try {
            EnvelopeResponse envelopeResponse = new EnvelopeResponse();
            EnvelopesApi envelopesApi = new EnvelopesApi();

            EnvelopeSummary envelopeSummary = envelopesApi.createEnvelope(accountID, envelopeDefinition);
            envelopeID = envelopeSummary.getEnvelopeId();

            ConsoleViewRequest viewRequest = makeConsoleViewRequest();
            ViewUrl senderView = envelopesApi.createConsoleView(accountID, viewRequest);

            envelopeResponse.setEnvelopeSummary(envelopeSummary);
            envelopeResponse.setSenderViewUrl(senderView.getUrl());

            return new ResponseEntity<>(envelopeResponse, HttpStatus.OK);
        } catch (ApiException ex) {
            ex.printStackTrace();
            System.out.println("Error creating envelope: " + ex.getMessage());
            return new ResponseEntity<>(null, HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    private ConsoleViewRequest makeConsoleViewRequest() {
        ConsoleViewRequest viewRequest = new ConsoleViewRequest();
        viewRequest.setReturnUrl(configuration.getRedirectUri());
        viewRequest.setEnvelopeId(envelopeID);
        return viewRequest;
    }

    @RequestMapping(method = RequestMethod.GET, value = "document/status")
    public HttpEntity<InforEnvelope> getDocumentStatus() {
        EnvelopesApi envelopesApi = new EnvelopesApi();
        try {
            Envelope envelope = envelopesApi.getEnvelope(accountID, envelopeID);
            CustomFieldsEnvelope customFieldsEnvelope = envelopesApi.listCustomFields(accountID, envelopeID);
            InforEnvelope inforEnvelope = new InforEnvelope(envelope, customFieldsEnvelope);
            return new ResponseEntity<>(inforEnvelope, HttpStatus.OK);
        } catch (ApiException e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
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

    private List<Template> retrieveUserTemplates() throws ApiException {

        TemplatesApi templatesApi = new TemplatesApi();
        EnvelopeTemplateResults templateResults = templatesApi.listTemplates(accountID);
        List<Template> templates = new ArrayList<>();

        for (EnvelopeTemplateResult templateResult : templateResults.getEnvelopeTemplates()) {
            System.out.println("Result: " + templateResult);
            Template template = new Template();
            template.setId(templateResult.getTemplateId());
            template.setName(templateResult.getName());
            templates.add(template);
        }

        return templates;
    }

    private TemplateSummary createTemplate(List<Document> documents, SignRequest request) throws ApiException {
        EnvelopeTemplate envelopeTemplate = new EnvelopeTemplate();

        envelopeTemplate.setDocuments(documents);
        envelopeTemplate.setBrandId(configuration.getInforBrandID());
        envelopeTemplate.setEmailSubject(request.getSubject());

        // Set template signer
        Recipients recipients = new Recipients();
        Signer signer = new Signer();
        signer.setEmail(request.getEmail());
        signer.setName(request.getName());
        signer.setRecipientId(request.getUserId());
        signer.setRoutingOrder("1");
        recipients.setSigners(Collections.singletonList(signer));
        envelopeTemplate.setRecipients(recipients);

        EnvelopeTemplateDefinition envelopeTemplateDefinition = new EnvelopeTemplateDefinition();
        envelopeTemplateDefinition.setName(request.getTemplateName());
        envelopeTemplate.setEnvelopeTemplateDefinition(envelopeTemplateDefinition);

        TemplatesApi templatesApi = new TemplatesApi();
        return templatesApi.createTemplate(accountID, envelopeTemplate);
    }
}
