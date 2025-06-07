import * as THREE from 'three'

export class Block {
  constructor(block) {
    // set size and position
    this.STATES = { ACTIVE: 'active', STOPPED: 'stopped', MISSED: 'missed' }
    this.MOVE_AMOUNT = 12
    this.dimension = { width: 0, height: 0, depth: 0 }
    this.position = { x: 0, y: 0, z: 0 }
    this.targetBlock = block
    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1
    this.workingPlane = this.index % 2 ? 'x' : 'z'
    this.workingDimension = this.index % 2 ? 'width' : 'depth'
    // set the dimensions from the target block, or defaults.
    this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10
    this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2
    this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10
    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0
    this.position.y = this.dimension.height * this.index
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0
    this.colorOffset = this.targetBlock ? this.targetBlock.colorOffset : Math.round(Math.random() * 100)
    // set color
    if (!this.targetBlock) {
      this.color = 0x333344
    } else {
      let offset = this.index + this.colorOffset
      var r = Math.sin(0.3 * offset) * 55 + 200
      var g = Math.sin(0.3 * offset + 2) * 55 + 200
      var b = Math.sin(0.3 * offset + 4) * 55 + 200
      this.color = new THREE.Color(r / 255, g / 255, b / 255)
    }
    // state
    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED    // SPEED MODIFICATION: Faster initial speed and more gradual increase
    this.speed = -0.12 - this.index * 0.004

    // Adjust the maximum speed limit (make it faster)
    if (this.speed < -3.5) this.speed = -3.5

    this.direction = this.speed

    // create block
    let geometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth)
    geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2))
    this.material = new THREE.MeshPhongMaterial({
      color: this.color,
      flatShading: true,
    })
    this.mesh = new THREE.Mesh(geometry, this.material)
    this.mesh.position.set(this.position.x, this.position.y + (this.state == this.STATES.ACTIVE ? 0 : 0), this.position.z)
    if (this.state == this.STATES.ACTIVE) {
      this.position[this.workingPlane] = Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT
    }
  }
  reverseDirection() {
    this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed)
  }
  place() {
    this.state = this.STATES.STOPPED
    let overlap = this.targetBlock.dimension[this.workingDimension] - Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane])
    let blocksToReturn = {
      plane: this.workingPlane,
      direction: this.direction,
    }    // Add near-perfect placement adjustment (made more strict)
    const NEAR_PERFECT_THRESHOLD = 0.2 // 0.2 units threshold for near-perfect (reduced from 0.5)
    const distanceFromPerfect = Math.abs(this.position[this.workingPlane] - this.targetBlock.position[this.workingPlane])

    // Calculate coverage percentage (made more strict)
    const coveragePercentage = (overlap / this.dimension[this.workingDimension]) * 100

    if (distanceFromPerfect <= NEAR_PERFECT_THRESHOLD || coveragePercentage >= 90) {
      // Adjust position to be perfect
      this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane]
      overlap = this.dimension[this.workingDimension]
      blocksToReturn.bonus = true
      this.position.x = this.targetBlock.position.x
      this.position.z = this.targetBlock.position.z
      this.dimension.width = this.targetBlock.dimension.width
      this.dimension.depth = this.targetBlock.dimension.depth
    } else if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension]
      blocksToReturn.bonus = true
      this.position.x = this.targetBlock.position.x
      this.position.z = this.targetBlock.position.z
      this.dimension.width = this.targetBlock.dimension.width
      this.dimension.depth = this.targetBlock.dimension.depth
    }
    if (overlap > 0) {
      let choppedDimensions = { width: this.dimension.width, height: this.dimension.height, depth: this.dimension.depth }
      choppedDimensions[this.workingDimension] -= overlap
      this.dimension[this.workingDimension] = overlap
      let placedGeometry = new THREE.BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth)
      placedGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(this.dimension.width / 2, this.dimension.height / 2, this.dimension.depth / 2))
      let placedMesh = new THREE.Mesh(placedGeometry, this.material)
      let choppedGeometry = new THREE.BoxGeometry(choppedDimensions.width, choppedDimensions.height, choppedDimensions.depth)
      choppedGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(choppedDimensions.width / 2, choppedDimensions.height / 2, choppedDimensions.depth / 2))
      let choppedMesh = new THREE.Mesh(choppedGeometry, this.material)
      let choppedPosition = {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      }
      if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {
        this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane]
      } else {
        choppedPosition[this.workingPlane] += overlap
      }
      placedMesh.position.set(this.position.x, this.position.y, this.position.z)
      choppedMesh.position.set(choppedPosition.x, choppedPosition.y, choppedPosition.z)
      blocksToReturn.placed = placedMesh
      if (!blocksToReturn.bonus) blocksToReturn.chopped = choppedMesh
    } else {
      this.state = this.STATES.MISSED
    }
    this.dimension[this.workingDimension] = overlap
    return blocksToReturn
  }
  tick() {
    if (this.state == this.STATES.ACTIVE) {
      let value = this.position[this.workingPlane]
      if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) this.reverseDirection()
      this.position[this.workingPlane] += this.direction
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane]
    }
  }
}
