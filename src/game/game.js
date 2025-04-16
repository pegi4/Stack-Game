import * as THREE from 'three';
import gsap from 'gsap';
import { Stage } from './stage';
import { Block } from './block';

export class Game {
    constructor() {
        this.STATES = {
            'LOADING': 'loading',
            'PLAYING': 'playing',
            'READY': 'ready',
            'ENDED': 'ended',
            'RESETTING': 'resetting'
        };
        this.blocks = [];
        this.state = this.STATES.LOADING;
        this.stage = new Stage();
        this.mainContainer = document.getElementById('container');
        this.scoreContainer = document.getElementById('score');
        this.startButton = document.getElementById('start-button');
        this.instructions = document.getElementById('instructions');
        this.scoreContainer.innerHTML = '0';
        this.newBlocks = new THREE.Group();
        this.placedBlocks = new THREE.Group();
        this.choppedBlocks = new THREE.Group();
        this.stage.add(this.newBlocks);
        this.stage.add(this.placedBlocks);
        this.stage.add(this.choppedBlocks);
        this.addBlock();
        this.tick();
        this.updateState(this.STATES.READY);
        document.addEventListener('keydown', e => {
            if (e.keyCode == 32)
                this.onAction();
        });
        document.addEventListener('click', e => {
            this.onAction();
        });
        document.addEventListener('touchstart', e => {
            e.preventDefault();
            // this.onAction();
            // this triggers after click on android so you
            // insta-lose, will figure it out later.
        });
    }
    updateState(newState) {
        for (let key in this.STATES)
            this.mainContainer.classList.remove(this.STATES[key]);
        this.mainContainer.classList.add(newState);
        this.state = newState;
    }
    onAction() {
        switch (this.state) {
            case this.STATES.READY:
                this.startGame();
                break;
            case this.STATES.PLAYING:
                this.placeBlock();
                break;
            case this.STATES.ENDED:
                this.restartGame();
                break;
        }
    }
    startGame() {
        if (this.state != this.STATES.PLAYING) {
            this.scoreContainer.innerHTML = '0';
            this.updateState(this.STATES.PLAYING);
            this.addBlock();
        }
    }
    restartGame() {
        this.updateState(this.STATES.RESETTING);
        let oldBlocks = this.placedBlocks.children;
        let removeSpeed = 0.2;
        let delayAmount = 0.02;
        for (let i = 0; i < oldBlocks.length; i++) {
            gsap.to(oldBlocks[i].scale, {
                duration: removeSpeed,
                x: 0,
                y: 0,
                z: 0,
                delay: (oldBlocks.length - i) * delayAmount,
                ease: "power1.easeIn",
                onComplete: () => this.placedBlocks.remove(oldBlocks[i])
            });
            gsap.to(oldBlocks[i].rotation, {
                duration: removeSpeed,
                y: 0.5,
                delay: (oldBlocks.length - i) * delayAmount,
                ease: "power1.easeIn"
            });
        }
        let cameraMoveSpeed = removeSpeed * 2 + (oldBlocks.length * delayAmount);
        this.stage.setCamera(2, cameraMoveSpeed);
        let countdown = { value: this.blocks.length - 1 };
        gsap.to(countdown, cameraMoveSpeed, { value: 0, onUpdate: () => { this.scoreContainer.innerHTML = String(Math.round(countdown.value)); } });
        this.blocks = this.blocks.slice(0, 1);
        setTimeout(() => {
            this.startGame();
        }, cameraMoveSpeed * 1000);
    }
    placeBlock() {
        let currentBlock = this.blocks[this.blocks.length - 1];
        let newBlocks = currentBlock.place();
        this.newBlocks.remove(currentBlock.mesh);
        if (newBlocks.placed)
            this.placedBlocks.add(newBlocks.placed);
        if (newBlocks.chopped) {
            this.choppedBlocks.add(newBlocks.chopped);
            let positionParams = {
                duration: 1,
                y: '-=30',
                ease: "power1.easeIn",
                onComplete: () => this.choppedBlocks.remove(newBlocks.chopped)
            };
            let rotateRandomness = 10;
            let rotationParams = {
                delay: 0.05,
                x: newBlocks.plane == 'z' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                z: newBlocks.plane == 'x' ? ((Math.random() * rotateRandomness) - (rotateRandomness / 2)) : 0.1,
                y: Math.random() * 0.1,
            };
            if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
                positionParams[newBlocks.plane] = '+=' + (40 * Math.abs(newBlocks.direction));
            }
            else {
                positionParams[newBlocks.plane] = '-=' + (40 * Math.abs(newBlocks.direction));
            }
            gsap.to(newBlocks.chopped.position, positionParams);
            gsap.to(newBlocks.chopped.rotation, {
                duration: 1,
                ...rotationParams
            });
        }
        this.addBlock();
    }
    addBlock() {
        let lastBlock = this.blocks[this.blocks.length - 1];
        if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {
            return this.endGame();
        }
        this.scoreContainer.innerHTML = String(this.blocks.length - 1);
        let newKidOnTheBlock = new Block(lastBlock);
        this.newBlocks.add(newKidOnTheBlock.mesh);
        this.blocks.push(newKidOnTheBlock);
        this.stage.setCamera(this.blocks.length * 2);
        if (this.blocks.length >= 5)
            this.instructions.classList.add('hide');
    }
    endGame() {
        this.updateState(this.STATES.ENDED);
        
        // Show the menu when the game ends
        if (window.menu) {
            setTimeout(() => {
                window.menu.showMenu();
            }, 1000);
        }
    }
    tick() {
        this.blocks[this.blocks.length - 1].tick();
        this.stage.render();
        requestAnimationFrame(() => { this.tick(); });
    }
}