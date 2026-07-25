/**
 * Notification, Sound Alert, Vibration & GPS Location Utility
 * Maudaha Mart E-Commerce Platform
 */

// 1. Web Audio API Alert Chime (Order Ringtone)
export function playOrderAlertSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Resume audio context if suspended by browser autoplay policy
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Loud, multi-tone order alert chime sequence (E5 -> G5 -> C6 -> E6)
    const tones = [
      { freq: 659.25, start: 0, duration: 0.18 },
      { freq: 783.99, start: 0.18, duration: 0.18 },
      { freq: 1046.50, start: 0.36, duration: 0.25 },
      { freq: 1318.51, start: 0.65, duration: 0.40 }
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      
      // Volume envelope
      gain.gain.setValueAtTime(0, now + t.start);
      gain.gain.linearRampToValueAtTime(0.4, now + t.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t.start);
      osc.stop(now + t.start + t.duration);
    });
  } catch (err) {
    console.warn('Audio alert unavailable:', err);
  }
}

// 2. Haptic Vibration Helper
export function triggerHapticVibration(pattern: number[] = [400, 150, 400, 150, 600]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (err) {
      console.warn('Vibration API error:', err);
    }
  }
}

// 3. Browser Push Notification Permission Request
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (err) {
    console.warn('Notification permission error:', err);
  }
  return false;
}

// 4. Combined Order Alert Trigger (Push Notification + Sound + Vibration)
export function triggerOrderAlert(title: string, body: string, vibratePattern = [400, 150, 400, 150, 800]) {
  // Always play audio sound & vibrate immediately
  playOrderAlertSound();
  triggerHapticVibration(vibratePattern);

  // If Notification permission is granted, send push pop-up notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'maudaha-order-' + Date.now(),
        requireInteraction: true
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Native notification trigger failed:', err);
    }
  }
}

// 5. GPS Geolocation Helpers
export function getCurrentGPSLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

export function watchGPSLocation(
  onLocationUpdate: (coords: { lat: number; lng: number; speed?: number | null; heading?: number | null }) => void,
  onError?: (error: GeolocationPositionError) => void
): number | null {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return null;
  }

  return navigator.geolocation.watchPosition(
    (pos) => {
      onLocationUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speed: pos.coords.speed,
        heading: pos.coords.heading
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000
    }
  );
}
