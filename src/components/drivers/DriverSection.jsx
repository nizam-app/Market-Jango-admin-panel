import React, { useState } from 'react'
import AddDrivingRoute from './AddDrivingRoute'
import DrivingRouteList from './DrivingRouteList'
import RequestedDriver from './RequestedDriver'
import AllDriverList from './AllDriverList'
import NotDeliveredOrder from './NotDeliveredOrder'
import SuspendedDriver from './SuspendedDriver'
import DriverManagement from '../../pages/DriverManagement'

const DriverSection = () => {
  const [routesVersion, setRoutesVersion] = useState(0);

  const handleRoutesReload = () => {
    setRoutesVersion((prev) => prev + 1);
  };
  return (
    <>
       <AddDrivingRoute onRoutesReload={handleRoutesReload} />
       <DrivingRouteList reloadKey={routesVersion} />
       <DriverManagement></DriverManagement>
       {/* <RequestedDriver /> */}
       <NotDeliveredOrder />
       {/* <AllDriverList /> */}
       {/* <SuspendedDriver /> */}
    </>
  )
}

export default DriverSection
