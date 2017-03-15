import Chunk from 'chunk'

class Composite {
  constructor(canvas) {
    this.center = [0, 0]
    this.zoom = 1
    this.canvas = canvas
  }

  chunk(count) {
    return Array(count).fill(0).map((_,i)=> new Chunk({
        compositeDimensions: [this.canvas.width, this.canvas.height],
        offset: i,
        center: this.center,
        zoom: this.zoom,
        count: count
      })
    )
  }

  setChunk(chunk, data) {
    const context = this.canvas.getContext('2d'),
          image   = context.createImageData(chunk.width(), chunk.height())

    for (let i = 0; i < data.length; i++)
      image.data[i] = data[i]

    context.putImageData(image,chunk.offsetX(),chunk.offsetY())
  }

  draw(workers) {
    const start = performance.now()
    let pending = 0
    this.chunk(workers.length).forEach((chunk, i)=> {
      const worker = workers[i % workers.length]

      worker.onmessage = ({data: {chunk,data}})=> {
        pending -= 1
        if(pending == 0)
          console.log((performance.now() - start) + "ms")
        this.setChunk(new Chunk(chunk), data)
      }

      pending += 1
      worker.postMessage(chunk)
    })
  }
}

export default Composite