import * as THREE from 'three'
import gsap from 'gsap'
import { Stage } from './stage'
import { Block } from './block'
import { getCurrentUser } from '../utils/globalUser'
import { saveScore } from '../db/scores'
import audioManager from '../audio/AudioManager'

export class Game {
  constructor() {
    this.STATES = {
      LOADING: 'loading',
      PLAYING: 'playing',
      READY: 'ready',
      ENDED: 'ended',
      RESETTING: 'resetting',
      PAUSED: 'paused', // Add a new paused state for tab switching
    }
    this.blocks = []
    this.state = this.STATES.LOADING
    this.previousState = null // Track previous state for resuming after tab switch
    this.stage = new Stage()
    this.mainContainer = document.getElementById('container')
    this.scoreContainer = document.getElementById('score')
    this.startButton = document.getElementById('start-button')
    this.instructions = document.getElementById('instructions')
    this.scoreContainer.innerHTML = '0'

    // Add multiplier tracking
    this.perfectPlacements = 0
    this.multiplier = 1
    this.score = 0 // Track actual score
    this.multiplierContainer = document.createElement('div')
    this.multiplierContainer.className = 'multiplier-display'
    this.multiplierContainer.style.display = 'none'
    this.mainContainer.appendChild(this.multiplierContainer)

    // Create overlay
    this.overlay = document.createElement('div')
    this.overlay.className = 'game-overlay'
    this.mainContainer.appendChild(this.overlay)

    this.newBlocks = new THREE.Group()
    this.placedBlocks = new THREE.Group()
    this.choppedBlocks = new THREE.Group()
    this.stage.add(this.newBlocks)
    this.stage.add(this.placedBlocks)
    this.stage.add(this.choppedBlocks)

    // Create end game buttons container
    this.endGameButtonsContainer = document.createElement('div')
    this.endGameButtonsContainer.className = 'end-game-buttons'
    this.endGameButtonsContainer.style.display = 'none'
    this.mainContainer.appendChild(this.endGameButtonsContainer)

    // Create Play Again button
    this.playAgainButton = document.createElement('button')
    this.playAgainButton.textContent = 'Play Again'
    this.playAgainButton.className = 'end-game-button'
    this.playAgainButton.addEventListener('click', () => {
      audioManager.playSoundEffect('menuClick')
      this.restartGame()
    })
    this.endGameButtonsContainer.appendChild(this.playAgainButton)
    this.menuButton = document.createElement('button')
    this.menuButton.textContent = 'Menu'
    this.menuButton.className = 'end-game-button'
    this.menuButton.addEventListener('click', () => {
      audioManager.playSoundEffect('menuClick')
      this.cleanupGame()
      if (window.menu) {
        window.menu.showMenu()
      }
    })
    this.endGameButtonsContainer.appendChild(this.menuButton)

    // Add some CSS for the buttons
    const style = document.createElement('style')
    style.textContent = `
            .end-game-buttons {
                position: absolute;
                bottom: 30%;
                width: 100%;
                display: flex;
                justify-content: center;
                gap: 20px;
                z-index: 100;
            }
            .end-game-button {
                padding: 12px 20px;
                background-color: #333344;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: "Comfortaa", cursive;
            }
            .end-game-button:hover {
                background-color: #444455;
                transform: scale(1.05);
            }
        `
    document.head.appendChild(style)

    // Track if we're in a tab switch to prevent menu showing
    this.inTabSwitch = false

    // Set up flag to prevent menu from showing after tab switch
    window.preventMenuAfterTabSwitch = false

    // Add the visibility change listener to handle tab switching
    this.handleVisibilityChangeBound = this.handleVisibilityChange.bind(this)
    document.addEventListener('visibilitychange', this.handleVisibilityChangeBound)

    this.addBlock()
    this.tick()
    this.updateState(this.STATES.READY)

    document.addEventListener('keydown', (e) => {
      if (e.keyCode == 32) this.onAction()
    })

    // Only handle clicks on the game area, not globally
    this.mainContainer.addEventListener('click', (e) => {
      // If overlay is visible, don't handle any clicks
      if (this.overlay.classList.contains('visible')) {
        return
      }

      // Check if any menu or panel is visible
      if (window.menu) {
        const isPanelVisible =
          window.menu.instructionsPanel?.panel.classList.contains('visible') ||
          window.menu.shopPanel?.panel.classList.contains('visible') ||
          window.menu.leaderboardPanel?.panel.classList.contains('visible') ||
          window.menu.profilePanel?.panel.classList.contains('visible') ||
          window.menu.settingsPanel?.panel.classList.contains('visible')

        // Only handle clicks if both menu and panels are hidden
        if (!window.menu.isVisible && !isPanelVisible) {
          this.onAction()
        }
      } else {
        this.onAction()
      }
    })
  }

