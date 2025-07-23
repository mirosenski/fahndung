import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export function Logo({ className = "", showLink = true }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center space-x-2 sm:space-x-4 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Fahndung Logo"
        width={32}
        height={32}
        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
      />
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-lg lg:text-xl">
          FAHNDUNG
        </span>
        <span
          className="text-xs font-medium leading-tight text-gray-600 dark:text-gray-300 sm:text-sm lg:text-base"
          style={{
            fontStretch: "expanded",
            fontVariationSettings: '"wdth" 150',
            textJustify: "inter-word",
            width: "100%",
            display: "block",
            letterSpacing: "0.15em",
          }}
        >
          POLIZEI BW
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="transition-opacity hover:opacity-80">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
