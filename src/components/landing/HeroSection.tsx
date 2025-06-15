
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, Zap } from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
  onDemo: () => void;
}

const HeroSection = ({ onStart, onDemo }: HeroSectionProps) => (
  <div className="text-center mb-16 md:mb-24 animate-fade-in">
    <div className="inline-flex items-center space-x-2 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8 animate-air-flow">
      <Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
      <span className="text-purple-300 text-xs md:text-sm font-medium">Powered by AI Intelligence</span>
    </div>
    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight px-2 animate-gentle-float">
      Master Your
      <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"> 
        Coding Journey
      </span>
    </h2>
    <p className="text-lg md:text-xl text-slate-300 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
      Transform your programming skills with intelligent tracking, real-time analytics, and AI-powered insights across all major coding platforms.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
      <Button
        size="lg"
        onClick={onStart}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group w-full sm:w-auto justify-center"
      >
        <Rocket className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
        <span>Start Your Journey</span>
      </Button>
      <Button
        variant="outline"
        size="lg"
        onClick={onDemo}
        className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/40 px-8 md:px-10 py-3 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-1 w-full sm:w-auto group"
      >
        <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
        Watch Demo
      </Button>
    </div>
  </div>
);

export default HeroSection;
