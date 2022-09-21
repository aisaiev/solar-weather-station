function Footer() {
  const creator = 'Anton Isaiev';
  const twitterUrl = 'https://twitter.com/de_tores';

  return (
    <footer className="container text-align-center">
      <small>
        Made by <a href={twitterUrl}>{creator}</a>
      </small>
    </footer>
  );
}

export default Footer;
