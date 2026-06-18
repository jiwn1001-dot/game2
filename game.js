// =============================================================================
// FNAF 1 REMAKE - Complete Game Logic
// =============================================================================

// ===== CONSTANTS =====
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const HOUR_DURATION = 89; // seconds per in-game hour (~8분25초 / 6시간)
const AI_INTERVAL = 4.97; // seconds between AI movement checks (원작 고증)
const FOXY_CHECK_INTERVAL = 5.01; // Foxy check interval

// Power drain rates per night (% per second at usage level 1)
// 원작: Night1 약 0.8%/sec at usage 1
// 원작 고증 전력 소모량
// 본 게임의 하룻밤(534초)은 원작(535초)과 거의 동일하므로, 
// 1000포인트 시스템(1초당 1포인트=0.1%)을 스케일링 없이 원작 생수치 그대로 적용합니다.
const BASE_POWER_DRAIN = 0.1; // 1초당 0.1% 소모 (기본 선풍기)
const PASSIVE_DRAIN = {
  1: 0,
  2: 0.1 / 6, // 원작: 6초당 0.1% 추가 소모
  3: 0.1 / 5, // 원작: 5초당 0.1% 추가 소모
  4: 0.1 / 4, // 원작: 4초당 0.1% 추가 소모
  5: 0.1 / 3, // 원작: 3초당 0.1% 추가 소모
  6: 0.1 / 3,
  7: 0.1 / 3
};

// ===== ANIMATION FRAMES =====
const ANIM = {
  monitor: [
    '모니터 들어올리는 애니메이션/46.png',
    '모니터 들어올리는 애니메이션/132.png',
    '모니터 들어올리는 애니메이션/133.png',
    '모니터 들어올리는 애니메이션/136.png',
    '모니터 들어올리는 애니메이션/137.png',
    '모니터 들어올리는 애니메이션/138.png',
    '모니터 들어올리는 애니메이션/139.png',
    '모니터 들어올리는 애니메이션/140.png',
    '모니터 들어올리는 애니메이션/141.png',
    '모니터 들어올리는 애니메이션/142.png',
    '모니터 들어올리는 애니메이션/144.png'
  ],
  leftDoor: [
    '왼쪽문 여닫이 애니메이션/87.png',
    '왼쪽문 여닫이 애니메이션/88.png',
    '왼쪽문 여닫이 애니메이션/89.png',
    '왼쪽문 여닫이 애니메이션/91.png',
    '왼쪽문 여닫이 애니메이션/92.png',
    '왼쪽문 여닫이 애니메이션/93.png',
    '왼쪽문 여닫이 애니메이션/94.png',
    '왼쪽문 여닫이 애니메이션/95.png',
    '왼쪽문 여닫이 애니메이션/96.png',
    '왼쪽문 여닫이 애니메이션/97.png',
    '왼쪽문 여닫이 애니메이션/98.png',
    '왼쪽문 여닫이 애니메이션/99.png',
    '왼쪽문 여닫이 애니메이션/100.png',
    '왼쪽문 여닫이 애니메이션/101.png',
    '왼쪽문 여닫이 애니메이션/102.png'
  ],
  rightDoor: [
    '오른쪽 문 여닫이 애니메이션/88.png',
    '오른쪽 문 여닫이 애니메이션/105.png',
    '오른쪽 문 여닫이 애니메이션/106.png',
    '오른쪽 문 여닫이 애니메이션/107.png',
    '오른쪽 문 여닫이 애니메이션/108.png',
    '오른쪽 문 여닫이 애니메이션/109.png',
    '오른쪽 문 여닫이 애니메이션/110.png',
    '오른쪽 문 여닫이 애니메이션/111.png',
    '오른쪽 문 여닫이 애니메이션/112.png',
    '오른쪽 문 여닫이 애니메이션/113.png',
    '오른쪽 문 여닫이 애니메이션/114.png',
    '오른쪽 문 여닫이 애니메이션/115.png',
    '오른쪽 문 여닫이 애니메이션/116.png',
    '오른쪽 문 여닫이 애니메이션/117.png',
    '오른쪽 문 여닫이 애니메이션/118.png'
  ]
};

// ===== 원작 FNAF 1 AI 레벨 (12AM 시작값) =====
// [안톤(Bonnie), 생지(Chica), 엔시(Freddy), 코즈(Foxy)]
// 원작 시간별 자동증가: 2AM 보니+1, 3AM 보니/치카/폭시+1, 4AM 보니/치카/폭시+1
// 프레디는 시간증가 없음 (시작값 고정)
const NIGHT_AI = {
  1: [ 0,  0,  0,  0],
  2: [ 3,  1,  0,  1],
  3: [ 0,  5,  1,  2],
  4: [ 2,  4,  1,  6],  // 프레디: 50% 확률로 1 또는 2
  5: [ 5,  7,  3,  5],
  6: [10, 12,  4, 16]
};

// ===== IMAGE PATHS =====
const IMG = {
  menu: '메인화면.jpg',
  office: {
    normal:           '사무실.jpg',
    leftLightEmpty:   '왼쪽불켜진사무실.jpg',
    rightLightEmpty:  '오른쪽 불켜진 사무실.jpg',
    leftLightAnton:   '사무실 안톤.jpg',
    rightLightSaengji:'사무실 생지.jpg',
    powerOut:         'w정전.jpg',
    powerOutEnsi:     '정전엔시.jpg'
  },
  cam1a: {
    all:      '무대 셋 다있음.jpg',
    noAnton:  '무대 네짜흐 없음.jpg',
    noSaengji:'무대 호시노 없음.jpg',
    onlyEnsi: '무대아리스만 있음.jpg',
    empty:    '무대 아무도 없음.jpg'
  },
  cam1b: {
    empty:   '식당 아무도 없음.jpg',
    anton:   '식당 네짜흐.jpg',
    saengji: '식당 호시노.jpg',
    ensi:    '식당 아리스.jpg'
  },
  cam1c: {
    stage0: '파이렛코브 아무도 없음.jpg',
    stage1: '파이렛 코브 코즈 살짝 나옴.jpg',
    stage2: '파이렛 코브 코즈 다 나옴.jpg',
    stage3: '코즈탈출.jpg'
  },
  cam2a: {
    empty: '왼쪽복도 아무도 없음.jpg',
    anton: '왼쪽복도 안톤있음.png'
  },
  // CAM 2B: 기본은 왼쪽문 바로 앞 (전용 이미지 존재), 우구라는 이스터에그로만
  cam2b: {
    empty:  '왼쪽문앞 아무도없음.png', // 원자 파일명 고증
    anton:  '왼쪽문앞 안톤.jpg',
    ugura:  '우구라 왼쪽문앞.jpg'       // 이스터에그 전용
  },
  // CAM 3 = Supply Closet (창고)
  cam3: {
    empty: '창고 아무도 없음.png',
    anton: '안톤 창고.jpg'
  },
  cam4a: {
    empty:   '오른쪽복도.jpg',
    saengji: '호시노 오른쪽복도.jpg',
    ensi:    '엔시 오른쪽복도.jpg'
  },
  cam4b: {
    empty:   '오른쪽 문앞 아무도 없음.jpg',
    saengji: '호시노 오른쪽 문앞.jpg',
    ensi:    '엔시 오른쪽문앞.jpg'
  },
  // CAM 5 = Backstage (준비실)
  cam5: {
    empty: '준비실아무도 없음.jpg',
    anton: '준비실안톤.jpg'
  },
  cam6: { default: '주방.png' },
  cam7: {
    empty:   '화장실 아무도 없음.jpg',
    saengji: '화장실 생지.jpg',
    ensi:    '화장실 엔시.jpg'
  },
  jumpscare: {
    anton:   '안톤 점프스케어.jpg',
    saengji: '생지 점프스케어.jpg',
    ensi:    '엔시 점프스케어.jpg',
    koz:     '코즈 점프스케어.jpg',
    ugura:   '우구라 점프스케어.jpg'
  },
  uguraOffice: '우구라.png',
  gameOver: '게임오버.png',
  ending: {
    night5: '5일밤 클리어.jpg',
    night6: '6일밤 클리어.jpg',
    night7: '7일밤 클리어.jpg',
    mode420: '420클리어엔딩.png'
  },
  customNight: {
    anton:   '커스텀나이츠 안톤.png',
    saengji: '커스텀 나이츠 생지.webp',
    ensi:    '커스텀 나이츠 엔시.webp',
    koz:     '커스텀 나이츠 코즈.webp'
  }
};

// Camera display names
const CAM_NAMES = {
  cam1a: 'CAM 1A - Show Stage',
  cam1b: 'CAM 1B - Dining Area',
  cam1c: 'CAM 1C - Pirate Cove',
  cam2a: 'CAM 2A - West Hall',
  cam2b: 'CAM 2B - W. Hall Corner',
  cam3:  'CAM 3 - Supply Closet',  // 창고
  cam4a: 'CAM 4A - East Hall',
  cam4b: 'CAM 4B - E. Hall Corner',
  cam5:  'CAM 5 - Backstage',      // 준비실
  cam6:  'CAM 6 - Kitchen',
  cam7:  'CAM 7 - Restrooms'
};