  // Handle tab switching
  handleVisibilityChange() {
    console.log('Visibility changed. Hidden:', document.hidden)

    if (document.hidden) {
      // Tab is hidden, pause the game if it was playing
      if (this.state === this.STATES.PLAYING) {
        console.log('GAME WAS PLAYING, PAUSING')
        this.inTabSwitch = true
        window.preventMenuAfterTabSwitch = true // Set global flag
        this.pauseGame()
      }
    } else {
      // Tab is visible again, resume the game if it was paused
      if (this.state === this.STATES.PAUSED && this.previousState === this.STATES.PLAYING && this.inTabSwitch) {
        console.log('GAME WAS PAUSED, RESUMING')

        // Ensure the menu is hidden if it somehow became visible
        if (window.menu && window.menu.isVisible) {
          console.log('FORCING MENU TO HIDE')
          window.menu.hideMenu()
        }

        // Resume with a slight delay to ensure the DOM is ready
        setTimeout(() => {
          this.resumeGame()
          this.inTabSwitch = false

          // Clear the global flag after a short delay
          setTimeout(() => {
            window.preventMenuAfterTabSwitch = false
          }, 500)
        }, 100)
      }
    }
  }

  pauseGame() {
    console.log('Pausing game')
    this.previousState = this.state
    this.updateState(this.STATES.PAUSED)
  }

  resumeGame() {
    console.log('Resuming game')

    if (this.previousState === this.STATES.PLAYING) {
      this.updateState(this.STATES.PLAYING)
    } else {
      // If we don't know the previous state, go to ready
      this.updateState(this.STATES.READY)
    }
  }

  updateState(newState) {
    console.log(`Game state changing from ${this.state} to ${newState}`)

    for (let key in this.STATES) this.mainContainer.classList.remove(this.STATES[key])
    this.mainContainer.classList.add(newState)

    // Store the previous state before changing to new state
    if (this.state !== newState) {
      this.previousState = this.state
      this.state = newState
    }

    // Play audio based on state changes
    if (newState === this.STATES.READY) {
      // When the game first loads or is ready to play
      audioManager.playMusic('menu')
    } else if (newState === this.STATES.PLAYING) {
      // When gameplay starts
      audioManager.playMusic('game')
    } else if (newState === this.STATES.ENDED) {
      // Show end game buttons when game ends
      this.endGameButtonsContainer.style.display = 'flex'

      // Switch back to menu music after a delay
      setTimeout(() => {
        audioManager.playMusic('menu')
      }, 2000)
    }
    // Don't change the audio when pausing/resuming - just keep current audio state

    // Update overlay visibility when state changes
    this.updateOverlayVisibility()

    switch (newState) {
      case this.STATES.LOADING:
        this.startButton.style.display = 'none'
        this.instructions.style.display = 'none'
        break
      case this.STATES.READY:
        this.startButton.style.display = 'block'
        this.instructions.style.display = 'block'
        break
      case this.STATES.PLAYING:
        this.startButton.style.display = 'none'
        this.instructions.style.display = 'none'
        break
      case this.STATES.ENDED:
        this.endGameButtonsContainer.style.display = 'flex'
        break
      case this.STATES.RESETTING:
        this.endGameButtonsContainer.style.display = 'none'
        break
    }
  }

  onAction() {
    // Check if any menu or panel is visible
    if (window.menu) {
      const isPanelVisible =
        window.menu.instructionsPanel?.panel.classList.contains('visible') ||
        window.menu.shopPanel?.panel.classList.contains('visible') ||
        window.menu.leaderboardPanel?.panel.classList.contains('visible') ||
        window.menu.profilePanel?.panel.classList.contains('visible') ||
        window.menu.settingsPanel?.panel.classList.contains('visible')

      // Don't handle actions if menu or any panel is visible
      if (window.menu.isVisible || isPanelVisible) {
        return
      }
    }

    // Don't handle actions if auth panel is visible
    const authPanel = document.querySelector('.auth-panel')
    if (authPanel && authPanel.style.display === 'flex') {
      return
    }

    switch (this.state) {
      case this.STATES.READY:
        this.startGame()
        break
      case this.STATES.PLAYING:
        // Always allow clicks in playing state
        this.placeBlock()
        break
      case this.STATES.ENDED:
        this.restartGame()
        break
      case this.STATES.PAUSED:
        // Resume if paused
        this.resumeGame()
        break
    }
  }

