interface Area {
  width: number
  height: number
  x: number
  y: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = `crop-${Date.now()}.jpg`
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to create image canvas context')
  }

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  })

  if (!blob) {
    throw new Error('Failed to export cropped image')
  }

  return new File([blob], fileName, { type: 'image/jpeg' })
}
