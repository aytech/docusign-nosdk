package com.docusign.configuration;

import java.util.HashMap;
import java.util.Map;

public class AppConfiguration {

    // Static configuration
    public static final String TENANT_TITLE = "InforOS Tenant";
    public static final String TENANT_ID = "DEVIDMADE2_AX1";
    public static final String REGION_ID = "US-EAST";
    public final static String DRILLBACK = "LogicalId=lid://infor.daf.daf";

    // Variables that can be overridden by the environment
    private final String RedirectURIKey = "REDIRECT_URI";
    private Map<String, String> environmentVariables = new HashMap<>();

    public AppConfiguration() {
        String defaultRedirectURI = "http://localhost:3000/ds-return";
        environmentVariables.put(RedirectURIKey, defaultRedirectURI);
        for (String key : environmentVariables.keySet()) {
            String systemVariable = System.getenv(key);
            if (systemVariable != null) {
                environmentVariables.put(key, systemVariable);
            }
        }
    }

    public String getAuthServerURI() {
        // point to the demo (sandbox) environment. For production requests your account sub-domain
        // will vary, you should always use the base URI that is returned from authentication to
        // ensure your integration points to the correct endpoints (in both environments)
        // use demo authentication server (remove -d for production)
        return "https://account-d.docusign.com";
    }

    public String getInforBrandID() {
        // Brand to be used for envelopes
        return "4c7bbcc1-65ad-4326-bf51-34595a55f7fa";
    }

    /*
     * Redirect URI for the Auth Grant flow. Must be registered in DocuSign App settings.
     * This is the exact match, no parameters can be appended. All query parameters must
     * be passed to $state variable passed to DocuSign.
     * This value can be overridden by environment variable
     */
    public String getRedirectUri() {
        return environmentVariables.get(RedirectURIKey);
    }
}