  startGame() {
    // Only start if we're not already playing and the menu is not visible
    if (this.state != this.STATES.PLAYING && (!window.menu || !window.menu.isVisible)) {
      this.scoreContainer.innerHTML = '0'
      this.updateState(this.STATES.PLAYING)
      this.addBlock()

      // Play game start sound
      audioManager.playSoundEffect('gameStart')
    }
  }

  restartGame() {
    // Hide end game buttons
    this.endGameButtonsContainer.style.display = 'none'

    // Reset multiplier and score
    this.perfectPlacements = 0
    this.multiplier = 1
    this.score = 0
    this.multiplierContainer.style.display = 'none'
    this.scoreContainer.innerHTML = '0'

    this.updateState(this.STATES.RESETTING)
    let oldBlocks = this.placedBlocks.children
    let removeSpeed = 0.2
    let delayAmount = 0.02
    for (let i = 0; i < oldBlocks.length; i++) {
      gsap.to(oldBlocks[i].scale, {
        duration: removeSpeed,
        x: 0,
        y: 0,
        z: 0,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: 'power1.easeIn',
        onComplete: () => this.placedBlocks.remove(oldBlocks[i]),
      })
      gsap.to(oldBlocks[i].rotation, {
        duration: removeSpeed,
        y: 0.5,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: 'power1.easeIn',
      })
    }
    let cameraMoveSpeed = removeSpeed * 2 + oldBlocks.length * delayAmount
    this.stage.setCamera(2, cameraMoveSpeed)
    let countdown = { value: this.blocks.length - 1 }
    gsap.to(countdown, cameraMoveSpeed, {
      value: 0,
      onUpdate: () => {
        this.scoreContainer.innerHTML = String(Math.round(countdown.value))
      },
    })
    this.blocks = this.blocks.slice(0, 1)
    setTimeout(() => {
      this.startGame()
    }, cameraMoveSpeed * 1000)
  }

