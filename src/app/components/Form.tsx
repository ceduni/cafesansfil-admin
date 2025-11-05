interface FormProps {
  title: string;
  inputType: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function Form({ 
  title, 
  inputType, 
  value, 
  onChange, 
  placeholder,
  required = false,
  disabled = false 
}: FormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {title}
        {required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
      </label>
      <input 
        className="form-input"
        type={inputType} 
        value={value} 
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}