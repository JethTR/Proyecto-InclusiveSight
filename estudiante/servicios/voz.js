// Síntesis de voz con la Web Speech API (instrucciones, ayuda, ubicación).
// El reconocimiento de voz (búsqueda por voz) se completa en la fase 4.

export function decir(texto) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es';
  speechSynthesis.speak(frase);
}
