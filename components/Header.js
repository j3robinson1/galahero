import Link from 'next/link';

function Header() {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <a href="/"><br></br></a>
          </li>
        </ul>
      </nav>

      {/* Add styles */}
      <style jsx>{`
        header {
          background: linear-gradient(315deg, #840758 0%, #530f3c 20%, #300621 80%, #560a3d 90%);
          padding: 1rem;
        }

        nav ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        nav li {
          margin-right: 1rem;
        }

        nav a {
          text-decoration: none;
          color: white; 
          font-size: 1rem;
        }

        nav a:hover {
          color: silver;
        }
      `}</style>
    </header>
  );
}

export default Header;