import React from 'react';

interface FooterProps {
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isDark }) => {
  return (
    <footer className={`w-full py-6 px-6 mt-12 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-600'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          © Designed and Developed by Sir Muhammad Burhan Azhar for Students
        </p>
      </div>
    </footer>
  );
};