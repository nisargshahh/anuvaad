import {transliterate as tr} from 'https://cdn.jsdelivr.net/npm/transliteration@2.3.5/+esm'
const selectVoice = document.querySelector("#selectVoice");
const platBtn = document.querySelector("#playButton");
const textInp = document.querySelector("textarea");
const languageSelect = document.querySelector("#languageSelect");
const displayTText = document.querySelector("#displayTText");
const pronunciationT = document.querySelector("#pronounciationT");


const languages = [
  { code: "en-IN", name: "English (India)" },
  { code: "hi-IN", name: "Hindi" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
  { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" },
  { code: "mr-IN", name: "Marathi" },
  { code: "bn-IN", name: "Bengali" },
  { code: "gu-IN", name: "Gujarati" },
  { code: "pa-IN", name: "Punjabi" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "ru-RU", name: "Russian" },
  { code: "ar-SA", name: "Arabic" },
  { code: "it-IT", name: "Italian" },
];

function loadLang() {
  languageSelect.innerHTML = languages
    .map(
      (lang) =>
        `<option value = ${lang.code}>${lang.name} (${lang.code})</option>`
    )
    .join();
}

let voices = [];
function loadVoices() {
  voices = speechSynthesis.getVoices();
  selectVoice.innerHTML = voices
    .map(
      (voice, i) =>
        `<option value = "${i}">${voice.name} (${voice.lang})</option>`
    )
    .join();
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
loadLang();

async function translateText(text, targetLang) {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;
    const pronunciation = tr(translatedText) || "No pronunciation available";

    return { translatedText, pronunciation };
  } catch (error) {
    console.error("Translation Error: ", error);
    alert("Failed to translate text");
    return {
      translatedText: text,
      pronunciation: "No pronunciation available",
    };
  }
}

function displayTranslatedText(translatedText, pronunciation) {
  const tt = displayTText.querySelector("#translated-t");
  const pt = pronunciationT.querySelector("#pronounciation-t");

  tt.textContent = translatedText;
  pt.textContent = pronunciation;
}

function playText(text, voiceIndex) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (voices[voiceIndex]) {
    utterance.voice = voices[voiceIndex];
  }
  speechSynthesis.speak(utterance);
}

platBtn.addEventListener("click", async () => {
  const text = textInp.value.trim();
  const targetLang = languageSelect.value;
  const selectedVoiceIndex = selectVoice.value;
  if (!text) {
    alert("Empty Text!");
    return;
  }

  try {
    const { translatedText, pronunciation } = await translateText(
      text,
      targetLang
    );
    displayTranslatedText(translatedText, pronunciation);
    playText(translatedText, selectedVoiceIndex);
  } catch (error) {
    console.error("Error during processing: ", error);
    alert("An error occurred");
  }
});
