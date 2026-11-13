import Icon from './Icon';
import Button from './Button';

function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="banner" role="alert">
      <Icon name="alert" size={18} />
      <p>{message}</p>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorBanner;
