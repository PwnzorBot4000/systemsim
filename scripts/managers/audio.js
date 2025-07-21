// Initialize audio manager
export class AudioManager {
  audioContext = null;
  game;
  soundEffects = {};

  constructor(game) {
    this.game = game;
  }

  // Initialize audio system on user interaction
  init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Load a sound effect
  async load(name) {
    if (this.soundEffects[name]) return this.soundEffects[name];

    const response = await fetch(`assets/sfx/${name}`);
    const buffer = await response.arrayBuffer();
    const audioData = await this.audioContext.decodeAudioData(buffer);
    this.soundEffects[name] = audioData;

    return audioData;
  }

  // Play a sound effect
  play(name) {
    if (!this.soundEffects[name]) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.soundEffects[name];
    source.connect(this.audioContext.destination);
    source.start(0);

    // Optional: Add spatial audio effects
    const gainNode = this.audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    return source;
  }
}