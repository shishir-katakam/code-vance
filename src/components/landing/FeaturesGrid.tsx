
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Code2, Users, Sparkles } from "lucide-react";

interface FeaturesGridProps {
  highlight?: boolean;
}

const features = [
  {
    icon: Target,
    title: "Smart Tracking",
    description: "Automatically sync problems from LeetCode, CodeChef, GeeksforGeeks, and more with lightning-fast background processing.",
    color: "from-purple-500 to-pink-500",
    delay: "100ms",
    animation: "animate-float"
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Beautiful visualizations and detailed progress charts that update in real-time as you solve problems.",
    color: "from-green-500 to-emerald-500",
    delay: "200ms",
    animation: "animate-float-delayed"
  },
  {
    icon: Code2,
    title: "Topic Mastery",
    description: "Advanced tracking of your expertise across programming languages, algorithms, and data structures.",
    color: "from-blue-500 to-cyan-500",
    delay: "300ms",
    animation: "animate-float-slow"
  },
  {
    icon: Users,
    title: "AI Insights",
    description: "Get personalized recommendations and learning paths powered by advanced Gemini AI technology.",
    color: "from-pink-500 to-rose-500",
    delay: "400ms",
    animation: "animate-float"
  }
];

const FeaturesGrid = ({ highlight }: FeaturesGridProps) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24 px-4 ${highlight ? "ring-4 ring-purple-400/50 rounded-2xl p-4" : ""}`}
  >
    {features.map((feature, index) => (
      <Card
        key={index}
        className={`bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/60 transition-all duration-500 hover:scale-105 group animate-fade-in hover:shadow-2xl hover:shadow-purple-500/20 ${feature.animation}`}
        style={{
          animationDelay: feature.delay,
          animationDuration: "800ms"
        }}
      >
        <CardHeader className="text-center pb-3 md:pb-4">
          <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} p-3 md:p-4 mb-3 md:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
            <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white transition-all duration-300 group-hover:scale-105" />
          </div>
          <CardTitle className="text-white text-lg md:text-xl font-semibold group-hover:text-purple-300 transition-all duration-300">
            {feature.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center px-4 md:px-6">
          <p className="text-slate-300 leading-relaxed text-sm md:text-base transition-all duration-300 group-hover:text-slate-200">{feature.description}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default FeaturesGrid;
