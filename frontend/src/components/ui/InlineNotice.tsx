interface InlineNoticeProps {
  message: string;
  onRetry?: () => void | Promise<void>;
  retryLabel?: string;
}

export function InlineNotice({
  message,
  onRetry,
  retryLabel = "Try again",
}: InlineNoticeProps) {
  return (
    <div className="inline-notice" role="alert" aria-live="polite">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={() => void onRetry()} className="inline-notice-action">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
