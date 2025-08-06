import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export function Logo({ className = "", showLink = true }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center space-x-3 sm:space-x-4 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Fahndung Logo"
        width={32}
        height={32}
        className="h-8 w-8 flex-shrink-0 sm:h-8 sm:w-8 lg:h-10 lg:w-10"
      />
      <div className="flex min-w-[160px] flex-col items-stretch justify-center">
        <span className="font-arial text-xs font-normal leading-tight tracking-[4px] text-black subpixel-antialiased [font-family:'Arial-Regular',Helvetica] dark:text-white sm:text-sm lg:text-base">
          POLIZEI BW
        </span>
        <span className="-mt-0.5 text-base font-black leading-tight tracking-[0.5px] text-[#373a41] subpixel-antialiased [font-family:'Inter-Black',Helvetica] dark:text-gray-200 sm:-mt-1 sm:text-lg lg:text-xl">
          FAHNDUNG
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
