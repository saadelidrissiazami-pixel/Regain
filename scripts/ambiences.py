"""Ambiances calmes originales pour Regain, en boucles sans couture.

Tout est synthétisé ici (aucun échantillon externe) : les fichiers appartiennent au projet.

Régénérer (macOS, sans dépendance) :
    python3 scripts/ambiences.py /tmp/regain-audio
    for n in nappe pluie vagues bol; do
      afconvert -f m4af -d aac -b 64000 -q 127 /tmp/regain-audio/$n.wav assets/audio/$n.m4a
    done
Chaque composante périodique fait un nombre entier de cycles sur la durée de la boucle ; les
parties bruitées sont fondues de la fin vers le début pour que la boucle ne s'entende pas.
"""
import math
import random
import struct
import sys
import wave
from array import array

RATE = 22050
LOOP = 96  # secondes
N = RATE * LOOP
TAU = 2 * math.pi


def snap(freq: float) -> float:
    """Arrondit une fréquence pour qu'elle fasse un nombre entier de cycles sur la boucle."""
    return round(freq * LOOP) / LOOP


def write_wav(path: str, samples, target_rms: float, peak_cap: float = 0.9):
    rms = math.sqrt(sum(s * s for s in samples) / len(samples)) or 1.0
    peak = max(abs(s) for s in samples) or 1.0
    gain = min(target_rms / rms, peak_cap / peak)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = bytearray()
        for s in samples:
            v = max(-1.0, min(1.0, s * gain))
            frames += struct.pack("<h", int(v * 32767))
        w.writeframes(bytes(frames))


def loop_crossfade(samples, fade_seconds: float):
    """samples couvre LOOP + fade : la fin est fondue dans le début (puissance constante)."""
    fade = int(fade_seconds * RATE)
    out = array("f", samples[:N])
    for i in range(fade):
        x = i / fade
        head = math.sin(x * math.pi / 2)
        tail = math.cos(x * math.pi / 2)
        out[i] = samples[i] * head + samples[N + i] * tail
    return out


def one_pole_lowpass(samples, cutoff: float, passes: int = 1):
    a = math.exp(-TAU * cutoff / RATE)
    out = array("f", samples)
    for _ in range(passes):
        y = 0.0
        # deux tours pour que l'état du filtre soit stable au raccord de la boucle
        for _warm in range(2):
            for i in range(len(out)):
                y = (1 - a) * out[i] + a * y
                if _warm == 1:
                    out[i] = y
            # premier tour : on ne garde rien
    return out


def nappe():
    """Nappe douce : accord de la mineur 9 qui respire lentement."""
    voices = [
        (110.00, 0.30, 2), (164.81, 0.22, 3), (220.00, 0.20, 4),
        (246.94, 0.10, 5), (261.63, 0.16, 3), (329.63, 0.12, 2),
    ]
    table_size = 4096
    table = [math.sin(TAU * i / table_size) for i in range(table_size)]
    out = array("f", [0.0]) * N
    for freq, amp, lfo_cycles in voices:
        f1 = snap(freq)
        f2 = snap(freq + 0.21)  # léger désaccord : battement très lent, chaleureux
        f3 = snap(freq * 2)
        phase_lfo = random.random() * TAU
        inc1, inc2, inc3 = f1 * table_size / RATE, f2 * table_size / RATE, f3 * table_size / RATE
        p1 = p2 = p3 = 0.0
        lfo_w = TAU * lfo_cycles / N
        for i in range(N):
            env = 0.55 + 0.45 * math.sin(lfo_w * i + phase_lfo)
            s = table[int(p1) % table_size] + table[int(p2) % table_size] + 0.18 * table[int(p3) % table_size]
            out[i] += amp * env * s
            p1 += inc1
            p2 += inc2
            p3 += inc3
    return one_pole_lowpass(out, 1800)


