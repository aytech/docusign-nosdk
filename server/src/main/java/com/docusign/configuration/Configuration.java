package com.docusign.configuration;

public class Configuration {
    // point to the demo (sandbox) environment. For production requests your account sub-domain
    // will vary, you should always use the base URI that is returned from authentication to
    // ensure your integration points to the correct endpoints (in both environments)
    // use demo authentication server (remove -d for production)
    public final static String AUTH_SERVER_URI = "https://account-d.docusign.com";

    // configure the authorization flow on the api client,
    // this must match a redirect URI (case-sensitive) configured on the key
    public final static String REDIRECT_URI = "http://localhost:8080/ds-return";

    public final static String INFOR_BRAND_ID = "4c7bbcc1-65ad-4326-bf51-34595a55f7fa";
}
