/**
 * Utilitats per al joc de Bingo 
 * @author Josep Mulet Pol
 * @date 2021-2022
 */
window._modules["BingoUtils"] = {exports: {}};

(function (module) {  

    var findVoice = function (lang, voices) {
        lang = (lang || "").toLowerCase();
        var k = 0;
        var voice = null;
        var len = (voices || []).length;
        while (k < len && voice == null) {
            if (voices[k].lang.toLowerCase() == lang) {
                voice = voices[k];
            }
            k++;
        }
        return voice;
    };

    var speak = function(textmap) {
        if(!supported) {
            return;
        }
        var voices = speechSynthesis.getVoices();
        var lang = "ca-ES";
        var voice = findVoice(lang, voices);
        if(!voice) {
            lang = "es-ES";
            voice = findVoice(lang, voices); 
        }
        if(voice) {
            var utterance = new SpeechSynthesisUtterance(textmap[lang]);
            utterance.voice = voice;
            synth.speak(utterance);
        } 
    };

    var synth = window.speechSynthesis;
    var supported = synth != null && window.SpeechSynthesisUtterance != null;
    if (!supported) {
        console.error("Voices not supported");    
    }
  
    module.exports = { 
        speak: speak
    } 

})(window._modules["BingoUtils"]);