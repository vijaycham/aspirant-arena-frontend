import { useState } from "react";
import { FaPaperPlane, FaBug, FaLightbulb, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../utils/api";

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("contact");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    type: "contact", // contact, bug, feature
    email: "" // Optional if user wants to be contacted
  });

  const tabs = [
    { id: "contact", label: "Contact Developer", icon: <FaEnvelope /> },
    { id: "bug", label: "Report Bug", icon: <FaBug /> },
    { id: "feature", label: "Feature Request", icon: <FaLightbulb /> },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/feedback", { ...formData, type: activeTab });
      
      if (res.status === "success") {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ subject: "", message: "", type: activeTab, email: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 bg-slate-950 relative overflow-hidden font-outfit">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">We're Listening</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Help us build the <br/>
            <span className="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Perfect Arena</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Whether it's a glitch, a brilliant idea, or just a hello — we want to hear from you.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
            
            {/* Sidebar Tabs */}
            <div className="md:col-span-4 bg-slate-950/50 p-6 md:p-8 space-y-4 border-b md:border-b-0 md:border-r border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                    activeTab === tab.id
                      ? "bg-primary-600/20 border border-primary-500/50 text-primary-400 shadow-lg shadow-primary-900/20"
                      : "hover:bg-white/5 text-gray-500 hover:text-gray-300 border border-transparent"
                  }`}
                >
                  <div className={`p-3 rounded-xl ${activeTab === tab.id ? "bg-primary-500 text-white" : "bg-slate-900 text-gray-500 group-hover:text-white group-hover:bg-slate-800"}`}>
                    {tab.icon}
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-sm">{tab.label}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">
                      {tab.id === 'contact' ? 'Get in touch' : tab.id === 'bug' ? 'Fix Issues' : 'New Ideas'}
                    </span>
                  </div>
                </button>
              ))}
              
              <div className="mt-8 pt-8 border-t border-white/5 px-4 hidden md:block">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Direct Connect</p>
                 <div className="space-y-3">
                    <a href="mailto:support@aspirantarena.com" className="flex items-center gap-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">📧</span>
                        support@aspirantarena.com
                    </a>
                 </div>
              </div>
            </div>

            {/* Form Area */}
            <div className="md:col-span-8 p-6 md:p-12">
               <div className="h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white mb-2">
                        {activeTab === 'contact' && "Send us a Message"}
                        {activeTab === 'bug' && "Report a Bug"}
                        {activeTab === 'feature' && "Suggest a Feature"}
                    </h3>
                    <p className="text-sm text-gray-400 font-medium">
                        {activeTab === 'contact' && "We usually respond within 24 hours."}
                        {activeTab === 'bug' && "Found something broken? Let us know the details."}
                        {activeTab === 'feature' && "Have an idea to make the Arena better? Pitch it!"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Your Email (Optional)</label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="To verify or reply..."
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-gray-600 focus:bg-slate-950 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                            {activeTab === 'bug' ? 'Issue Subject' : activeTab === 'feature' ? 'Feature Title' : 'Subject'}
                        </label>
                        <input 
                            type="text" 
                            name="subject"
                            required
                            placeholder={activeTab === 'bug' ? 'e.g., Timer styling breaks on mobile' : 'Summary of your message'}
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-gray-600 focus:bg-slate-950 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Details</label>
                        <textarea 
                            name="message"
                            required
                            rows="6"
                            placeholder={activeTab === 'bug' ? 'Steps to reproduce...' : 'Tell us more...'}
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-gray-600 focus:bg-slate-950 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-900/40 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <>
                                <FaPaperPlane /> Send Feedback
                            </>
                        )}
                    </button>
                  </form>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
