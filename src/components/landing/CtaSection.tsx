
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";

interface CtaSectionProps {
  onStart: () => void;
  highlight?: boolean;
}

const CtaSection = ({ onStart, highlight }: CtaSectionProps) => (
  <div className={`text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-16 mx-4 animate-fade-in delay-700 transition-all duration-[1240ms] ease-[cubic-bezier(.86,0,.36,1)] hover:bg-gradient-to-r hover:from-purple-600/30 hover:via-pink-600/30 hover:to-purple-600/30 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] ${highlight ? "ring-4 ring-purple-400/50 ring-opacity-100 animate-pulse" : ""}`}>
    <div className="inline-flex items-center space-x-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8 transition-all duration-[750ms] ease-in-out hover:bg-purple-500/30 hover:border-purple-500/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-400 transition-all duration-[600ms] ease-in-out hover:text-purple-300 hover:scale-110 animate-pulse" />
      <span className="text-purple-300 text-xs md:text-sm font-medium transition-all duration-[600ms] ease-in-out hover:text-purple-200">Join the Revolution</span>
    </div>
    <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight px-2 transition-all duration-[1000ms] ease-[cubic-bezier(.86,0,.36,1)] hover:scale-105 hover:bg-gradient-to-r hover:from-white hover:via-purple-200 hover:to-pink-200 hover:bg-clip-text hover:text-transparent">
      Ready to 
      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-[950ms] ease-[cubic-bezier(.86,0,.36,1)] hover:from-purple-300 hover:to-pink-300 inline-block hover:scale-110"> Dominate </span>
      Your Coding Goals?
    </h3>
    <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-10 max-w-2xl mx-auto px-4 transition-all duration-[700ms] ease-in-out hover:text-slate-200 hover:scale-105">
      Join thousands of developers who are already accelerating their programming journey with our intelligent tracking platform.
    </p>
    <div className="transform transition-all duration-[1100ms] ease-[cubic-bezier(.86,0,.36,1)] hover:scale-105">
      <Button
        size="lg"
        onClick={onStart}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl text-lg md:text-xl font-semibold shadow-2xl hover:shadow-purple-500/40 transition-all duration-[1300ms] ease-[cubic-bezier(.86,0,.36,1)] hover:scale-110 hover:-translate-y-1 group w-full sm:w-auto justify-center relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500 before:via-pink-500 before:to-purple-500 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-[1100ms] before:ease-[cubic-bezier(.86,0,.36,1)]"
      >
        <span className="relative z-10 flex items-center">
          <Rocket className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 group-hover:animate-bounce group-hover:scale-125 transition-all duration-[700ms] ease-[cubic-bezier(.86,0,.36,1)]" />
          Launch Your Journey Now
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 ml-2 md:ml-3 group-hover:animate-pulse group-hover:scale-125 transition-all duration-[700ms] ease-[cubic-bezier(.86,0,.36,1)]" />
        </span>
      </Button>
    </div>
    <p className="text-xs md:text-sm text-slate-400 mt-4 md:mt-6 px-4 transition-all duration-[700ms] ease-in-out hover:text-slate-300 hover:scale-105">
      ✨ Free forever • No credit card required • Setup in 30 seconds
    </p>
  </div>
);

export default CtaSection;
