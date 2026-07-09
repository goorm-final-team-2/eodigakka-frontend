import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import { createAppointment, joinAppointment } from '@/api/appointment';
import { QUERY_KEYS } from '@/constants/queryKeys';

type Props = { isOpen: boolean; onClose: () => void };
type Mode = 'create' | 'join';

export default function AppointmentFormModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('create');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [preferredArea, setPreferredArea] = useState('');
  const [description, setDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // 상위에서 key={String(isModalOpen)}으로 마운트/언마운트 → 닫힐 때 자동 상태 초기화

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
      onClose();
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinAppointment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() });
      onClose();
    },
  });

  if (!isOpen) return null;

  const isSubmitting = createMutation.isPending || joinMutation.isPending;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      appointmentDate: date,
      appointmentTime: `${time}:00`,
      ...(preferredArea && { preferredArea }),
      ...(description && { description }),
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    joinMutation.mutate({ inviteCode });
  };

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 50,
    display: 'flex',
    alignItems: 'flex-end',
  };

  const sheet: React.CSSProperties = {
    width: '100%',
    maxHeight: '90dvh',
    overflowY: 'auto',
    backgroundColor: 'var(--color-canvas)',
    borderRadius: '20px 20px 0 0',
    padding: '20px 20px',
    paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
  };

  const tabBar: React.CSSProperties = {
    display: 'flex',
    gap: '6px',
    marginBottom: '24px',
    backgroundColor: 'var(--color-canvas-parchment)',
    borderRadius: '10px',
    padding: '4px',
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    backgroundColor: active ? 'var(--color-canvas)' : 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-ink-muted-48)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-ink-muted-80)',
    marginBottom: '6px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid var(--color-hairline)',
    borderRadius: '10px',
    fontSize: '1rem',
    color: 'var(--color-ink)',
    backgroundColor: 'var(--color-canvas)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const fieldStyle: React.CSSProperties = { marginBottom: '16px' };

  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '14px',
    borderRadius: '9999px',
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--color-on-primary)',
    backgroundColor: disabled ? 'var(--color-ink-muted-48)' : 'var(--color-primary)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.15s',
  });

  const errorStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '0.8125rem',
    // eslint-disable-next-line no-restricted-syntax
    color: '#ff3b30', // CSS 변수에 에러 색상 없음 — 시스템 레드 직접 사용
    textAlign: 'center',
  };

  return createPortal(
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div style={overlay} onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        style={sheet}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* 핸들 바 */}
        <div
          style={{
            width: '36px',
            height: '4px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-hairline)',
            margin: '0 auto 20px',
          }}
        />

        <h2
          id="appointment-modal-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--color-ink)',
            marginBottom: '20px',
          }}
        >
          새 약속
        </h2>

        {/* 탭 */}
        <div style={tabBar}>
          <button style={tabBtn(mode === 'create')} onClick={() => setMode('create')}>
            약속 만들기
          </button>
          <button style={tabBtn(mode === 'join')} onClick={() => setMode('join')}>
            초대 코드로 참여
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreate}>
            <div style={fieldStyle}>
              <label htmlFor="appt-title" style={labelStyle}>
                약속 이름 *
              </label>
              <input
                id="appt-title"
                style={inputStyle}
                type="text"
                placeholder="예: 강남 점심 모임"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="appt-date" style={labelStyle}>
                  날짜 *
                </label>
                <input
                  id="appt-date"
                  style={inputStyle}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="appt-time" style={labelStyle}>
                  시간 *
                </label>
                <input
                  id="appt-time"
                  style={inputStyle}
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label htmlFor="appt-area" style={labelStyle}>
                선호 지역
              </label>
              <input
                id="appt-area"
                style={inputStyle}
                type="text"
                placeholder="예: 강남, 홍대"
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="appt-desc" style={labelStyle}>
                설명
              </label>
              <input
                id="appt-desc"
                style={inputStyle}
                type="text"
                placeholder="약속에 대한 간단한 설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {createMutation.isError && (
              <p style={errorStyle}>약속 생성에 실패했습니다. 다시 시도해주세요.</p>
            )}

            <button
              type="submit"
              style={primaryBtn(isSubmitting || !title || !date || !time)}
              disabled={isSubmitting || !title || !date || !time}
            >
              {createMutation.isPending ? '생성 중...' : '약속 만들기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin}>
            <div style={fieldStyle}>
              <label htmlFor="appt-invite" style={labelStyle}>
                초대 코드 *
              </label>
              <input
                id="appt-invite"
                style={inputStyle}
                type="text"
                placeholder="초대 코드를 입력하세요"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim())}
                required
              />
            </div>

            {joinMutation.isError && (
              <p style={errorStyle}>참여에 실패했습니다. 초대 코드를 확인해주세요.</p>
            )}

            <button
              type="submit"
              style={primaryBtn(isSubmitting || !inviteCode)}
              disabled={isSubmitting || !inviteCode}
            >
              {joinMutation.isPending ? '참여 중...' : '약속 참여하기'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
