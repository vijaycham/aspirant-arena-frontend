import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import logo from "../../assets/3.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-slate-900/95 backdrop-blur-xl font-outfit">
      <div className="container mx-auto px-4 sm:px-6 py-3">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Brand (quiet signature) */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Aspirant Arena"
              className="w-6 h-6 rounded-md opacity-80"
              loading="lazy"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Aspirant Arena
            </span>
          </div>

          {/* Copyright */}
          <span className="text-[11px] text-gray-500 text-center">
            © {year} Aspirant Arena
          </span>

          {/* Links & Social */}
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <Link
              to="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-gray-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/feedback"
              className="hover:text-gray-300 transition-colors"
            >
              Help & Support
            </Link>
            <a
              href="https://github.com/vijaycham"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-gray-300 transition-colors"
            >
              <FaGithub size={13} />
            </a>
            <a
              href="https://www.linkedin.com/in/vijaycham/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-gray-300 transition-colors"
            >
              <FaLinkedin size={13} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
