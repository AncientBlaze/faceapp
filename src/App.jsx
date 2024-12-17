import { useRef, useEffect, useState } from 'react'
import './App.css'
import * as faceapi from 'face-api.js'

function App() {
  const videoRef = useRef(null)
  const [detections, setDetections] = useState([])

  useEffect(() => {
    const video = videoRef.current
    video.width = 640
    video.height = 480
    navigator?.mediaDevices?.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream
      })
      .catch(error => console.error('Error accessing camera:', error))

    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
    }

    loadModels()

    const interval = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        setDetections(detections)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="App">
      <video ref={videoRef} autoPlay />
      {detections.map((detection, index) => (
        <div key={index} className="bounding-box" style={{
          position: 'absolute',
          top: detection.box.top,
          left: detection.box.left,
          width: detection.box.width,
          height: detection.box.height,
          border: '1px solid red',
        }} />
      ))}
    </div>
  )
}

export default App