def pink(n: int, rng: random.Random):
    """Bruit rose (filtre de Paul Kellet)."""
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
    out = array("f", [0.0]) * n
    for i in range(n):
        w = rng.uniform(-1, 1)
        b0 = 0.99886 * b0 + w * 0.0555179
        b1 = 0.99332 * b1 + w * 0.0750759
        b2 = 0.96900 * b2 + w * 0.1538520
        b3 = 0.86650 * b3 + w * 0.3104856
        b4 = 0.55000 * b4 + w * 0.5329522
        b5 = -0.7616 * b5 - w * 0.0168980
        out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
        b6 = w * 0.115926
    return out


def pluie():
    """Pluie légère : rideau de bruit rose adouci, et gouttes éparses."""
    rng = random.Random(7)
    fade = 4.0
    total = N + int(fade * RATE)
    bed = one_pole_lowpass(pink(total, rng), 3200)
    out = array("f", (s * 0.8 for s in bed))
    t = 0.0
    while t < total / RATE:
        t += rng.expovariate(9)  # ~9 gouttes par seconde
        start = int(t * RATE)
        freq = rng.uniform(1800, 4200)
        amp = rng.uniform(0.02, 0.09) * (3 if rng.random() < 0.05 else 1)
        length = int(RATE * 0.025)
        for k in range(length):
            idx = start + k
            if idx >= total:
                break
            out[idx] += amp * math.exp(-k / (RATE * 0.004)) * math.sin(TAU * freq * k / RATE)
    return loop_crossfade(out, fade)


def vagues():
    """Vagues : bruit brun porté par une houle lente (10 vagues par boucle)."""
    rng = random.Random(11)
    fade = 6.0
    total = N + int(fade * RATE)
    brown = array("f", [0.0]) * total
    b = 0.0
    for i in range(total):
        b = b * 0.9985 + rng.uniform(-1, 1) * 0.05
        brown[i] = b
    foam = one_pole_lowpass(pink(total, rng), 2600)
    out = array("f", [0.0]) * total
    w = TAU * 10 / N
    for i in range(total):
        swell = (1 - math.cos(w * i)) / 2  # 0 → 1 → 0 sur chaque vague
        env = 0.25 + 0.75 * swell ** 1.6
        out[i] = brown[i] * env + foam[i] * 0.35 * swell ** 3
    return loop_crossfade(one_pole_lowpass(out, 1400), fade)


def bol():
    """Bol chantant : une frappe toutes les 16 s, sur un bourdon très doux."""
    rng = random.Random(3)
    base = 196.0  # sol grave
    partials = [(1.0, 1.0, 11.0), (2.76, 0.45, 7.0), (5.40, 0.22, 4.0), (8.93, 0.10, 2.0)]
    out = array("f", [0.0]) * N
    # Bourdon : quinte grave qui respire, en cycles entiers sur la boucle
    for freq, amp in ((snap(98.0), 0.07), (snap(147.0), 0.04)):
        for i in range(N):
            out[i] += amp * (0.6 + 0.4 * math.sin(TAU * 3 * i / N)) * math.sin(TAU * freq * i / RATE)
    strikes = [0, 16, 32, 48, 64, 80]
    ring = 22  # secondes de résonance calculées par frappe
    for s in strikes:
        start = s * RATE
        velocity = rng.uniform(0.8, 1.0)
        for ratio, amp, decay in partials:
            f = snap(base * ratio)
            beat = snap(base * ratio + 0.5)
            for k in range(ring * RATE):
                idx = (start + k) % N  # la résonance qui dépasse la boucle revient au début
                t = k / RATE
                attack = min(1.0, k / (RATE * 0.006))
                env = attack * math.exp(-t / decay)
                out[idx] += velocity * amp * 0.5 * env * (math.sin(TAU * f * t) + math.sin(TAU * beat * t))
    return one_pole_lowpass(out, 3000)


TRACKS = {
    "nappe": (nappe, 0.10),
    "pluie": (pluie, 0.10),
    "vagues": (vagues, 0.11),
    "bol": (bol, 0.08),
}

if __name__ == "__main__":
    out_dir = sys.argv[1]
    for name in sys.argv[2:] or TRACKS:
        fn, rms = TRACKS[name]
        random.seed(42)
        samples = fn()
        write_wav(f"{out_dir}/{name}.wav", samples, rms)
        print("ok", name, flush=True)
