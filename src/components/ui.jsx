import React, { useEffect, useRef } from 'react';
import { Info, Wind, X } from 'lucide-react';

export function Badge({ children, tone = 'green' }) {
  return <span className={'badge ' + tone}>{children}</span>;
}

export function Button({ children, variant = '', className = '', ...props }) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Panel({ children, className = '' }) {
  return <section className={'panel ' + className}>{children}</section>;
}

export function Heading({ icon: Icon, title, sub, action }) {
  return (
    <div className="panel-heading">
      <div>
        <h2>
          {Icon && <Icon size={18} />} {title}
        </h2>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children }) {
  const id = React.useId();
  const native =
    React.isValidElement(children) &&
    ['input', 'select', 'textarea'].includes(children.type);
  return (
    <div className="field">
      {native ? <label htmlFor={id}>{label}</label> : <span id={id}>{label}</span>}
      {native ? (
        React.cloneElement(children, { id })
      ) : (
        <div role="group" aria-labelledby={id}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Notice({ children, kind = '' }) {
  return (
    <div className={'notice ' + kind}>
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}

export function Empty({ icon: Icon = Wind, title, children }) {
  return (
    <div className="empty">
      <Icon size={32} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = ref.current?.querySelectorAll(
          'button,input,select,textarea,a[href],[tabindex="0"]'
        );
        if (!focusable?.length) return;
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      old?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        ref={ref}
        className={'modal ' + (wide ? 'wide' : '')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
