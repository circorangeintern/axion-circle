import navbarLogoSvg from '../assets/navbar-logo.svg';

export default function NavbarLogo({ className = "h-8 sm:h-9 w-auto object-contain" }) {
  return (
    <img
      src={navbarLogoSvg}
      alt="CleanReport Navbar Logo"
      className={className}
    />
  );
}
