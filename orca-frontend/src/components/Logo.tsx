import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>

      {showText && (
        <img src="/orca-logo.png" alt="ORCA" className="h-10 md:h-12 object-contain" />
      )}
    </Link>
  );
}
