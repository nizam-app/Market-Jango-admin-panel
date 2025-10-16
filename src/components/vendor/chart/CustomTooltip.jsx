const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white rounded-md shadow-lg border border-gray-200">
        <p className="font-bold text-gray-700 mb-2">{`${label} 2020`}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.stroke }}
            ></div>
            <p className="text-gray-600">{item.name}:</p>
            <p className="font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;