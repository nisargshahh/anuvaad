const selectVoice = document.querySelector("#selectVoice");
const platBtn = document.querySelector("#playButton");
const textInp = document.querySelector("textarea");
const languageSelect = document.querySelector("#languageSelect");

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
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
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error("Translation Error: ", error);
    alert("Failed to translate text");
    return text;
  }
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
    const translatedText = await translateText(text, targetLang);
    playText(translatedText, selectedVoiceIndex);
  } catch (error) {
    console.error("Error during processing: ", error);
    alert("An error occurred");
  }
});