// Position → Camera mapping
const POS_TO_CAM = {
  stage:          'cam1a',
  dining:         'cam1b',
  pirateCove:     'cam1c',
  westHall:       'cam2a',
  westHallCorner: 'cam2b',
  backstage:      'cam5',   // 준비실 = CAM 5
  eastHall:       'cam4a',
  eastHallCorner: 'cam4b',
  storage:        'cam3',   // 창고 = CAM 3
  kitchen:        'cam6',
  restroom:       'cam7'
};


// =============================================================================
// AUDIO MANAGER - Procedural Sound Generation
// =============================================================================
class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.activeNodes = [];
    this.fanNode = null;
    this.buzzNode = null;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch(e) {
      console.warn('Audio not available:', e);
    }
  }

  // Generate white noise buffer
  createNoiseBuffer(duration, type = 'white') {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      } else if (type === 'pink') {
        // Simple pink noise approximation
        data[i] = white * 0.5 + (Math.random() * 2 - 1) * 0.3;
      } else {
        data[i] = white;
      }
    }
    return buffer;
  }

  // Start ambient fan noise
  startFan() {
    if (!this.initialized || this.fanNode) return;
    const buffer = this.createNoiseBuffer(2, 'brown');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.12;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.fanNode = { source, filter, gain };
  }

  stopFan() {
    if (this.fanNode) {
      this.fanNode.source.stop();
      this.fanNode = null;
    }
  }

  // Camera static sound
  playStatic(duration = 0.3) {
    if (!this.initialized) return;
    const buffer = this.createNoiseBuffer(duration, 'white');
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  // Door slam sound
  playDoorSlam() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    // Add noise for metallic sound
    const noiseBuffer = this.createNoiseBuffer(0.15, 'white');
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 500;

    osc.connect(gain);
    gain.connect(this.masterGain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    osc.start();
    noise.start();
    osc.stop(this.ctx.currentTime + 0.3);
    noise.stop(this.ctx.currentTime + 0.15);
  }

  // Door open sound
  playDoorOpen() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(40, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Light buzz
  startBuzz() {
    if (!this.initialized || this.buzzNode) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 120;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 120;
    filter.Q.value = 10;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.04;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();

    this.buzzNode = { osc, gain };
  }

  stopBuzz() {
    if (this.buzzNode) {
      this.buzzNode.osc.stop();
      this.buzzNode = null;
    }
  }

  // Jumpscare scream
  playScream() {
    if (!this.initialized) return;
    const duration = 1.5;

    // Harsh oscillator
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + duration);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(400, this.ctx.currentTime + duration);

    // Noise
    const noiseBuffer = this.createNoiseBuffer(duration, 'white');
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    // Distortion
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 5);
    }
    distortion.curve = curve;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc1.connect(distortion);
    osc2.connect(distortion);
    noise.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(); osc2.start(); noise.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
    noise.stop(this.ctx.currentTime + duration);
  }

  // 6AM chime
  playChime() {
    if (!this.initialized) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + i * 0.3;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  }

  // Power down sound
  playPowerDown() {
    if (!this.initialized) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  // Toreador March (simplified - for power out Freddy/Ensi)
  playMusicBox() {
    if (!this.initialized) return;
    // Simplified Toreador March melody
    const melody = [
      [523, 0.4], [523, 0.4], [659, 0.4], [587, 0.4],
      [523, 0.4], [494, 0.4], [440, 0.4], [392, 0.8],
      [440, 0.4], [494, 0.4], [523, 0.4], [587, 0.4],
      [659, 0.8], [523, 0.8]
    ];

    let time = this.ctx.currentTime;
    melody.forEach(([freq, dur]) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.setValueAtTime(0.15, time + dur * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + dur);
      time += dur;
    });

    return time - this.ctx.currentTime; // return total duration
  }

  // Foxy knock
  playKnock(count = 3) {
    if (!this.initialized) return;
    for (let i = 0; i < count; i++) {
      const t = this.ctx.currentTime + i * 0.2;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.05, 'white');
      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.4, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain); gain.connect(this.masterGain);
      noise.connect(nGain); nGain.connect(this.masterGain);
      osc.start(t); osc.stop(t + 0.15);
      noise.start(t); noise.stop(t + 0.05);
    }
  }

  // Footsteps (Foxy running)
  playFootsteps() {
    if (!this.initialized) return;
    for (let i = 0; i < 8; i++) {
      const t = this.ctx.currentTime + i * 0.12;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60 + Math.random() * 20;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.08);
    }
  }

  stopAll() {
    this.stopFan();
    this.stopBuzz();
    this.stopKitchenSound();
    this.stopFileAudio('audio-fan');
    this.mutePhoneCall(); // 모든 전화 및 음성 종료
    // Stop all jumpscare audio
    ['anton','saengji','ensi','koz','ugura'].forEach(c => {
      const el = document.getElementById('audio-jumpscare-' + c);
      if (el) { el.pause(); el.currentTime = 0; }
    });
  }

  // ===== FILE-BASED AUDIO =====
  // 선풍기 배경음 (실제 파일)
  startFanFile() {
    const fan = document.getElementById('audio-fan');
    if (fan) { fan.volume = 0.4; fan.play().catch(()=>{}); }
  }

  stopFanFile() {
    const fan = document.getElementById('audio-fan');
    if (fan) { fan.pause(); fan.currentTime = 0; }
  }

  // 점프스케어 음성 재생
  playJumpscareSound(character) {
    const el = document.getElementById('audio-jumpscare-' + character);
    if (el) {
      el.currentTime = 0;
      el.volume = 0.8;
      el.loop = true; // 원작 고증: 메인 화면 복귀 전까지 반복재생
      el.play().catch(()=>{});
    }
  }

  // 생지 주방 소리
  startKitchenSound() {
    if (this._kitchenPlaying) return;
    const el = document.getElementById('audio-kitchen-saengji');
    if (el) { 
      el.volume = 0.3; 
      el.loop = true; // 주방에 있는 동안 계속 반복재생
      el.play().catch(()=>{}); 
      this._kitchenPlaying = true; 
    }
  }

  stopKitchenSound() {
    const el = document.getElementById('audio-kitchen-saengji');
    if (el) { el.pause(); el.currentTime = 0; el.loop = false; }
    this._kitchenPlaying = false;
  }

  // 엔시 주방 소리 (반복 재생)
  startEnsiKitchenSound() {
    if (this._ensiKitchenPlaying) return;
    const el = document.getElementById('audio-jumpscare-ensi');
    if (el) {
      el.volume = 0.25;
      el.loop = true; // 주방에 있는 동안 계속 반복재생
      el.play().catch(()=>{});
      this._ensiKitchenPlaying = true;
    }
  }

  stopEnsiKitchenSound() {
    const el = document.getElementById('audio-jumpscare-ensi');
    if (el && this._ensiKitchenPlaying) { 
      el.pause(); 
      el.currentTime = 0; 
      el.loop = false; 
    }
    this._ensiKitchenPlaying = false;
  }

  // 엔시 이동 음성 (단발성)
  playEnsiMove() {
    const el = document.getElementById('audio-jumpscare-ensi');
    if (el) {
      if (this._ensiKitchenPlaying) this.stopEnsiKitchenSound(); // 주방 소리와 겹치지 않게 중지
      el.currentTime = 0;
      el.volume = 0.25;
      el.loop = false; // 이동 시에는 반복재생하지 않음
      el.play().catch(()=>{});
    }
  }

  // 범용 파일 오디오 정지
  stopFileAudio(id) {
    const el = document.getElementById(id);
    if (el) { el.pause(); el.currentTime = 0; }
  }

  // ===== PHONE CALL =====
  startPhoneCall(night, onEndedCallback) {
    if (night > 6 && night !== 7) return; // 1~6일밤, 7일밤(커스텀 음성) 허용
    if (!this.ctx) return;
    
    this.phoneMuted = false;
    let ringCount = 0;
    
    // 합성 전화벨 소리 재생 함수
    const playRing = () => {
      if (this.phoneMuted) return;
      if (ringCount >= 3) {
        // 3번 울리면 음성 메시지 재생
        const voiceEl = document.getElementById('audio-voice-' + night);
        if (voiceEl && !this.phoneMuted) {
          voiceEl.volume = 0.8;
          voiceEl.currentTime = 0;
          voiceEl.play().catch(()=>{});
          voiceEl.onended = () => {
            if (onEndedCallback) onEndedCallback();
          };
        } else {
          if (onEndedCallback) onEndedCallback();
        }
        return;
      }
      
      // 전화벨 소리 (두 번의 짧은 비프음 세트)
      const t = this.ctx.currentTime;
      for(let i=0; i<2; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t + i * 0.4);
        osc.frequency.setValueAtTime(480, t + i * 0.4 + 0.1);
        
        gain.gain.setValueAtTime(0, t + i * 0.4);
        gain.gain.linearRampToValueAtTime(0.2, t + i * 0.4 + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + i * 0.4 + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + i * 0.4);
        osc.stop(t + i * 0.4 + 0.3);
      }
      
      ringCount++;
      this.ringTimeout = setTimeout(playRing, 2000); // 2초 간격으로 벨 울림
    };
    
    playRing();
  }

  mutePhoneCall(night) {
    this.phoneMuted = true;
    clearTimeout(this.ringTimeout);
    
    // 모든 음성 파일 정지
    for(let i=1; i<=7; i++) {
      const el = document.getElementById('audio-voice-' + i);
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    }
  }
}


