import { createPortal } from 'react-dom';

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        background: 'rgba(0,0,0,0.4)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '320px',
          borderRadius: '12px',
          background: 'var(--color-canvas)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '24px 20px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
            {title}
          </p>
          {description && (
            <p
              style={{
                marginTop: '6px',
                fontSize: '14px',
                color: 'var(--color-ink-muted-48)',
                lineHeight: 1.5,
                marginBottom: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div style={{ borderTop: '1px solid var(--color-hairline)', display: 'flex' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-ink-muted-48)',
              background: 'none',
              border: 'none',
              borderRight: '1px solid var(--color-hairline)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
