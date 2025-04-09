import { useEffect, useRef } from "react";
import Legend from '../Legend/Legend'
import MapSelector from '../MapSelector/MapSelector'

const SideBar = () => {
  return (
    <div className="absolute top-0 left-0 z-50 w-1/2 md:w-1/4 flex flex-col h-screen bg-[#FF0000]">
      <MapSelector />
      <Legend />
    </div>
  )
}

export default SideBar