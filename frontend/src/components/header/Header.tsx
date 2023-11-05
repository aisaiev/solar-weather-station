function Header() {
  return (
    <header className="container">
      <hgroup>
        <h1>Solar Weather Station</h1>
        <h2>
          This is a solar-powered weather station that runs on an ESP32
          microcontroller located in Kyiv, Ukraine and sometimes it can go
          offline due to longer periods of bad weather conditions.
        </h2>
      </hgroup>
    </header>
  );
}

export default Header;
