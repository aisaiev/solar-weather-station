function Header() {
  return (
    <header className="container mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Solar Weather Station</h1>
        <p className="text-lg text-muted-foreground">
          This is a solar-powered weather station that runs on an ESP32
          microcontroller located in Kyiv, Ukraine and sometimes it can go
          offline due to longer periods of bad weather conditions.
        </p>
      </div>
    </header>
  );
}

export default Header;
