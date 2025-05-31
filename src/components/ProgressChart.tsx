
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Problem {
  id: number;
  name: string;
  platform: string;
  topic: string;
  language: string;
  difficulty: string;
  completed: boolean;
  dateAdded: string;
}

interface ProgressChartProps {
  problems: Problem[];
}

const ProgressChart = ({ problems }: ProgressChartProps) => {
  // Weekly progress data
  const weeklyData = [
    { day: 'Mon', solved: 2 },
    { day: 'Tue', solved: 1 },
    { day: 'Wed', solved: 3 },
    { day: 'Thu', solved: 0 },
    { day: 'Fri', solved: 2 },
    { day: 'Sat', solved: 1 },
    { day: 'Sun', solved: 2 },
  ];

  // Difficulty distribution
  const difficultyData = [
    { name: 'Easy', value: problems.filter(p => p.difficulty === 'Easy').length, color: '#10b981' },
    { name: 'Medium', value: problems.filter(p => p.difficulty === 'Medium').length, color: '#f59e0b' },
    { name: 'Hard', value: problems.filter(p => p.difficulty === 'Hard').length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Weekly Activity */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Difficulty Distribution */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Difficulty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {difficultyData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressChart;
