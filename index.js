const $imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
])
  .then(start())

  
function start(){
  
  $imageUpload.addEventListener('change', handleChange)
  
  
  
  async function handleChange(){
    const image = await faceapi.bufferToImage($imageUpload.files[0])
    
    const container = document.getElementById('container')
    container.append(image)
    
    const imageSize = {
      width: image.width,
      height: image.height
    }
    
    const canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    faceapi.matchDimensions(canvas, imageSize)
    
    const facesDetections = await faceapi.detectAllFaces(image).withFaceLandmarks()
    
    const resizedFacesDetections = faceapi.resizeResults(facesDetections, imageSize)
    resizedFacesDetections.forEach( face => {
      const box = face.detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face'})
      drawBox.draw(canvas)
    })
  }

}