// =============================================================================
// STATIC RENDERER - Camera static noise effect
// =============================================================================
class StaticRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx2d = this.canvas.getContext('2d');
    this.animationId = null;
    this.active = false;
  }

  start() {
    this.active = true;
    this.render();
  }

  stop() {
    this.active = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  render() {
    if (!this.active) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const imageData = this.ctx2d.createImageData(w / 4, h / 4);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;
      data[i+1] = val;
      data[i+2] = val;
      data[i+3] = 40;
    }
    this.ctx2d.clearRect(0, 0, w, h);
    // Draw smaller image and scale up for performance
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w / 4;
    tempCanvas.height = h / 4;
    tempCanvas.getContext('2d').putImageData(imageData, 0, 0);
    this.ctx2d.imageSmoothingEnabled = false;
    this.ctx2d.drawImage(tempCanvas, 0, 0, w, h);

    this.animationId = requestAnimationFrame(() => this.render());
  }

  flash(duration = 300) {
    this.canvas.style.opacity = '0.6';
    setTimeout(() => {
      this.canvas.style.opacity = '0.15';
    }, duration);
  }
}


// =============================================================================
// MAIN GAME CLASS
// =============================================================================
class FNAFGame {
  constructor() {
    // Game state
    this.state = 'loading'; // loading, menu, nightIntro, playing, jumpscare, gameOver, win, powerOut
    this.night = 1;
    this.maxNight = 1; // highest unlocked night
    this.timeElapsed = 0;
    this.currentHour = 0;
    this.power = 100;

    // Office state
    this.leftDoorClosed = false;
    this.rightDoorClosed = false;
    this.leftLightOn = false;
    this.rightLightOn = false;

    // Camera state
    this.cameraUp = false;
    this.currentCam = 'cam1a';

    // Animatronics
    this.animatronics = {
      anton: { pos: 'stage', ai: 0, moveTimer: 0, atDoor: false, doorTimer: 0 },
      saengji: { pos: 'stage', ai: 0, moveTimer: 0, atDoor: false, doorTimer: 0 },
      ensi: { pos: 'stage', ai: 0, moveTimer: 0, atDoor: false, doorTimer: 0 },
      koz: { pos: 'pirateCove', ai: 0, moveTimer: 0, stage: 0, running: false, runTimer: 0 },
      ugura: { active: false, triggered: false }
    };

    // Power out state
    this.powerOutPhase = 0; // 0=dark, 1=ensi appears, 2=music, 3=waiting
    this.powerOutTimer = 0;
    this.musicDuration = 0;

    // Jumpscare state
    this.jumpscareTimer = 0;
    this.jumpscareChar = null;

    // Custom Night AI
    this.customNightAI = { anton: 0, saengji: 0, ensi: 0, koz: 0 };
    this.isCustomNight = false;
    this.is420Mode = false;

    // Admin mode keys
    this.keysPressed = {};

    // Timers
    this.nightIntroTimer = 0;
    this.gameOverTimer = 0;
    this.winTimer = 0;

    // Foxy camera check timer
    this.foxyWatchTimer = 0;
    this.foxyNotWatched = 0;

    // Image cache
    this.images = {};
    this.imagesLoaded = 0;
    this.totalImages = 0;

    // Systems
    this.audio = new AudioManager();
    this.cameraStatic = null;
    this.globalStatic = null;

    // DOM Elements - cached
    this.el = {};

    // Last frame time
    this.lastTime = 0;

    // Initialize
    this.cacheElements();
    this.loadImages();
  }

  // Cache DOM elements for performance
  cacheElements() {
    const ids = [
      'loading-screen', 'loading-bar',
      'menu-screen', 'menu-bg', 'menu-title', 'btn-new-game', 'btn-continue', 'menu-night-indicator', 'menu-stars',
      'night-intro', 'night-number', 'night-time',
      'game-screen', 'office-view', 'office-bg',
      'left-door-panel', 'right-door-panel',
      'btn-left-door', 'btn-left-light', 'btn-right-door', 'btn-right-light',
      'ind-left-door', 'ind-left-light', 'ind-right-door', 'ind-right-light',
      'camera-view', 'camera-feed', 'camera-static', 'camera-name', 'camera-toggle-btn',
      'camera-map',
      'monitor-anim',
      'hud', 'time-display', 'night-label', 'power-value',
      'jumpscare-screen', 'jumpscare-img',
      'powerout-screen', 'powerout-img',
      'gameover-screen', 'gameover-img',
      'win-screen', 'win-time',
      'ending-screen', 'ending-img',
      'custom-night-screen', 'ugura-office',
      'btn-night6', 'btn-custom-night', 'btn-exit',
      'btn-cn-start', 'btn-cn-back',
      'foxy-run-video',
      'global-static',
      'btn-mute-call'
    ];
    ids.forEach(id => {
      this.el[id] = document.getElementById(id);
    });

    // Camera buttons
    this.camButtons = {};
    document.querySelectorAll('.cam-btn').forEach(btn => {
      this.camButtons[btn.dataset.cam] = btn;
    });

    // Usage bars
    this.usageBars = document.querySelectorAll('.usage-bar');
  }

