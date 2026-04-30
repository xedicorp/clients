import "./ReminderButton.css";

export default function ReminderButton({ 
  className = "", 
  size = "small", 
  variant = "primary",
  style = {},
  title = "Create Reminder",
  color = "default", // New prop for custom colors
  text = "Reminder", // New prop for custom button text
  onClick,
  ...props 
}) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
  };

  const buttonClass = `reminder-btn ${size} ${variant} ${color} ${className}`.trim();

  return (
    <button 
      type="button" 
      className="primary-btn"
      onClick={handleClick}
      title={title}
      style={style}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2v6h.01M6 8.01L6 8M6 8v6l4 4h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8L6 8z"/>
        <path d="M12 12h4"/>
        <path d="M12 16h2"/>
      </svg>
      <span>{text}</span>
    </button>
  );
}
