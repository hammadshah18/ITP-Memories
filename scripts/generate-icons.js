const sharp = require('sharp')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

sizes.forEach((size) => {
  sharp('public/icons/itp-logo.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
})