  // Load and cache all images
  loadImages() {
    const allPaths = new Set();

    // Collect all image paths
    function collectPaths(obj) {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          allPaths.add(obj[key]);
        } else if (typeof obj[key] === 'object') {
          collectPaths(obj[key]);
        }
      }
    }
    collectPaths(IMG);
    collectPaths(ANIM);

    this.totalImages = allPaths.size;
    this.imagesLoaded = 0;

    allPaths.forEach(path => {
      const img = new Image();
      img.onload = () => {
        this.imagesLoaded++;
        this.updateLoadingBar();
        if (this.imagesLoaded >= this.totalImages) {
          this.onAllImagesLoaded();
        }
      };
      img.onerror = () => {
        console.warn('Failed to load:', path);
        this.imagesLoaded++;
        this.updateLoadingBar();
        if (this.imagesLoaded >= this.totalImages) {
          this.onAllImagesLoaded();
        }
      };
      img.src = './' + path;
      this.images[path] = img;
    });
  }

  updateLoadingBar() {
    const pct = (this.imagesLoaded / this.totalImages) * 100;
    this.el['loading-bar'].style.width = pct + '%';
  }

  onAllImagesLoaded() {
    console.log('All images loaded!');
    this.cameraStatic = new StaticRenderer('camera-static');
    this.globalStatic = new StaticRenderer('global-static');
    this.setupInput();
    this.setupResize();

    // Small delay then go to menu
    setTimeout(() => {
      this.loadSave();
      this.showMenu();
    }, 500);
  }

  // ===== SAVE/LOAD =====
  loadSave() {
    try {
      const save = localStorage.getItem('fnaf_save');
      if (save) {
        const data = JSON.parse(save);
        this.maxNight = data.maxNight || 1;
        this.continueNight = data.continueNight || Math.min(this.maxNight, 5);
      } else {
        this.maxNight = 1;
        this.continueNight = 1;
      }
    } catch(e) {
      this.maxNight = 1;
      this.continueNight = 1;
    }
  }

  save() {
    try {
      localStorage.setItem('fnaf_save', JSON.stringify({
        maxNight: this.maxNight,
        continueNight: this.continueNight
      }));
    } catch(e) {}
  }

  // ===== SCREEN MANAGEMENT =====
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = ''; // inline style 초기화
    });
    this.el[screenId].classList.add('active');
  }

  hideScreen(screenId) {
    this.el[screenId].classList.remove('active');
  }

  // ===== RESIZE =====
  setupResize() {
    const resize = () => {
      const container = document.getElementById('game-container');
      const scaleX = window.innerWidth / GAME_WIDTH;
      const scaleY = window.innerHeight / GAME_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      container.style.transform = `scale(${scale})`;
      container.style.left = ((window.innerWidth - GAME_WIDTH * scale) / 2) + 'px';
      container.style.top = ((window.innerHeight - GAME_HEIGHT * scale) / 2) + 'px';
    };
    window.addEventListener('resize', resize);
    resize();
  }

  // ===== INPUT SETUP =====
  setupInput() {
    // Door buttons
    this.el['btn-left-door'].addEventListener('click', () => this.toggleLeftDoor());
    this.el['btn-right-door'].addEventListener('click', () => this.toggleRightDoor());

    // Light buttons - hold to activate
    this.el['btn-left-light'].addEventListener('mousedown', () => this.setLeftLight(true));
    this.el['btn-left-light'].addEventListener('mouseup', () => this.setLeftLight(false));
    this.el['btn-left-light'].addEventListener('mouseleave', () => this.setLeftLight(false));

    this.el['btn-right-light'].addEventListener('mousedown', () => this.setRightLight(true));
    this.el['btn-right-light'].addEventListener('mouseup', () => this.setRightLight(false));
    this.el['btn-right-light'].addEventListener('mouseleave', () => this.setRightLight(false));

    // Camera toggle
    this.el['camera-toggle-btn'].addEventListener('click', () => this.toggleCamera());

    // Camera buttons
    Object.keys(this.camButtons).forEach(cam => {
      this.camButtons[cam].addEventListener('click', () => this.switchCamera(cam));
    });

    // Menu buttons
    this.el['btn-new-game'].addEventListener('click', () => {
      // New Game resets continue progress to night 1 (but doesn't overwrite save until you beat a night)
      this.continueNight = 1;
      this.audio.init();
      this.startNight(1);
    });
    this.el['btn-continue'].addEventListener('click', () => {
      this.audio.init();
      const night = Math.min(this.continueNight || 1, 5); // 1~5일차 이어서 하기
      this.startNight(night);
    });
    this.el['btn-night6'].addEventListener('click', () => {
      this.audio.init();
      this.startNight(6);
    });
    this.el['btn-custom-night'].addEventListener('click', () => {
      this.audio.init();
      this.showCustomNight();
    });
    this.el['btn-exit'].addEventListener('click', () => {
      require('electron').ipcRenderer.send('quit-app');
    });

    // Mute Call
    this.el['btn-mute-call'].addEventListener('click', () => {
      this.audio.mutePhoneCall();
      this.el['btn-mute-call'].style.display = 'none';
    });

    // Custom Night AI controls
    document.querySelectorAll('.cn-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.char;
        this.customNightAI[c] = Math.max(0, this.customNightAI[c] - 1);
        document.getElementById('cn-ai-' + c).textContent = this.customNightAI[c];
      });
    });
    document.querySelectorAll('.cn-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.char;
        this.customNightAI[c] = Math.min(20, this.customNightAI[c] + 1);
        document.getElementById('cn-ai-' + c).textContent = this.customNightAI[c];
      });
    });
    this.el['btn-cn-start'].addEventListener('click', () => {
      if (this.customNightAI.anton === 1 && this.customNightAI.saengji === 9 &&
          this.customNightAI.ensi === 8 && this.customNightAI.koz === 7) {
        this.hideScreen('custom-night-screen');
        this.state = 'playing'; // 상태 변경이 있어야 점프스케어 동작
        this.triggerJumpscare('ugura');
        return;
      }

      this.is420Mode = (this.customNightAI.anton === 20 && this.customNightAI.saengji === 20 &&
                        this.customNightAI.ensi === 20 && this.customNightAI.koz === 20);
      this.isCustomNight = true;
      this.startNight(7);
    });
    this.el['btn-cn-back'].addEventListener('click', () => {
      this.hideScreen('custom-night-screen');
      this.showMenu();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keysPressed[e.key.toLowerCase()] = true;

      // 관리자 모드: T+Y 동시 누르면 모든 밤 개방 및 별 3개 (일회성, 저장 안 함)
      if (this.state === 'menu' && this.keysPressed['t'] && this.keysPressed['y']) {
        this.maxNight = 8;
        this.showMenu(); // 버튼 갱신
        console.log('[ADMIN] All nights unlocked!');
      }

      // 세이브 초기화 단축키: 메인 메뉴에서 숫자 0 키 누름
      if (this.state === 'menu' && this.keysPressed['0']) {
        localStorage.removeItem('fnaf_save');
        this.maxNight = 1;
        this.continueNight = 1;
        this.showMenu();
        console.log('[ADMIN] Save reset!');
      }

      // ESC: Return to main menu (from game or ending/game over)
      if (e.key === 'Escape') {
        if (this.state !== 'menu') {
          this.returnToMenu();
        }
      }

      if (this.state === 'playing') {
        if (e.key === ' ' || e.key === 'Tab') {
          e.preventDefault();
          this.toggleCamera();
        }
      }
    });
    document.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
    });

    // Click to init audio on first interaction
    document.addEventListener('click', () => {
      this.audio.init();
    }, { once: true });
  }

  // ===== MENU =====
  returnToMenu() {
    this.state = 'menu';
    this.audio.stopAll();
    this.audio.stopFanFile();
    this.cameraStatic.stop();
    if (this.el['foxy-run-video']) {
      this.el['foxy-run-video'].pause();
      this.el['foxy-run-video'].style.display = 'none';
    }
    // 모든 화면 숨김
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.showMenu();
  }

  showMenu() {
    this.state = 'menu';
    this.isCustomNight = false;
    this.is420Mode = false;
    this.showScreen('menu-screen');
    this.el['menu-bg'].src = './' + IMG.menu;

    // Continue button (Night 1~5)
    if (this.continueNight > 1 || this.maxNight > 1) {
      this.el['btn-continue'].style.display = 'block';
      const continueN = Math.min(this.continueNight || 1, 5);
      this.el['menu-night-indicator'].textContent = 'Continue Night ' + continueN;
    } else {
      this.el['btn-continue'].style.display = 'none';
      this.el['menu-night-indicator'].textContent = '';
    }

    // Night 6 button (Night 5 클리어 후)
    if (this.maxNight >= 6) {
      this.el['btn-night6'].style.display = 'block';
    } else {
      this.el['btn-night6'].style.display = 'none';
    }

    // Custom Night button (Night 6 클리어 후)
    if (this.maxNight >= 7) {
      this.el['btn-custom-night'].style.display = 'block';
    } else {
      this.el['btn-custom-night'].style.display = 'none';
    }
    
    // Draw Stars
    this.el['menu-stars'].innerHTML = '';
    if (this.maxNight >= 6) this.el['menu-stars'].innerHTML += '<span class="menu-star">⭐</span>'; // 5일밤 클리어
    if (this.maxNight >= 7) this.el['menu-stars'].innerHTML += '<span class="menu-star">⭐</span>'; // 6일밤 클리어
    if (this.maxNight >= 8) this.el['menu-stars'].innerHTML += '<span class="menu-star">⭐</span>'; // 7일밤 클리어
  }

  // ===== CUSTOM NIGHT SETUP =====
  showCustomNight() {
    this.state = 'customNight';
    this.showScreen('custom-night-screen');

    // 프로필 이미지 설정
    document.getElementById('cn-img-anton').src = './' + IMG.customNight.anton;
    document.getElementById('cn-img-saengji').src = './' + IMG.customNight.saengji;
    document.getElementById('cn-img-ensi').src = './' + IMG.customNight.ensi;
    document.getElementById('cn-img-koz').src = './' + IMG.customNight.koz;

    // AI 값 리셋
    this.customNightAI = { anton: 0, saengji: 0, ensi: 0, koz: 0 };
    ['anton','saengji','ensi','koz'].forEach(c => {
      document.getElementById('cn-ai-' + c).textContent = '0';
    });
  }

  // ===== NIGHT START =====
  startNight(nightNum) {
    this.night = nightNum;
    this.timeElapsed = 0;
    this.currentHour = 0;
    this.power = 100;

    this.leftDoorClosed = false;
    this.rightDoorClosed = false;
    this.leftLightOn = false;
    this.rightLightOn = false;
    this.cameraUp = false;
    this.currentCam = 'cam1a';
    
    // Jam state
    this.leftDoorJam = false;
    this.leftLightJam = false;
    this.rightDoorJam = false;
    this.rightLightJam = false;

    // Reset animatronics
    let aiLevels;
    if (this.isCustomNight && nightNum === 7) {
      // 커스텀 나이트: 사용자 설정 AI
      aiLevels = [this.customNightAI.anton, this.customNightAI.saengji, this.customNightAI.ensi, this.customNightAI.koz];
    } else {
      aiLevels = NIGHT_AI[nightNum] || NIGHT_AI[6];
    }
    this.animatronics = {
      anton: { pos: 'stage', ai: aiLevels[0], moveTimer: Math.random() * AI_INTERVAL, atDoor: false, doorTimer: 0 },
      saengji: { pos: 'stage', ai: aiLevels[1], moveTimer: Math.random() * AI_INTERVAL, atDoor: false, doorTimer: 0 },
      ensi: { pos: 'stage', ai: aiLevels[2], moveTimer: Math.random() * AI_INTERVAL, atDoor: false, doorTimer: 0 },
      koz: { pos: 'pirateCove', ai: aiLevels[3], moveTimer: Math.random() * FOXY_CHECK_INTERVAL, stage: 0, running: false, runTimer: 0, knockCount: 0, stunTimer: 0 },
      ugura: { active: false, triggered: false, inOffice: false, officeTimer: 0 }
    };

    // Night 4: 프레디(엔시) AI가 50% 확률로 1 또는 2 (원작 고증)
    if (nightNum === 4 && !this.isCustomNight) {
      this.animatronics.ensi.ai = Math.random() < 0.5 ? 1 : 2;
    }

    // Reset power out
    this.powerOutPhase = 0;
    this.powerOutTimer = 0;

    // Reset foxy watch
    this.foxyWatchTimer = 0;
    this.foxyNotWatched = 0;

    // Show night intro
    this.state = 'nightIntro';
    this.nightIntroTimer = 4;
    this.el['night-number'].textContent = 'Night ' + nightNum;
    this.el['night-time'].textContent = '12:00 AM';

    this.showScreen('night-intro');
    this.hideScreen('menu-screen');
    this.hideScreen('gameover-screen');
    this.hideScreen('win-screen');

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  // ===== MAIN GAME LOOP =====
  gameLoop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap dt at 100ms
    this.lastTime = timestamp;

    switch (this.state) {
      case 'nightIntro':
        this.updateNightIntro(dt);
        break;
      case 'playing':
        this.updatePlaying(dt);
        break;
      case 'jumpscare':
        this.updateJumpscare(dt);
        break;
      case 'powerOut':
        this.updatePowerOut(dt);
        break;
      case 'gameOver':
        this.updateGameOver(dt);
        break;
      case 'win':
        this.updateWin(dt);
        break;
      case 'ending':
        this.updateEnding(dt);
        break;
    }

    if (this.state !== 'menu' && this.state !== 'customNight') {
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  // ===== NIGHT INTRO UPDATE =====
  updateNightIntro(dt) {
    this.nightIntroTimer -= dt;
    if (this.nightIntroTimer <= 0) {
      this.state = 'playing';
      this.hideScreen('night-intro');
      this.showScreen('game-screen');

      // Start ambient
      this.audio.startFan();
      this.audio.startFanFile();

      // Initialize office view
      this.updateOfficeView();
      this.updateHUD();

      // Start camera static
      this.cameraStatic.start();
      
      // Start Phone Call
      if (this.night <= 6 || this.night === 7) {
        this.el['btn-mute-call'].style.display = 'block';
        this.audio.startPhoneCall(this.night, () => {
          this.el['btn-mute-call'].style.display = 'none';
        });
      }
    }
  }

  // ===== PLAYING UPDATE =====
  updatePlaying(dt) {
    // Update time
    this.timeElapsed += dt;
    const newHour = Math.min(Math.floor(this.timeElapsed / HOUR_DURATION), 6);

    if (newHour !== this.currentHour) {
      this.currentHour = newHour;
      if (this.currentHour >= 6) {
        this.onSixAM();
        return;
      }
      // 원작 시간별 AI 자동 증가
      this.applyHourlyAIIncrease(this.currentHour);
    }

    // Update power
    this.updatePower(dt);

    // Update animatronics
    this.updateAnimatronics(dt);

    // Kitchen sounds
    this.updateKitchenSounds();

    // Update render
    if (this.cameraUp) {
      this.updateCameraView();
    } else {
      this.updateOfficeView();
    }

    this.updateHUD();
  }

  // ===== 원작 시간별 AI 자동 증가 =====
  // 2AM: 보니(안톤) +1
  // 3AM: 보니(안톤) +1, 치카(생지) +1, 폭시(코즈) +1
  // 4AM: 보니(안톤) +1, 치카(생지) +1, 폭시(코즈) +1
  // 프레디(엔시)는 시간에 따라 증가하지 않음
  applyHourlyAIIncrease(hour) {
    const a = this.animatronics;
    if (hour === 2) {
      a.anton.ai += 1;
    } else if (hour === 3) {
      a.anton.ai += 1;
      a.saengji.ai += 1;
      a.koz.ai += 1;
    } else if (hour === 4) {
      a.anton.ai += 1;
      a.saengji.ai += 1;
      a.koz.ai += 1;
    }
    // Cap at 20
    a.anton.ai = Math.min(a.anton.ai, 20);
    a.saengji.ai = Math.min(a.saengji.ai, 20);
    a.koz.ai = Math.min(a.koz.ai, 20);

    console.log(`[Night ${this.night}] ${hour}AM → Anton:${a.anton.ai} Saengji:${a.saengji.ai} Ensi:${a.ensi.ai} Koz:${a.koz.ai}`);
  }

  // ===== POWER SYSTEM =====
  updatePower(dt) {
    let usageLevel = 1; // base
    if (this.leftDoorClosed) usageLevel++;
    if (this.rightDoorClosed) usageLevel++;
    if (this.leftLightOn) usageLevel++;
    if (this.rightLightOn) usageLevel++;
    if (this.cameraUp) usageLevel++;

    // 원작 고증 전력 소모 공식
    // Total Drain = (Usage Level * Base Drain) + Passive Drain
    const passiveDrain = PASSIVE_DRAIN[this.night] || PASSIVE_DRAIN[6];
    const totalDrainRate = (usageLevel * BASE_POWER_DRAIN) + passiveDrain;
    
    this.power -= totalDrainRate * dt;

    // Update usage bars
    this.usageBars.forEach((bar, i) => {
      if (i < usageLevel) {
        bar.classList.add('active');
      } else {
        bar.classList.remove('active');
      }
    });

    if (this.power <= 0) {
      this.power = 0;
      this.onPowerOut();
    }
  }

  // ===== OFFICE CONTROLS =====
  
  // 공통 애니메이션 실행기
  playAnimation(elId, frames, reverse, durationMs, onComplete) {
    const el = this.el[elId];
    if (!el) return;
    el.style.display = 'block';
    
    let frameIndex = reverse ? frames.length - 1 : 0;
    const step = reverse ? -1 : 1;
    const intervalMs = Math.floor(durationMs / frames.length);
    
    const nextFrame = () => {
      el.src = './' + frames[frameIndex];
      frameIndex += step;
      
      if ((!reverse && frameIndex >= frames.length) || (reverse && frameIndex < 0)) {
        if (onComplete) onComplete();
      } else {
        setTimeout(nextFrame, intervalMs);
      }
    };
    nextFrame();
  }

  toggleLeftDoor() {
    if (this.state !== 'playing' || this.cameraUp || this.leftDoorJam) return;
    this.leftDoorClosed = !this.leftDoorClosed;

    if (this.leftDoorClosed) {
      this.audio.playDoorSlam();
      this.el['ind-left-door'].classList.add('active-red');
      this.playAnimation('left-door-panel', ANIM.leftDoor, false, 250); // 닫힘: 0 -> max
    } else {
      this.audio.playDoorOpen();
      this.el['ind-left-door'].classList.remove('active-red');
      this.playAnimation('left-door-panel', ANIM.leftDoor, true, 250, () => {
        this.el['left-door-panel'].style.display = 'none'; // 다 열리면 숨김
      });
    }
  }

  toggleRightDoor() {
    if (this.state !== 'playing' || this.cameraUp || this.rightDoorJam) return;
    this.rightDoorClosed = !this.rightDoorClosed;

    if (this.rightDoorClosed) {
      this.audio.playDoorSlam();
      this.el['ind-right-door'].classList.add('active-red');
      this.playAnimation('right-door-panel', ANIM.rightDoor, false, 250); // 닫힘
    } else {
      this.audio.playDoorOpen();
      this.el['ind-right-door'].classList.remove('active-red');
      this.playAnimation('right-door-panel', ANIM.rightDoor, true, 250, () => {
        this.el['right-door-panel'].style.display = 'none'; // 다 열리면 숨김
      });
    }
  }

  setLeftLight(on) {
    if (this.state !== 'playing' || this.cameraUp || this.leftLightJam) return;
    if (on === this.leftLightOn) return;
    this.leftLightOn = on;

    if (on) {
      this.el['ind-left-light'].classList.add('active-green');
      this.audio.startBuzz();
    } else {
      this.el['ind-left-light'].classList.remove('active-green');
      if (!this.rightLightOn) this.audio.stopBuzz();
    }
    this.updateOfficeView();
  }

  setRightLight(on) {
    if (this.state !== 'playing' || this.cameraUp || this.rightLightJam) return;
    if (on === this.rightLightOn) return;
    this.rightLightOn = on;

    if (on) {
      this.el['ind-right-light'].classList.add('active-green');
      this.audio.startBuzz();
    } else {
      this.el['ind-right-light'].classList.remove('active-green');
      if (!this.leftLightOn) this.audio.stopBuzz();
    }
    this.updateOfficeView();
  }

  // ===== CAMERA =====
  toggleCamera() {
    if (this.state !== 'playing') return;

    this.cameraUp = !this.cameraUp;

    if (this.cameraUp) {
      // Turn off lights when camera goes up
      this.setLeftLight(false);
      this.setRightLight(false);
      document.querySelector('.toggle-arrow').classList.add('flipped');
      this.audio.playStatic(0.3);

      this.playAnimation('monitor-anim', ANIM.monitor, false, 200, () => {
        this.el['monitor-anim'].style.display = 'none';
        this.el['camera-view'].style.display = 'block';
        this.el['office-view'].style.display = 'none';
        this.cameraStatic.flash(200);
        this.updateCameraView();
      });
    } else {
      // 모니터를 내릴 때 사무실에 침입한 애니마트로닉스가 있다면 즉시 점프스케어
      const intruders = ['anton', 'saengji', 'ensi'].filter(k => this.animatronics[k].inOffice);
      if (intruders.length > 0) {
        this.cameraUp = false;
        this.triggerJumpscare(intruders[Math.floor(Math.random() * intruders.length)]);
        return;
      }

      this.el['camera-view'].style.display = 'none';
      document.querySelector('.toggle-arrow').classList.remove('flipped');
      this.audio.playStatic(0.2);

      this.playAnimation('monitor-anim', ANIM.monitor, true, 200, () => {
        this.el['monitor-anim'].style.display = 'none';
      });

      this.el['office-view'].style.display = 'block';
      this.updateOfficeView();

      // 원작 고증: 카메라를 내릴 때 폭시에게 랜덤한 스턴 시간(0.83 ~ 17.5초) 부여
      // 이 스턴 시간 동안에는 폭시의 AI 체크가 완전히 정지됨
      if (this.animatronics && this.animatronics.koz) {
        this.animatronics.koz.stunTimer = 0.83 + Math.random() * 16.67;
      }

      // 폭시 비디오 정지 및 숨김
      if (this.el['foxy-run-video']) {
        this.el['foxy-run-video'].style.display = 'none';
        this.el['foxy-run-video'].pause();
        this.el['foxy-run-video'].currentTime = 0;
        this.el['camera-feed'].style.display = 'block';
      }
    }
  }

  switchCamera(cam) {
    if (this.state !== 'playing' || !this.cameraUp) return;
    if (cam === this.currentCam) return;

    this.currentCam = cam;

    // Update button styles
    Object.keys(this.camButtons).forEach(c => {
      this.camButtons[c].classList.toggle('active', c === cam);
    });

    // Static transition
    this.audio.playStatic(0.15);
    this.cameraStatic.flash(150);
    this.updateCameraView();
  }

  // ===== OFFICE VIEW RENDERING =====
  updateOfficeView() {
    let imgPath;

    if (this.leftLightOn) {
      // Check if Anton is at the left door (blind spot)
      if (this.animatronics.anton.pos === 'leftDoor') {
        imgPath = IMG.office.leftLightAnton;
      } else {
        imgPath = IMG.office.leftLightEmpty;
      }
    } else if (this.rightLightOn) {
      // Check if Saengji is at the right door (blind spot)
      if (this.animatronics.saengji.pos === 'rightDoor') {
        imgPath = IMG.office.rightLightSaengji;
      } else {
        imgPath = IMG.office.rightLightEmpty;
      }
    } else {
      imgPath = IMG.office.normal;
    }

    this.el['office-bg'].src = './' + imgPath;

    // 안톤 유무에 따른 왼쪽 문 세밀한 위치 보정
    const isAntonAtDoor = (this.leftLightOn && this.animatronics.anton.pos === 'leftDoor');
    const isEmptyLeftLight = (this.leftLightOn && !isAntonAtDoor);
    
    this.el['left-door-panel'].classList.toggle('shifted-anton', isAntonAtDoor);
    this.el['left-door-panel'].classList.toggle('shifted', isEmptyLeftLight);
  }

  // ===== CAMERA VIEW RENDERING =====
  updateCameraView() {
    const cam = this.currentCam;
    const imgPath = this.getCameraImage(cam);

    this.el['camera-feed'].src = './' + imgPath;
    this.el['camera-name'].textContent = CAM_NAMES[cam] || cam;

    // 다른 카메라로 전환되면 폭시 비디오 숨기기
    if (cam !== 'cam2a') {
      this.el['foxy-run-video'].style.display = 'none';
      this.el['foxy-run-video'].pause();
      this.el['foxy-run-video'].currentTime = 0;
      this.el['camera-feed'].style.display = 'block';
    }

    // Update camera button highlighting
    Object.keys(this.camButtons).forEach(c => {
      this.camButtons[c].classList.toggle('active', c === cam);
    });
  }

  getCameraImage(cam) {
    const a = this.animatronics;

    switch (cam) {
      case 'cam1a': {
        const antonHere   = a.anton.pos === 'stage';
        const saengjiHere = a.saengji.pos === 'stage';
        const ensiHere    = a.ensi.pos === 'stage';
        if  ( antonHere &&  saengjiHere &&  ensiHere) return IMG.cam1a.all;
        if  (!antonHere &&  saengjiHere &&  ensiHere) return IMG.cam1a.noAnton;
        if  ( antonHere && !saengjiHere &&  ensiHere) return IMG.cam1a.noSaengji;
        if  (!antonHere && !saengjiHere &&  ensiHere) return IMG.cam1a.onlyEnsi;
        return IMG.cam1a.empty;
      }

      case 'cam1b': {
        // 우선순위: Koz > Saengji > Anton > Ensi > Ugura
        if (a.saengji.pos === 'dining') return IMG.cam1b.saengji;
        if (a.anton.pos   === 'dining') return IMG.cam1b.anton;
        if (a.ensi.pos    === 'dining') return IMG.cam1b.ensi;
        return IMG.cam1b.empty;
      }

      case 'cam1c': {
        const stage = a.koz.stage;
        if (stage === 0) return IMG.cam1c.stage0;
        if (stage === 1) return IMG.cam1c.stage1;
        if (stage === 2) return IMG.cam1c.stage2;
        return IMG.cam1c.stage3; // 탈출 후
      }

      case 'cam2a': {
        if (a.anton.pos === 'westHall') return IMG.cam2a.anton;
        return IMG.cam2a.empty;
      }

      case 'cam2b': {
        // 기본은 빈 복도, 안톤이 있으면 안톤, 우구라 이스터에그
        if (a.ugura.active) return IMG.cam2b.ugura; // 골든프레디 이스터에그 (우선순위 가장 낮으나 독립적 발생)
        if (a.anton.pos === 'westHallCorner') return IMG.cam2b.anton;
        return IMG.cam2b.empty; // 기본: 빈 왼쪽 복도
      }

      case 'cam3': {
        // CAM 3 = 창고 (Supply Closet)
        if (a.anton.pos === 'storage') return IMG.cam3.anton;
        return IMG.cam3.empty;
      }

      case 'cam4a': {
        // 우선순위: Saengji > Ensi
        if (a.saengji.pos === 'eastHall') return IMG.cam4a.saengji;
        if (a.ensi.pos    === 'eastHall') return IMG.cam4a.ensi;
        return IMG.cam4a.empty;
      }

      case 'cam4b': {
        // 우선순위: Saengji > Ensi
        // 사무실에 침입한 상태(inOffice)면 카메라에 표시하지 않음
        if (a.saengji.pos === 'eastHallCorner' && !a.saengji.inOffice) return IMG.cam4b.saengji;
        if (a.ensi.pos    === 'eastHallCorner' && !a.ensi.inOffice) return IMG.cam4b.ensi;
        return IMG.cam4b.empty;
      }

      case 'cam5': {
        // CAM 5 = 준비실 (Backstage)
        if (a.anton.pos === 'backstage') return IMG.cam5.anton;
        return IMG.cam5.empty;
      }

      case 'cam6':
        // 주방: 카메라 피드 없음 (원작) - 이미지만 표시
        return IMG.cam6.default;

      case 'cam7': {
        // 화장실: Saengji > Ensi
        if (a.saengji.pos === 'restroom') return IMG.cam7.saengji;
        if (a.ensi.pos    === 'restroom') return IMG.cam7.ensi;
        return IMG.cam7.empty;
      }

      default:
        return IMG.cam1a.all;
    }
  }

  // ===== HUD =====
  updateHUD() {
    // Time display
    const hourNames = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM'];
    this.el['time-display'].textContent = hourNames[this.currentHour] || '12 AM';
    this.el['night-label'].textContent = 'Night ' + this.night;

    // Power display
    this.el['power-value'].textContent = Math.max(0, Math.floor(this.power));
  }

  // ===== ANIMATRONIC AI =====
  updateAnimatronics(dt) {
    this.updateAnton(dt);
    this.updateSaengji(dt);
    this.updateEnsi(dt);
    this.updateKoz(dt);
    this.updateUgura(dt);
  }

  // ===== KITCHEN SOUNDS =====
  updateKitchenSounds() {
    const a = this.animatronics;
    
    // 원작 고증 변경: 사용자의 요청에 따라 주방 카메라(CAM 6)를 보고 있을 때만 소리 재생
    const lookingAtKitchen = this.cameraUp && this.currentCam === 'cam6';

    // 생지가 주방에 있고 카메라로 보고 있을 때만 주방 소리 재생 (반복 재생)
    if (a.saengji.pos === 'kitchen' && lookingAtKitchen) {
      this.audio.startKitchenSound();
    } else {
      this.audio.stopKitchenSound();
    }

    // 엔시가 주방에 있고 카메라로 보고 있을 때만 엔시 주방 소리 재생 (반복 재생)
    if (a.ensi.pos === 'kitchen' && lookingAtKitchen) {
      this.audio.startEnsiKitchenSound();
    } else {
      this.audio.stopEnsiKitchenSound();
    }
  }

  // =====================================================================
  // 안톤 (Bonnie 고증)
  // 이동경로: Stage → Dining → Backstage/Storage → W.Hall → W.Hall Corner
  // Night 1: AI=0이지만 스크립트로 2AM에 강제 이동 시작
  // =====================================================================
  updateAnton(dt) {
    const a = this.animatronics.anton;

    // Night 1 scripted movement: 2AM부터 강제로 활성화
    if (this.night === 1 && this.currentHour >= 2 && a.ai === 0) {
      a.ai = 1; // 약한 AI로 활성화
    }

    if (a.ai <= 0) return;

    a.moveTimer += dt;
    if (a.moveTimer >= AI_INTERVAL) {
      a.moveTimer = 0;
      const roll = Math.floor(Math.random() * 20) + 1;
      if (roll <= a.ai) {
        this.moveAnton();
      }
    }
  }

  moveAnton() {
    const a = this.animatronics.anton;
    // 원작 보니 이동 경로:
    // Stage → Dining → Backstage OR Storage → West Hall → West Hall Corner -> Left Door
    // 각 단계에서 일정 확률로 빠르게 건너뛸 수 있음
    switch (a.pos) {
      case 'stage':
        a.pos = 'dining';
        break;
      case 'dining': {
        // 원작: Backstage, Storage, West Hall 중 랜덤
        const r = Math.random();
        if      (r < 0.33) a.pos = 'backstage';
        else if (r < 0.66) a.pos = 'storage';
        else               a.pos = 'westHall';
        break;
      }
      case 'backstage':
        // Backstage에서 West Hall로 진행
        a.pos = 'westHall';
        break;
      case 'storage':
        // Storage에서 West Hall로 진행
        a.pos = 'westHall';
        break;
      case 'westHall':
        a.pos = 'westHallCorner';
        break;
      case 'westHallCorner':
        a.pos = 'leftDoor';
        break;
      case 'leftDoor':
        if (!this.leftDoorClosed) {
          // 문이 열려있으면 즉시 공격이 아니라 사무실로 몰래 침입
          a.inOffice = true;
          this.leftDoorJam = true;
          this.leftLightJam = true;
        } else {
          // 문이 닫혀있으면 떠남
          a.pos = Math.random() < 0.5 ? 'dining' : 'backstage';
        }
        break;
    }
  }

  // =====================================================================
  // 생지 (Chica 고증)
  // 이동경로: Stage → Dining → Restrooms/Kitchen → E.Hall → E.Hall Corner
  // Night 1: AI=0이지만 3AM에 강제 활성화
  // =====================================================================
  updateSaengji(dt) {
    const a = this.animatronics.saengji;

    // Night 1 scripted movement: 3AM부터 강제 활성화
    if (this.night === 1 && this.currentHour >= 3 && a.ai === 0) {
      a.ai = 1;
    }

    if (a.ai <= 0) return;

    a.moveTimer += dt;
    if (a.moveTimer >= AI_INTERVAL) {
      a.moveTimer = 0;
      const roll = Math.floor(Math.random() * 20) + 1;
      if (roll <= a.ai) {
        this.moveSaengji();
      }
    }
  }

  moveSaengji() {
    const a = this.animatronics.saengji;
    // 원작 치카 이동 경로:
    // Stage → Dining → Restrooms OR Kitchen → East Hall → East Hall Corner
    switch (a.pos) {
      case 'stage':
        a.pos = 'dining';
        break;
      case 'dining': {
        // 원작: Restrooms 또는 Kitchen으로
        a.pos = Math.random() < 0.5 ? 'restroom' : 'kitchen';
        break;
      }
      case 'restroom':
        a.pos = 'eastHall';
        break;
      case 'kitchen':
        a.pos = 'eastHall';
        break;
      case 'eastHall':
        a.pos = 'eastHallCorner';
        break;
      case 'eastHallCorner':
        a.pos = 'rightDoor';
        break;
      case 'rightDoor':
        if (!this.rightDoorClosed) {
          // 문이 열려있으면 즉시 공격이 아니라 사무실로 몰래 침입
          a.inOffice = true;
          this.rightDoorJam = true;
          this.rightLightJam = true;
        } else {
          // 문이 닫혀있으면 떠남
          a.pos = Math.random() < 0.5 ? 'dining' : 'restroom';
        }
        break;
    }
  }

  // =====================================================================
  // 엔시 (Freddy 고증)
  // 이동경로: Stage → Dining → Restrooms → Kitchen → E.Hall → E.Hall Corner
  // 특수: 카메라로 보고 있으면 이동 불가 (어둠 속에서만 이동)
  // 정전 시 특수 행동
  // =====================================================================
  updateEnsi(dt) {
    const a = this.animatronics.ensi;
    if (a.ai <= 0) return;

    // 생지와 안톤이 무대에서 모두 벗어나야 엔시가 활동을 시작함
    if (this.animatronics.anton.pos === 'stage' || this.animatronics.saengji.pos === 'stage') {
      return;
    }

    a.moveTimer += dt;
    if (a.moveTimer >= AI_INTERVAL) {
      a.moveTimer = 0;

      // 원작 프레디 핵심 메카닉:
      const ensiCam = POS_TO_CAM[a.pos];
      let isBeingWatched = this.cameraUp && (this.currentCam === ensiCam);

      // 오른쪽 문앞(cam4b)에 있을 때, 마지막으로 본 카메라가 cam4b라면 
      // 모니터가 내려가 있어도 공격이 차단됨 (일명 Freddy stall 전략)
      if (a.pos === 'eastHallCorner' && this.currentCam === 'cam4b') {
        isBeingWatched = true;
      }

      if (!isBeingWatched) {
        const roll = Math.floor(Math.random() * 20) + 1;
        if (roll <= a.ai) {
          this.moveEnsi();
        }
      }
    }
  }

  moveEnsi() {
    const a = this.animatronics.ensi;
    const prevPos = a.pos;
    // 원작 프레디 이동 경로 (엄격히 순서대로):
    // Stage → Dining → Restrooms → Kitchen → East Hall → East Hall Corner
    switch (a.pos) {
      case 'stage':
        a.pos = 'dining';
        break;
      case 'dining':
        a.pos = 'restroom';
        break;
      case 'restroom':
        a.pos = 'kitchen';
        break;
      case 'kitchen':
        a.pos = 'eastHall';
        break;
      case 'eastHall':
        a.pos = 'eastHallCorner';
        break;
      case 'eastHallCorner':
        if (!this.rightDoorClosed) {
          // 프레디는 오른쪽 문이 열려있으면 사무실로 몰래 침입
          a.inOffice = true;
        }
        break;
    }
    // 이동했으면 음성 재생 (원작 프레디 웃음소리)
    if (a.pos !== prevPos) {
      this.audio.playEnsiMove();
    }
  }

  // =====================================================================
  // 코즈 (Foxy 고증)
  // 파이렛 코브 4단계 → 왼쪽 복도 대시 → 왼쪽 문 공격
  // 카메라 켤 때 AI 억제됨 (FNAF 1 고증)
  // 떠난 후(stage 3) CAM 2A 확인 시 달리기 트리거, 미확인 시 유예기간 후 달리기
  // =====================================================================
  updateKoz(dt) {
    const a = this.animatronics.koz;
    if (a.ai <= 0) return;

    // 달리기 상태
    if (a.running) {
      a.runTimer += dt;
      if (a.runTimer >= 1.8) {
        if (this.leftDoorClosed) {
          // 문 닫혀있으면 노크 + 전력 소모
          this.audio.playKnock(4);
          const drain = 1 + (a.knockCount || 0) * 5; // 점진적 전력 소모량 증가
          a.knockCount = Math.min((a.knockCount || 0) + 1, 3);
          this.power = Math.max(0, this.power - drain);
          a.stage = 0;
          a.running = false;
          a.runTimer = 0;
          a.missingTimer = 0;
          a.moveTimer = 0; // 잠시 대기
        } else {
          this.triggerJumpscare('koz');
        }
      }
      return;
    }

    // 탈출(stage 3) 후 로직
    if (a.stage >= 3) {
      a.missingTimer = (a.missingTimer || 0) + dt;

      if (this.cameraUp && this.currentCam === 'cam2a') {
        // West Hall 확인 시 달리기 시작 (영상 재생)
        a.running = true;
        a.runTimer = 0;
        this.triggerFoxyRunVideo();
      } else if (a.missingTimer > 25.0) {
        // 25초 이상 방치하면 무조건 달리기 시작
        a.running = true;
        a.runTimer = 0;
      }
      return;
    }

    // 카메라 켜져있으면 폭시 AI 타이머 억제됨 (진행 안됨)
    if (this.cameraUp) {
      // 파이렛 코브를 볼 때만 foxyWatchCount 증가
      if (this.currentCam === 'cam1c') {
        this.foxyWatchCount = (this.foxyWatchCount || 0) + dt;
        if (this.foxyWatchCount > 10 && a.stage > 0) {
          a.stage = Math.max(0, a.stage - 1);
          this.foxyWatchCount = 0;
        }
      } else {
        this.foxyWatchCount = 0;
      }
      this.foxyNotWatched = 0;
      return; // 카메라도 보는 중이면 폭시 이동 검사 안 함
    } else {
      this.foxyWatchCount = 0;
      this.foxyNotWatched += dt;

      // 원작 고증: 스턴 타이머가 활성화되어 있으면 타이머만 감소시키고 이동 로직은 스킵
      if (a.stunTimer > 0) {
        a.stunTimer -= dt;
        if (a.stunTimer > 0) return;
      }
    }

    a.moveTimer += dt;
    if (a.moveTimer >= FOXY_CHECK_INTERVAL) {
      a.moveTimer = 0;

      const roll = Math.floor(Math.random() * 20) + 1;
      if (roll <= a.ai) {
        // 안 보고 있을 때만 단계 진행
        a.stage = Math.min(a.stage + 1, 3);
        this.foxyNotWatched = 0;
      }
    }
  }

  triggerFoxyRunVideo() {
    this.audio.playFootsteps();
    this.el['foxy-run-video'].style.display = 'block';
    this.el['camera-feed'].style.display = 'none';
    this.el['foxy-run-video'].play().catch(()=>{});
  }

  // =====================================================================
  // 우구라 (Golden Freddy 고증)
  // 조건: CAM 2B에서 포스터가 우구라로 변경 → 카메라 내리면 사무실에 등장
  //       카메라 올리면 사라짐, 5초 내에 안 올리면 점프스케어 → 게임 크래시
  // =====================================================================
  updateUgura(dt) {
    const a = this.animatronics.ugura;
    if (a.triggered) return;

    // CAM 2B 감시 중 극히 낮은 확률로 포스터 변경
    if (this.cameraUp && this.currentCam === 'cam2b') {
      if (Math.random() < 0.00008) {
        a.active = true;
      }
    }

    // 포스터 변경 후 카메라를 내리면 우구라 등장
    if (a.active && !this.cameraUp && !a.inOffice) {
      a.inOffice = true;
      a.officeTimer = 0;
      // 사무실에 우구라 오버레이 표시
      this.el['ugura-office'].src = './' + IMG.uguraOffice;
      this.el['ugura-office'].style.display = 'block';
    }

    // 사무실에 우구라가 있는 상태
    if (a.inOffice) {
      a.officeTimer = (a.officeTimer || 0) + dt;

      // 카메라를 올리면 우구라 사라짐
      if (this.cameraUp) {
        a.active = false;
        a.inOffice = false;
        a.triggered = false;
        this.el['ugura-office'].style.display = 'none';
        return;
      }

      // 5초 내에 카메라 안 올리면 점프스케어
      if (a.officeTimer >= 5) {
        a.triggered = true;
        this.el['ugura-office'].style.display = 'none';
        this.triggerJumpscare('ugura');
      }
    }
  }

  // ===== JUMPSCARE =====
  triggerJumpscare(character) {
    if (this.state !== 'playing' && this.state !== 'powerOut') return;

    this.state = 'jumpscare';
    this.jumpscareTimer = 2.0;
    this.jumpscareChar = character;

    // Stop all audio
    this.audio.stopAll();

    // Play character-specific jumpscare sound
    this.audio.playJumpscareSound(character);

    // Show jumpscare screen
    let jumpImg = IMG.jumpscare[character] || IMG.office.normal;
    this.el['jumpscare-img'].src = './' + jumpImg;

    this.hideScreen('game-screen');
    this.hideScreen('powerout-screen');
    this.showScreen('jumpscare-screen');

    // Camera static stops
    this.cameraStatic.stop();
  }

  updateJumpscare(dt) {
    this.jumpscareTimer -= dt;
    if (this.jumpscareTimer <= 0) {
      // 우구라: 원작에서는 게임 강제 크래시
      if (this.jumpscareChar === 'ugura') {
        try {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('quit-app');
        } catch(e) {
          window.close();
        }
      } else {
        this.onGameOver();
      }
    }
  }

  // ===== POWER OUT =====
  onPowerOut() {
    if (this.state !== 'playing') return;
    this.state = 'powerOut';
    this.powerOutPhase = 0;
    this.powerOutTimer = 0;

    // Close everything
    this.leftDoorClosed = false;
    this.rightDoorClosed = false;
    this.leftLightOn = false;
    this.rightLightOn = false;
    this.cameraUp = false;

    // Stop audio
    this.audio.stopAll();
    this.audio.playPowerDown();
    this.cameraStatic.stop();

    // Show dark office
    this.hideScreen('game-screen');
    this.el['powerout-img'].src = './' + IMG.office.powerOut;
    this.showScreen('powerout-screen');
  }

  updatePowerOut(dt) {
    this.powerOutTimer += dt;

    // Time continues to advance during power out - player can survive to 6AM
    this.timeElapsed += dt;
    const currentHour = Math.min(Math.floor(this.timeElapsed / HOUR_DURATION), 6);
    if (currentHour >= 6) {
      this.onSixAM();
      return;
    }

    switch (this.powerOutPhase) {
      case 0: // Dark, wait 3-5 seconds
        if (this.powerOutTimer >= 3 + Math.random() * 2) {
          this.powerOutPhase = 1;
          this.powerOutTimer = 0;
          // Show Ensi with flickering face
          this.el['powerout-img'].src = './' + IMG.office.powerOutEnsi;
          this.musicDuration = this.audio.playMusicBox();
        }
        break;

      case 1: // Ensi visible with music
        // Flicker effect
        if (Math.random() < 0.02) {
          this.el['powerout-img'].style.opacity = '0';
          setTimeout(() => {
            if (this.el['powerout-img']) {
              this.el['powerout-img'].style.opacity = '1';
            }
          }, 100 + Math.random() * 200);
        }

        if (this.powerOutTimer >= this.musicDuration + 2) {
          this.powerOutPhase = 2;
          this.powerOutTimer = 0;
          // Go dark again
          this.el['powerout-img'].src = './' + IMG.office.powerOut;
        }
        break;

      case 2: // Wait for jumpscare or 6AM
        // Random jumpscare after 5-20 seconds
        if (this.powerOutTimer >= 5 + Math.random() * 15) {
          this.triggerJumpscare('ensi');
        }
        break;
    }
  }

  // ===== 6AM WIN =====
  onSixAM() {
    this.state = 'win';
    this.winTimer = 5;

    // Stop everything
    this.audio.stopAll();
    this.audio.stopFanFile();
    this.cameraStatic.stop();

    // Play chime
    this.audio.playChime();

    // Show win screen
    this.hideScreen('game-screen');
    this.hideScreen('powerout-screen');
    this.showScreen('win-screen');

    // Update save
    if (this.night < 5) {
      this.continueNight = this.night + 1;
    } else {
      this.continueNight = 5;
    }

    if (this.night >= this.maxNight || this.isCustomNight) {
      if (this.night === 7 || this.isCustomNight) {
        this.maxNight = Math.max(this.maxNight, 8);
      } else {
        this.maxNight = Math.max(this.maxNight, this.night + 1);
      }
    }
    this.save();
  }

  updateWin(dt) {
    this.winTimer -= dt;
    if (this.winTimer <= 0) {
      this.hideScreen('win-screen');

      // Night 5, 6, 7 클리어 → 엔딩 화면 표시
      if (this.night === 5) {
        this.showEnding('night5');
      } else if (this.night === 6) {
        this.showEnding('night6');
      } else if (this.night >= 7 || this.isCustomNight) {
        if (this.is420Mode) {
          this.showEnding('mode420');
        } else {
          this.showEnding('night7');
        }
      } else if (this.night < 5) {
        // Night 1~4: 다음 밤으로 자동 진행
        this.startNight(this.night + 1);
      } else {
        this.showMenu();
      }
    }
  }

  // ===== ENDING SCREEN =====
  showEnding(type) {
    this.state = 'ending';
    this.endingTimer = 8;

    const endingImg = IMG.ending[type] || IMG.ending.night5;
    this.el['ending-img'].src = './' + endingImg;
    this.showScreen('ending-screen');
  }

  updateEnding(dt) {
    this.endingTimer -= dt;
    if (this.endingTimer <= 0) {
      this.hideScreen('ending-screen');
      this.showMenu();
    }
  }

  // ===== GAME OVER =====
  onGameOver() {
    this.state = 'gameOver';
    this.gameOverTimer = 4;

    this.audio.stopAll();
    this.audio.stopFanFile();
    this.cameraStatic.stop();

    this.hideScreen('jumpscare-screen');
    this.showScreen('gameover-screen');
  }

  updateGameOver(dt) {
    this.gameOverTimer -= dt;
    if (this.gameOverTimer <= 0) {
      this.hideScreen('gameover-screen');
      this.state = 'menu';
      this.showMenu();
    }
  }
}


// =============================================================================
// INITIALIZATION
// =============================================================================
window.addEventListener('DOMContentLoaded', () => {
  window.game = new FNAFGame();
});
