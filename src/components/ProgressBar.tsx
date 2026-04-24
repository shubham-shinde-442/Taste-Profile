interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps): JSX.Element {
  const clamped = Math.max(0, Math.min(value, 1));

  return (
    <div className="progress-wrap" aria-label="Swipe progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped * 100}%` }} />
      </div>
    </div>
  );
}
