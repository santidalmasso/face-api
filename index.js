const $imageUpload = document.getElementById('imageUpload')

const $button = document.getElementById('hideButton')


Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
])
  .then(start())

  
async function start(){
  let image, canvas;

  $imageUpload.addEventListener('change', handleChange)
  
   
  async function handleChange(){
    if (image) image.remove()
    if (canvas) canvas.remove()
    
    image = await faceapi.bufferToImage($imageUpload.files[0])
    
    const container = document.getElementById('container')
    container.append(image)
    
    const imageSize = {
      width: image.width,
      height: image.height
    }
    
    const labeledFaceDescriptors = await loadPlayerFaces()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, .6)

    canvas = faceapi.createCanvasFromMedia(image)
    addToggleEventCanvas(canvas);

    container.append(canvas)
    faceapi.matchDimensions(canvas, imageSize)
    
    const facesDetections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    
    const resizedFacesDetections = faceapi.resizeResults(facesDetections, imageSize)
    console.log(resizedFacesDetections)
    const results = resizedFacesDetections.map(face => faceMatcher.findBestMatch(face.descriptor))
    
    console.log(results)
    
    results.forEach( (result, i) => {
      const box = resizedFacesDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString(), boxColor: '#0057ad' })
      drawBox.draw(canvas)
    })
  }


  function loadPlayerFaces() {
    const players = ['Armani', 'Banega', 'Di Maria', 'Mascherano', 'Mercado', 'Messi', 'Otamendi', 'Pavon', 'Rojo', 'Tagliafico']
    
    return Promise.all(
      players.map(async player => {
        const descriptions = []

        for (let i = 1; i<=2; i++) {
          const image = await faceapi.fetchImage(`./players/${player}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
          //console.log(detections)
          descriptions.push(detections.descriptor)
        }

        return new faceapi.LabeledFaceDescriptors(player, descriptions)
      })
    )
  }
  
  
  function addToggleEventCanvas(canvas){
    $button.classList.remove('hide')
    $button.addEventListener( 'click' , () => {
      if(canvas.classList.contains('hide')){
        canvas.classList.remove('hide')
      }else{
        canvas.classList.add('hide')
      }
    })
  }
}
