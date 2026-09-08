import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>

      {showText && (
        <div className="flex flex-col">
          <span className="text-[var(--color-text-white)] font-bold text-sm tracking-[0.2em] uppercase leading-none">
            ORCA
          </span>
          <span className="text-[10px] text-[var(--color-signal-amber)] tracking-[0.1em] font-medium mt-1 leading-none">
            INTELLIGENCE
          </span>
        </div>
      )}
    </Link>
  );
}
