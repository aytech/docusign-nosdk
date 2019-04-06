package com.docusign.data;

import com.docusign.esign.model.EnvelopeSummary;

public class EnvelopeResponse {
    private EnvelopeSummary envelopeSummary;
    private String senderViewUrl;

    public EnvelopeSummary getEnvelopeSummary() {
        return envelopeSummary;
    }

    public void setEnvelopeSummary(EnvelopeSummary envelopeSummary) {
        this.envelopeSummary = envelopeSummary;
    }

    public String getSenderViewUrl() {
        return senderViewUrl;
    }

    public void setSenderViewUrl(String senderViewUrl) {
        this.senderViewUrl = senderViewUrl;
    }
}
