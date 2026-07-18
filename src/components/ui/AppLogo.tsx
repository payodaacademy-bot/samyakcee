import Image from 'next/image';
import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

const AppLogo = ({ size = 32, className = '' }: AppLogoProps) => {
  return (
    <div
      className={`rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/assets/images/app_logo.png"
        alt="Samyak CEE Mastery Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {}}
      />
    </div>
  );
};

export default AppLogo;
