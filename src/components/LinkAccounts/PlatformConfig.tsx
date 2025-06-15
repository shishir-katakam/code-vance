
import { Zap, Sparkles } from 'lucide-react';

export interface Platform {
  name: string;
  icon: string;
  color: string;
  description: string;
  hasSync: boolean;
}

export const platforms: Platform[] = [
  { 
    name: 'LeetCode', 
    icon: '💻', 
    color: 'bg-gradient-to-r from-orange-500 to-red-500', 
    description: 'Lightning-fast LeetCode sync', 
    hasSync: true 
  },
  { 
    name: 'CodeChef', 
    icon: '🍳', 
    color: 'bg-gradient-to-r from-purple-500 to-indigo-500', 
    description: 'CodeChef platform linking', 
    hasSync: false 
  },
  { 
    name: 'HackerRank', 
    icon: '🎯', 
    color: 'bg-gradient-to-r from-green-500 to-blue-500', 
    description: 'HackerRank platform linking', 
    hasSync: false 
  },
  { 
    name: 'GeeksforGeeks', 
    icon: '🤓', 
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500', 
    description: 'Smart GFG integration', 
    hasSync: true 
  },
];

export const getPlatformIcon = (platformName: string): string => {
  const platform = platforms.find(p => p.name === platformName);
  return platform?.icon || '🔗';
};

export const getPlatformColor = (platformName: string): string => {
  const platform = platforms.find(p => p.name === platformName);
  return platform?.color || 'bg-gray-500';
};

export const getPlatformData = (platformName: string): Platform | undefined => {
  return platforms.find(p => p.name === platformName);
};
