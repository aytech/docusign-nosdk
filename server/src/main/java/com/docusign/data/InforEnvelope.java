package com.docusign.data;

import com.docusign.esign.model.CustomFieldsEnvelope;
import com.docusign.esign.model.Envelope;
import com.docusign.esign.model.TextCustomField;

public class InforEnvelope {
    private Envelope envelope;
    private String tenantId;

    public InforEnvelope(Envelope envelope, CustomFieldsEnvelope customFieldsEnvelope) {
        this.envelope = envelope;
        this.setTenantId(customFieldsEnvelope);
    }

    public Envelope getEnvelope() {
        return envelope;
    }

    public void setEnvelope(Envelope envelope) {
        this.envelope = envelope;
    }

    public String getTenantId() {
        return tenantId;
    }

    private void setTenantId(CustomFieldsEnvelope envelope) {
        for (TextCustomField field : envelope.getTextCustomFields()) {
            if (field.getName().equals("tenant")) {
                this.tenantId = field.getValue();
                return;
            }
        }
    }
}
