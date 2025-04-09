import { useEffect, useRef } from "react";

const MapSelector = ({maps, onMapSelected}) => {
  
  const mapSelectedHandler = (e) => {
    onMapSelected(e.target.value)
  }
  
  return (
    <div className="flex items-center fixed top-0 left-0 z-50 w-full md:w-1/3 lg:w-1/4 h-2/10 md:h-2/10 py-4 px-4 bg-[#dedede] text-center">
      <div class="w-full">              
        <div class="relative">          
            <select
              onChange={mapSelectedHandler}
              class="w-full placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer">
              <option selected disabled>Select a map</option>
              {maps && maps.map((map) => (
                <option key={map.key} value={map.key}>{map.name}</option>
              ))}
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
        </div>
      </div>
    </div>
  )
}

export default MapSelector