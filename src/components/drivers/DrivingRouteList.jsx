import React, { useState } from 'react';

const DrivingRouteList = () => {
  const [routes, setRoutes] = useState([
    ['Naperville', 'Austin', 'Fairfield', 'Pembroke Pines', 'Orange', 'Austin', 'Naperville'],
    ['Orange', 'Fairfield', 'Toledo', 'Fairfield', 'Pembroke', 'Toledo', 'Naperville'],
    ['Pembroke', 'Naperville', 'Pembroke', 'Toledo', 'Pines', 'Austin', 'Toledo'],
    ['Orange', 'Naperville', 'Toledo', 'Fairfield', 'Toledo', 'Pines', 'Naperville'],
  ]);

  const handleRemoveLocation = (routeIndex, locationIndex) => {
    setRoutes((currentRoutes) =>
      currentRoutes.map((route, rIndex) => {
        if (rIndex === routeIndex) {
          return route.filter((_, lIndex) => lIndex !== locationIndex);
        }
        return route;
      })
    );
  };

  return (
    <div className="my-10">
      {/* Save Driving Route List Section */}
      <div>
        <h2 className="text-[26px] font-semibold mb-3">Save Driving Route List</h2>
        <div className="space-y-6">
          {routes.map((route, routeIndex) => (
            <div key={routeIndex} className='flex gap-2 flex-wrap'>
              <h3 className="text-lg font-medium mb-2">Route {routeIndex + 1} :</h3>
              <div className="flex flex-wrap gap-2">
                {route.map((location, locationIndex) => (
                  <div
                    key={locationIndex}
                    className="flex items-center flex-wrap bg-white
                      rounded-[100px] px-4 py-2  font-normal"
                  >
                    <span className='text-sm'>{location}</span>
                    <button
                      onClick={() => handleRemoveLocation(routeIndex, locationIndex)}
                      className="ml-2 cursor-pointer text-2xl h-4 flex items-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrivingRouteList;