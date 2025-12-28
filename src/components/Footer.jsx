import { Link } from "react-router-dom";
import { FaHome, FaChartLine, FaTasks, FaUserCircle, FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import logo from "../../assets/3.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-10 px-4 sm:px-6 font-outfit overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[300px] rounded-full bg-primary-500/5 blur-[120px]"></div>
      </div>

      <div className="container mx-auto">
        {/* Main Footer Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
            {/* Brand Section */}
            <div className="md:col-span-5 space-y-6 text-center md:text-left">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-500">
                  <img
                    src={logo}
                    alt="Aspirant Arena Logo"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-primary-300 bg-clip-text text-transparent uppercase">
                  Aspirant Arena
                </span>
              </Link>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                The strategic workspace for UPSC aspirants. Master your progress, 
                automate your revision, and conquer the Civil Services with data-driven precision.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <FaGithub />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <FaTwitter />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <FaLinkedin />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-6 text-center md:text-left">
              <h4 className="text-xs font-black text-white uppercase tracking-widest opacity-40">Navigation</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/" className="text-sm font-bold text-gray-400 hover:text-white flex items-center justify-center md:justify-start gap-3 transition-colors group">
                  <FaHome className="opacity-40 group-hover:opacity-100 transition-opacity" /> Home Hub
                </Link>
                <Link to="/test-tracker" className="text-sm font-bold text-gray-400 hover:text-white flex items-center justify-center md:justify-start gap-3 transition-colors group">
                  <FaChartLine className="opacity-40 group-hover:opacity-100 transition-opacity" /> Analytics
                </Link>
                <Link to="/todo" className="text-sm font-bold text-gray-400 hover:text-white flex items-center justify-center md:justify-start gap-3 transition-colors group">
                  <FaTasks className="opacity-40 group-hover:opacity-100 transition-opacity" /> Task Manager
                </Link>
              </nav>
            </div>

            {/* Account & Support */}
            <div className="md:col-span-4 space-y-6 text-center md:text-left">
              <h4 className="text-xs font-black text-white uppercase tracking-widest opacity-40">User Workspace</h4>
              <nav className="flex flex-col gap-4">
                <Link to="/profile" className="text-sm font-bold text-gray-400 hover:text-white flex items-center justify-center md:justify-start gap-3 transition-colors group">
                  <FaUserCircle className="opacity-40 group-hover:opacity-100 transition-opacity" /> Cloud Profile
                </Link>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest block">Pro Tip</span>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    Check your Smart Strategy Coach daily for personalized revision insights.
                  </p>
                </div>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              &copy; {currentYear} Aspirant Arena Crafted with ❤️ by Vijay for UPSC Aspirants.
            </span>
            <div className="flex items-center gap-6">
              <Link to="/about" className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</Link>
              <Link to="/feedback" className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Help & Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
