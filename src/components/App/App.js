import { useEffect,  useState } from "react";
import './App.css';
import Map from '../Map/Map'
import Legend from '../Legend/Legend'
import MapSelector from '../MapSelector/MapSelector';
import config from '../../data/config.json'

function App() {

  const [isMobile, setIsMobile] = useState(true);
  const [selectedMap, setSelectedMap] = useState(null);

  const configData = config

  const maps = Object.keys(configData.maps).map(key => {
    return {"name": configData.maps[key].name, "key": key}
  })

  const mapSelectedHandler = (value) => {
    setSelectedMap(value)
  }

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    //setSelectedMap(configData.maps["filed_cos_resolution"])
  }, []);  

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapSelector maps={maps} onMapSelected={mapSelectedHandler} />
      <Map config={configData} selectedMap={selectedMap} />      
      <Legend config={configData} selectedMap={selectedMap} isMobile={isMobile} />
    </div>
  );
}

export default App;
