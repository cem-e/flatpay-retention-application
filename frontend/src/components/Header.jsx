export default function Header({ logo, onLogoClick }) {
  return (
    <header className="topbar">
      <button className="brand-button" onClick={onLogoClick} type="button">
        <img className="brand-logo" src={logo} alt="Flatpay" />
      </button>
    </header>
  );
}
