import { useEffect, useRef, useState } from "react";
import * as turf from '@turf/turf'
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";
import usaStatesGeoJson from '../../data/states.json'

const Map = ({config, selectedMap}) => {
  const map = useRef(null);
  const mapContainer = useRef(null);
  const [initialBounds, setInitialBounds] = useState(null)

  const createPatternExpression = async (layers) => {
    let patternExpression = ["case"]

    layers.forEach(async (layer, index) => {
      if(layer.hasOwnProperty("pattern")) {

        let patternName = [layer.pattern.colors[0].replace("#", ""), layer.pattern.colors[1].replace("#", "")].join("_")

        if(!map.current.hasImage(patternName)) {            
          await createPattern(patternName, layer.pattern.colors[0], layer.pattern.colors[1])
        }

        patternExpression.push(["in", ["get", "STUSPS"], ["literal", layer.states]])
        patternExpression.push(patternName)
      }
    })

    return patternExpression
  }

  const updateMapContent = async (stateList) => {
    if(map.current === null) { return; }

    if(!stateList.hasOwnProperty('states')) { 
      let layers = Object.keys(stateList)
        .filter(key => key !== "name")
        .map(key => ({ key, ...stateList[key] }));
      
      let filterExpression = ["case"]

      layers.forEach((layer, index) => {
        filterExpression.push(["in", ["get", "STUSPS"], ["literal", layer.states]])
        filterExpression.push(layer.color)
      })
      filterExpression.push(config.na_option.color)

      map.current.setPaintProperty("states-fill-lyr", "fill-color", filterExpression)

      let patternExpression = ["case"]

      for (const layer of layers) {
        if(layer.hasOwnProperty("pattern")) {

          let patternName = [layer.pattern.colors[0].replace("#", ""), layer.pattern.colors[1].replace("#", "")].join("_")

          if(!map.current.hasImage(patternName)) {            
            await createPattern(patternName, layer.pattern.colors[0], layer.pattern.colors[1])
          }

          patternExpression.push(["in", ["get", "STUSPS"], ["literal", layer.states]])
          patternExpression.push(patternName)
        }
      }

      patternExpression.push("transparent")

      map.current.setPaintProperty("states-pattern-lyr", "fill-pattern", patternExpression)

      return 

    }

    let condition = ["in", ["get", "STUSPS"], ["literal", stateList.states]]

    map.current.setPaintProperty("states-fill-lyr", "fill-color", [
      "case",
      condition,
      stateList.color,
      config.na_option.color
    ])
  }

  const drawStripePolygon = (ctx, points, color) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  const createPattern = (imageName, bgColor, lineColor) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
  
      if(bgColor === null && lineColor === null) {
      
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, 100, 100);      
      
        const img = new Image();

        img.src = canvas.toDataURL();    
  
        img.onload = () => {
          if(map.current.hasImage(imageName)) {
            reject(false)
          }
          else{
            map.current.addImage(imageName, img, { pixelRatio: 2 });
            resolve(img);
          }
        }       
      }

      if(bgColor !== null && lineColor === null) {
      
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 100, 100);      
      
        const img = new Image();

        img.src = canvas.toDataURL();    
  
        img.onload = () => {
          if(map.current.hasImage(imageName)) {
            reject(false)
          } 
          else{         
            map.current.addImage(imageName, img, { pixelRatio: 2 });
            resolve(img);
          }
        } 
      }    

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 100, 100);
  
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;

      drawStripePolygon(ctx, [[0, 0],[25, 0],[0, 25],[0, 0]], lineColor)
      drawStripePolygon(ctx, [[50, 0],[0, 50],[0, 75],[75, 0], [50, 0]], lineColor)
      drawStripePolygon(ctx, [[100, 0],[0, 100],[25, 100],[100, 25], [100, 0]], lineColor)
      drawStripePolygon(ctx, [[50, 100],[100, 50],[100, 75],[75, 100], [50, 100]], lineColor)
      
      const img = new Image();
      img.src = canvas.toDataURL();    

      img.onload = () => {
        if(map.current.hasImage(imageName)) {
          reject(false)
        }
        else
        {       
          map.current.addImage(imageName, img, { pixelRatio: 2 });
          resolve(img);
        }
      } 
    })
  }  

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'Empty Style',
        sources: {},
        layers: [],
      },
      center: [-100, 40],
      zoom: 3.2
    }); 

    map.current.on("load", async () => {

      // Transparent background
      const transparentPattern = await createPattern("transparent", null, null);

      // Fit bounds to USA extent
      const llb = turf.bbox(usaStatesGeoJson)
      const sw = new maplibregl.LngLat(llb[0], llb[1]); // Southwest corner
      const ne = new maplibregl.LngLat(llb[2], llb[3]); // Northeast corner
      const bounds = new maplibregl.LngLatBounds(sw, ne);

      setInitialBounds(bounds)

      map.current.addSource("states-src", {"type": "geojson", "data": usaStatesGeoJson})

      map.current.addLayer({
        "id": "states-pattern-lyr",
        "type": "fill",
        "source": "states-src",
        "paint": {
          "fill-color": "rgba(0,0,0,0)"
        }
      })

      map.current.addLayer({
        "id": "states-fill-lyr",
        "type": "fill",
        "source": "states-src",
        "paint": {
          "fill-color": "rgba(0,0,0,0)"
        }
      })
      map.current.addLayer({
        "id": "states-line-lyr",
        "type": "line",
        "source": "states-src",
        "paint": {
          "line-color": "#000",
          "line-width": 1
        }
      }) 
      
      map.current.fitBounds(bounds, {"padding": {top: 30, bottom:30, left: 30, right: 30}})
      //map.current.setMaxBounds(bounds)
    })
    
    return () => map.current.remove();
  }, []);    
  
  useEffect(() => {
    if(selectedMap === null) { return; }
    updateMapContent(config.maps[selectedMap])
  }, [selectedMap])

  return (
    <div ref={mapContainer} className="fixed left-0 md:left-1/4 top-0 md:top-0 bottom-[57px] md:bottom-0 right-0" />
  )
}

export default Map;