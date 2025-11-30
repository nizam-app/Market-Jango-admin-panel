import React from 'react'
import ChartSection from '../components/vendor/chart/ChartSection'
import AllVendor from '../components/vendor/AllVendor'
import RequestedVendor from '../components/vendor/RequestedVendor'
import SuspendedVendor from '../components/vendor/SuspendedVendor'

const Vendor = () => {
  return (
    <>
      {/* <ChartSection /> */}
      <AllVendor />
      <RequestedVendor />
      <SuspendedVendor />
    </>
  )
}

export default Vendor
