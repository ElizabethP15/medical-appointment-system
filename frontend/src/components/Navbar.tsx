import React from 'react';

interface NavbarProps {
  brandName?: string;
  links?: Array<{
    label: string;
    href: string;
  }>;
}

const Navbar: React.FC<NavbarProps> = ({
  brandName = 'Medical Appointment',
  links = [],
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <a href="/">{brandName}</a>
        </div>
        <ul className="navbar-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
