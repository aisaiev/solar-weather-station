import { useState } from 'react';

function Footer() {
  const [creator] = useState('Anton Isaiev');
  const [twitterUrl] = useState('https://twitter.com/de_tores');

  return (
    <footer className="container mx-auto px-4 py-8 text-center">
      <small className="text-sm text-muted-foreground">
        Made by <a href={twitterUrl} className="underline hover:text-foreground">{creator}</a>
      </small>
    </footer>
  );
}

export default Footer;
