"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

export default function BankDetailsForm({ initialValues, onSave }) {
  const [values, setValues] = useState(
    initialValues || {
      bankName: "",
      accountNumber: "",
      ifsc: "",
      holderName: "",
    },
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: "" }));
  };

  const handleSave = () => {
    const nextErrors = {};
    if (!values.bankName.trim()) nextErrors.bankName = "Bank name is required.";
    if (!values.accountNumber.trim())
      nextErrors.accountNumber = "Account number is required.";
    if (!values.ifsc.trim()) nextErrors.ifsc = "IFSC code is required.";
    if (!values.holderName.trim())
      nextErrors.holderName = "Account holder name is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    // TODO: this should also POST to your backend to persist it — right
    // now onSave only updates the local mock store.
    onSave(values);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
      <div>
        <p className="text-sm font-semibold text-white">
          Add your bank details
        </p>
        <p className="mt-1 text-xs text-slate-400">
          We need this on file before you can withdraw.
        </p>
      </div>

      <InputField
        label="Bank name"
        placeholder="e.g. State Bank of India"
        value={values.bankName}
        onChange={handleChange("bankName")}
        error={errors.bankName}
      />
      <InputField
        label="Account number"
        placeholder="Enter account number"
        value={values.accountNumber}
        onChange={handleChange("accountNumber")}
        error={errors.accountNumber}
      />
      <InputField
        label="IFSC code"
        placeholder="e.g. SBIN0001234"
        value={values.ifsc}
        onChange={(e) =>
          handleChange("ifsc")({
            target: { value: e.target.value.toUpperCase() },
          })
        }
        error={errors.ifsc}
      />
      <InputField
        label="Account holder name"
        placeholder="As per bank records"
        value={values.holderName}
        onChange={handleChange("holderName")}
        error={errors.holderName}
      />

      <Button variant="secondary" onClick={handleSave}>
        Save bank details
      </Button>
    </div>
  );
}
