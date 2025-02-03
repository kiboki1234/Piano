import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { melodies } from './melodies';
import '../piano_styles.css';

// Configuración del sintetizador
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle', volume: -8 },
  envelope: { attack: 0.02, decay: 0.4, sustain: 0.3, release: 0.5 }
}).toDestination();

// Teclas del piano
const keys = [
  { note: 'C4', keyCode: 'A', type: 'white' }, { note: 'C#4', keyCode: 'W', type: 'black' },
  { note: 'D4', keyCode: 'S', type: 'white' }, { note: 'D#4', keyCode: 'E', type: 'black' },
  { note: 'E4', keyCode: 'D', type: 'white' }, { note: 'F4', keyCode: 'F', type: 'white' },
  { note: 'F#4', keyCode: 'T', type: 'black' }, { note: 'G4', keyCode: 'G', type: 'white' },
  { note: 'G#4', keyCode: 'Y', type: 'black' }, { note: 'A4', keyCode: 'H', type: 'white' },
  { note: 'A#4', keyCode: 'U', type: 'black' }, { note: 'B4', keyCode: 'J', type: 'white' },
  { note: 'C5', keyCode: 'K', type: 'white' }, { note: 'C#5', keyCode: 'O', type: 'black' },
  { note: 'D5', keyCode: 'L', type: 'white' }, { note: 'D#5', keyCode: 'P', type: 'black' },
  { note: 'E5', keyCode: ';', type: 'white' }, { note: 'F5', keyCode: 'Z', type: 'white' },
  { note: 'F#5', keyCode: 'X', type: 'black' }, { note: 'G5', keyCode: 'C', type: 'white' },
  { note: 'G#5', keyCode: 'V', type: 'black' }, { note: 'A5', keyCode: 'B', type: 'white' },
  { note: 'A#5', keyCode: 'N', type: 'black' }, { note: 'B5', keyCode: 'M', type: 'white' },
  { note: 'C6', keyCode: ',', type: 'white' }
];

const Piano = () => {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMelody, setSelectedMelody] = useState(melodies[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(60); // Estado para la velocidad
  const whiteKeys = keys.filter(key => key.type === 'white');
  const whiteKeyIndexMap = new Map(whiteKeys.map((key, index) => [key.note, index]));

  useEffect(() => {
    const initAudio = async () => await Tone.start();
    initAudio();
  }, []);

  // Actualizar BPM en tiempo real
  useEffect(() => {
    Tone.Transport.bpm.value = playbackSpeed;
  }, [playbackSpeed]);

  const playNote = (note) => {
    synth.triggerAttack(note, Tone.now());
    setActiveKeys(prev => new Set([...prev, note]));
  };

  const stopNote = (note) => {
    synth.triggerRelease(note, Tone.now());
    setActiveKeys(prev => new Set([...prev].filter(n => n !== note)));
  };

  const playMelody = async () => {
    if (!selectedMelody) return;

    setIsPlaying(true);
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Cancelar cualquier programación anterior

    let noteIndex = 0; // Índice de la nota actual

    const loop = new Tone.Loop((time) => {
      if (noteIndex >= selectedMelody.notes.length) {
        loop.stop(); // Detener el bucle al finalizar la melodía
        Tone.Transport.stop();
        setIsPlaying(false);
        return;
      }

      const { note, duration } = selectedMelody.notes[noteIndex];
      synth.triggerAttackRelease(note, duration, time);
      setActiveKeys((prev) => new Set([...prev, note]));

      setTimeout(() => {
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
      }, Tone.Time(duration).toMilliseconds());

      noteIndex++; // Avanzar a la siguiente nota
    }, "4n"); // Programar una repetición en cada negra (ajustable según necesidad)

    loop.start(0);
    Tone.Transport.start();
  };

  // Manejo de teclado
  useEffect(() => {
    const handleKey = (event, isKeyDown) => {
      const key = keys.find(k => k.keyCode === event.key.toUpperCase());
      if (key) {
        event.preventDefault();
        isKeyDown ? playNote(key.note) : stopNote(key.note);
      }
    };

    window.addEventListener('keydown', e => handleKey(e, true));
    window.addEventListener('keyup', e => handleKey(e, false));
    return () => {
      window.removeEventListener('keydown', e => handleKey(e, true));
      window.removeEventListener('keyup', e => handleKey(e, false));
    };
  }, []);

  const calculateBlackKeyPosition = (blackKeyNote) => {
    const precedingWhiteKey = keys[keys.findIndex(k => k.note === blackKeyNote) - 1];
    return (whiteKeyIndexMap.get(precedingWhiteKey.note) + 1) * 60 - 20;
  };

  return (
    <div className="piano-container">
      {/* Selector de melodías */}
      <div className="melody-selector">
        <select 
          value={selectedMelody?.name} 
          onChange={(e) => setSelectedMelody(melodies.find(m => m.name === e.target.value))}
        >
          {melodies.map((melody) => (
            <option key={melody.name} value={melody.name}>
              {melody.name}
            </option>
          ))}
        </select>
      </div>

      {/* Teclado */}
      <div className="piano-keyboard">
        {whiteKeys.map(({ note, keyCode }) => (
          <div 
            key={note} 
            className={`white-key ${activeKeys.has(note) ? 'active' : ''}`}
            onMouseDown={() => playNote(note)}
            onMouseUp={() => stopNote(note)}
            onMouseLeave={() => stopNote(note)}
          >
            <span className="key-label">{keyCode}</span>
            <span className="note-label">{note}</span>
          </div>
        ))}

        {keys.filter(key => key.type === 'black').map(({ note, keyCode }) => (
          <div 
            key={note} 
            className={`black-key ${activeKeys.has(note) ? 'active' : ''}`}
            style={{ left: `${calculateBlackKeyPosition(note)}px` }}
            onMouseDown={() => playNote(note)}
            onMouseUp={() => stopNote(note)}
            onMouseLeave={() => stopNote(note)}
          >
            <span className="key-label">{keyCode}</span>
            <span className="note-label">{note}</span>
          </div>
        ))}
      </div>

      {/* Control de velocidad */}
      <div className="speed-control">
        <label>
          Velocidad (BPM): 
          <input
            type="range"
            min="40"
            max="200"
            step="10"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          />
          <span>{playbackSpeed}</span>
        </label>
      </div>

      {/* Botón de reproducción */}
      <div className="melody-selector" style={{ marginTop: '20px' }}>
        <button 
          onClick={playMelody} 
          disabled={isPlaying}
          className="play-button"
          style={{ backgroundColor: isPlaying ? '#95a5a6' : '#2ecc71' }}
        >
          {isPlaying ? '🎵 Reproduciendo...' : `🎹 Tocar ${selectedMelody?.name}`}
        </button>
      </div>
    </div>
  );
};

export default Piano;