  placeBlock() {
    let currentBlock = this.blocks[this.blocks.length - 1]
    let newBlocks = currentBlock.place()
    this.newBlocks.remove(currentBlock.mesh)

    // Handle multiplier logic
    if (newBlocks.bonus) {
      this.perfectPlacements++
      // Update multiplier based on perfect placements
      if (this.perfectPlacements >= 10) {
        this.multiplier = 5
      } else if (this.perfectPlacements >= 5) {
        this.multiplier = 3
      } else if (this.perfectPlacements >= 2) {
        this.multiplier = 2
      }
      // Add points with multiplier
      this.score += this.multiplier
      // Show multiplier display
      this.multiplierContainer.style.display = 'block'
      this.multiplierContainer.textContent = `${this.multiplier}x`
      // Play perfect placement sound
      audioManager.playSoundEffect('blockPerfect')

      // Create perfect text effect
      this.createPerfectText()

      // Hide multiplier display after animation
      setTimeout(() => {
        this.multiplierContainer.style.display = 'none'
      }, 1000) // Hide after 1 second
    } else {
      // Reset multiplier and perfect placements on non-perfect placement
      this.perfectPlacements = 0
      this.multiplier = 1
      this.multiplierContainer.style.display = 'none'
      // Add regular point
      this.score += 1
      // Play regular placement sound
      audioManager.playSoundEffect('blockPlace')
    }

    // Update score display
    this.scoreContainer.innerHTML = String(this.score)

    if (newBlocks.placed) this.placedBlocks.add(newBlocks.placed)
    if (newBlocks.chopped) {
      this.choppedBlocks.add(newBlocks.chopped)
      let positionParams = {
        duration: 1,
        y: '-=30',
        ease: 'power1.easeIn',
        onComplete: () => this.choppedBlocks.remove(newBlocks.chopped),
      }
      let rotateRandomness = 10
      let rotationParams = {
        delay: 0.05,
        x: newBlocks.plane == 'z' ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
        z: newBlocks.plane == 'x' ? Math.random() * rotateRandomness - rotateRandomness / 2 : 0.1,
        y: Math.random() * 0.1,
      }
      if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
        positionParams[newBlocks.plane] = '+=' + 40 * Math.abs(newBlocks.direction)
      } else {
        positionParams[newBlocks.plane] = '-=' + 40 * Math.abs(newBlocks.direction)
      }
      gsap.to(newBlocks.chopped.position, positionParams)
      gsap.to(newBlocks.chopped.rotation, {
        duration: 1,
        ...rotationParams,
      })
    }
    this.addBlock()
  }

  createPerfectText() {
    // Create text element
    const text = document.createElement('div')
    text.className = 'perfect-text'
    text.textContent = 'PERFECT!'

    // Generate random dark color
    const hue = Math.random() * 360
    const saturation = 70 + Math.random() * 30 // 70-100%
    const lightness = 30 + Math.random() * 20 // 30-50%
    text.style.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`

    // Position closer to the block
    const gameHeight = window.innerHeight
    const blockBottom = this.blocks[this.blocks.length - 1].mesh.position.y

    // Convert 3D position to screen position (approximate)
    const blockScreenY = (blockBottom / gameHeight) * window.innerHeight
    const targetY = blockScreenY + gameHeight * 0.3 // 30% of screen height below block

    // Random horizontal position
    const horizontalPosition = 40 + Math.random() * 20 // 40-60% from left
    text.style.left = `${horizontalPosition}%`
    text.style.top = `${targetY}px`

    // Add to container and remove after animation
    this.mainContainer.appendChild(text)
    setTimeout(() => {
      text.remove()
    }, 1500)
  }

  addBlock() {
    let lastBlock = this.blocks[this.blocks.length - 1]
    if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {
      return this.endGame()
    }
    let newKidOnTheBlock = new Block(lastBlock)
    this.newBlocks.add(newKidOnTheBlock.mesh)
    this.blocks.push(newKidOnTheBlock)
    this.stage.setCamera(this.blocks.length * 2)
    if (this.blocks.length >= 5) this.instructions.classList.add('hide')
  }

  endGame() {
    this.updateState(this.STATES.ENDED)

    // Play game over sound
    audioManager.playSoundEffect('gameOver')

    // Save score if user is logged in
    const user = getCurrentUser()
    const finalScore = parseInt(this.scoreContainer.innerHTML)

    if (user && finalScore > 0) {
      saveScore({ userId: user.id, score: finalScore })
        .then(() => console.log('Score saved successfully'))
        .catch((error) => console.error('Error saving score:', error))
    }
  }

  // Add a new method to clean up the game when going back to menu
  cleanupGame() {
    // Hide end game buttons
    this.endGameButtonsContainer.style.display = 'none'

    // Clear all blocks
    while (this.placedBlocks.children.length > 0) {
      this.placedBlocks.remove(this.placedBlocks.children[0])
    }

    while (this.choppedBlocks.children.length > 0) {
      this.choppedBlocks.remove(this.choppedBlocks.children[0])
    }

    while (this.newBlocks.children.length > 0) {
      this.newBlocks.remove(this.newBlocks.children[0])
    }

    // Reset game state
    this.blocks = []
    this.state = this.STATES.READY
    this.previousState = null
    this.inTabSwitch = false
    this.scoreContainer.innerHTML = '0'

    // Add the first block back
    this.addBlock()
  }

  tick() {
    // Only update blocks if the game is actively playing
    if (this.state === this.STATES.PLAYING) {
      try {
        this.blocks[this.blocks.length - 1].tick()
      } catch (e) {
        console.error('Error in tick:', e)
        // Don't let the game crash if there's an error
      }
    }

    // Always render the scene
    this.stage.render()

    // Continue the animation loop
    requestAnimationFrame(() => {
      this.tick()
    })
  }

  // Clean up event listeners when game is destroyed
  destroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChangeBound)
    // Additional cleanup if needed
  }

  // Add method to update overlay visibility
  updateOverlayVisibility() {
    if (window.menu) {
      const isPanelVisible =
        window.menu.instructionsPanel?.panel.classList.contains('visible') ||
        window.menu.shopPanel?.panel.classList.contains('visible') ||
        window.menu.leaderboardPanel?.panel.classList.contains('visible') ||
        window.menu.profilePanel?.panel.classList.contains('visible') ||
        window.menu.settingsPanel?.panel.classList.contains('visible')

      this.overlay.classList.toggle('visible', window.menu.isVisible || isPanelVisible)
    } else {
      this.overlay.classList.remove('visible')
    }
  }
}
