import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import CustomTooltip from './CustomTooltip';

const data = [
  { name: 'Jan', income: 45000, outcome: 38000 },
  { name: 'Feb', income: 8000, outcome: 5500 },
  { name: 'Mar', income: 15000, outcome: 12000 },
  { name: 'Apr', income: 10000, outcome: 8000 },
  { name: 'May', income: 7000, outcome: 5000 },
  { name: 'Jun', income: 25000, outcome: 20000 },
  { name: 'Jul', income: 15000, outcome: 12000 },
  { name: 'Aug', income: 10000, outcome: 8000 },
  { name: 'Sep', income: 28000, outcome: 25000 },
  { name: 'Oct', income: 18000, outcome: 15000 },
  { name: 'Nov', income: 22000, outcome: 19000 },
  { name: 'Dec', income: 6000, outcome: 4000 },
];

const ChartSection = () => {
  return (
    <div className="bg-white  rounded-lg  
    w-full mx-auto">

      <div className="flex py-3  px-5 justify-between border-b border-[#E5E7E8] items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Income Outcome Flow</h2>
        <select className="bg-[#F5F6F7] rounded-md px-2.5 
        py-2 text-[#4A5154] focus:outline-none">
          <option>This year</option>
          <option>Last year</option>
        </select>
      </div>

    <div className='py-3  px-5'>
 
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-blue-600 rounded-full mr-2"></span>
          <span className="text-gray-700">Income</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-orange-500 rounded-full mr-2"></span>
          <span className="text-gray-700">Outcome</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOutcome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis
            scale="log"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => (value >= 1000 ? `${value / 1000}K` : value)}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#2563EB"
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
          <Area
            type="monotone"
            dataKey="outcome"
            stroke="#F97316"
            fillOpacity={1}
            fill="url(#colorOutcome)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
};

export default ChartSection;