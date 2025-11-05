"use client";

import { useState } from "react";
import { Cafe, PaymentDetails } from "../types/cafe";

interface PaymentMethodsEditorProps {
  cafe: Cafe;
  onUpdate: (updatedCafe: Cafe) => void;
}

const PAYMENT_METHODS = [
  { value: "CREDIT", label: "Credit Card" },
  { value: "DEBIT", label: "Debit Card" },
  { value: "CASH", label: "Cash" },
  { value: "INTERAC", label: "Interac" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "APPLE_PAY", label: "Apple Pay" },
  { value: "GOOGLE_PAY", label: "Google Pay" }
];

export default function PaymentMethodsEditor({ cafe, onUpdate }: PaymentMethodsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails[]>(cafe.payment_details || []);

  const addPaymentMethod = () => {
    setPaymentDetails([...paymentDetails, { method: "CREDIT", minimum: "0" }]);
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentDetails, value: string) => {
    const updated = [...paymentDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPaymentDetails(updated);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentDetails(paymentDetails.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate({ ...cafe, payment_details: paymentDetails });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPaymentDetails(cafe.payment_details || []);
    setIsEditing(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "var(--primary)" }}>
          Payment Methods
        </h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ fontSize: "0.875rem" }}
          >
            Edit Methods
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
            {paymentDetails.map((payment, index) => (
              <div key={index} style={{ 
                padding: "1rem", 
                border: "1px solid var(--border)", 
                borderRadius: "0.5rem",
                background: "var(--muted)"
              }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Payment Method</label>
                    <select
                      value={payment.method}
                      onChange={(e) => updatePaymentMethod(index, 'method', e.target.value)}
                      className="form-input"
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Minimum Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.minimum}
                      onChange={(e) => updatePaymentMethod(index, 'minimum', e.target.value)}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <button
                    onClick={() => removePaymentMethod(index)}
                    className="btn btn-destructive"
                    style={{ marginTop: "1.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addPaymentMethod}
            className="btn btn-primary"
            style={{ marginBottom: "1rem" }}
          >
            Add Payment Method
          </button>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleSave} className="btn btn-success">
              Save Changes
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {paymentDetails.length > 0 ? (
            paymentDetails.map((payment, index) => (
              <div key={index} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                background: "var(--muted)"
              }}>
                <span style={{ fontWeight: "500" }}>
                  {PAYMENT_METHODS.find(m => m.value === payment.method)?.label || payment.method}
                </span>
                <span style={{ 
                  background: "var(--primary)", 
                  color: "white", 
                  padding: "0.25rem 0.5rem", 
                  borderRadius: "0.25rem",
                  fontSize: "0.875rem"
                }}>
                  Min: ${payment.minimum}
                </span>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "2rem", 
              textAlign: "center", 
              color: "var(--muted-foreground)",
              border: "2px dashed var(--border)",
              borderRadius: "0.5rem"
            }}>
              No payment methods configured. Click Edit to add some.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
