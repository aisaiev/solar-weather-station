import { useState } from 'react';

function Footer() {
  const [creator] = useState('Anton Isaiev');
  const [twitterUrl] = useState('https://twitter.com/de_tores');

  return (
    <footer className="container text-align-center">
      <small>
        Made by <a href={twitterUrl}>{creator}</a>
      </small>
    </footer>
  );
}

export default Footer;
