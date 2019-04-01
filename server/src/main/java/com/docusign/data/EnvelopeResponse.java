package com.docusign.data;

import com.docusign.esign.model.EnvelopeSummary;
import com.docusign.esign.model.ViewUrl;

public class EnvelopeResponse {
    private EnvelopeSummary envelopeSummary;
    private ViewUrl senderView;

    public EnvelopeSummary getEnvelopeSummary() {
        return envelopeSummary;
    }

    public void setEnvelopeSummary(EnvelopeSummary envelopeSummary) {
        this.envelopeSummary = envelopeSummary;
    }

    public ViewUrl getSenderView() {
        return senderView;
    }

    public void setSenderView(ViewUrl senderView) {
        this.senderView = senderView;
    }
}
