import React from 'react'
import AddDrivingRoute from './AddDrivingRoute'
import DrivingRouteList from './DrivingRouteList'
import RequestedDriver from './RequestedDriver'
import AllDriverList from './AllDriverList'
import NotDeliveredOrder from './NotDeliveredOrder'
import SuspendedDriver from './SuspendedDriver'

const DriverSection = () => {
  return (
    <>
       <AddDrivingRoute />
       <DrivingRouteList />
       <RequestedDriver />
       <NotDeliveredOrder />
       <AllDriverList />
       <SuspendedDriver />
    </>
  )
}

export default DriverSection
