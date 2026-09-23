import { useState } from "react";
import Icon from "../landing/Icon";

// Form building blocks for the auth pages. Each field shows its hint, or its
// error when there is one, and wires up the right aria attributes.

function describedBy(id, error, hint) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

function FieldMessage({ id, error, hint }) {
  if (error) return <p className="au-field-error" id={`${id}-error`}>{error}</p>;
  if (hint) return <p className="au-hint" id={`${id}-hint`}>{hint}</p>;
  return null;
}

export function TextField({ id, label, error, hint, labelAside, ...inputProps }) {
  return (
    <div className="au-field">
      <div className="au-label-row">
        <label className="au-label" htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      <input
        id={id}
        name={id}
        className="au-input"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ id, label, error, hint, labelAside, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="au-field">
      <div className="au-label-row">
        <label className="au-label" htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      <div className="au-input-wrap">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className="au-input"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          {...inputProps}
        />
        <button
          type="button"
          className="au-reveal"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

// Text input with suggestions: students can pick from the list or type their own value
export function ComboField({ id, label, error, hint, options, ...inputProps }) {
  const listId = `${id}-options`;
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        list={listId}
        className="au-input au-combo"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
      />
      <datalist id={listId}>
        {options.map((opt) => <option key={opt} value={opt} />)}
      </datalist>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({ id, label, error, hint, placeholder, options, ...selectProps }) {
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        className="au-input au-select"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const value = typeof opt === "object" ? opt.value : opt;
          const text = typeof opt === "object" ? opt.label : opt;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  return (
    <div className={`au-alert au-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "alert" : tone === "success" ? "check" : "info"} size={18} strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}
