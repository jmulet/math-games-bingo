/**
 * Utilitats per al joc de Bingo 
 * @author Josep Mulet Pol
 * @date 2021-2022
 */
window._modules["BingoUtils"] = {exports: {}};

(function (module) { 

    var U = require("utils");

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

    var Cell = function(value, selected) {
        this.value = value;
        this.selected = selected;
    };
    Cell.prototype.clear = function() {
        this.value = null;
        this.selected = false;
    }; 
    Cell.prototype.toggle = function(enabled) {
        console.log("Cell toogle ", enabled);
        if(!enabled) {
            return;
        }
        this.selected = !this.selected;
    }; 

    var Cartro = function () { 
        this.nrows = 3;
        this.ncols = 6;
        this.rows = [];
        for (var i = 0; i < this.nrows; i++) {
            var aRow = [];
            for (var j = 0; j < this.ncols; j++) {
                aRow.push(new Cell(null, false));
            }
            this.rows.push(aRow);     
        }
        this.generate();
    };
    Cartro.prototype = {
        generate: function () { 
            // For every row, must set 3 cells as void
            var void_candidates = [];
            for (var i = 0; i < this.nrows; i++) {
                void_candidates.push(U.sort(U.shuffle(U.range(0, this.ncols - 1)), 3));
            }
            // For every col, up to 3 values in a given range 
            var a = 1;
            for (var j = 0; j < this.ncols; j++) {
                var cols_candidates = U.sort(U.shuffle(U.range(a, a + 4)), this.nrows);
                var posIndx = 0;
                for (var i = 0; i < this.nrows; i++) {
                    var val = null;
                    if (void_candidates[i].indexOf(j) < 0) {
                        val = cols_candidates[posIndx];
                        posIndx++;
                    }
                    this.getCellAt(i, j).value = val;
                }
                a += 5;
            }
        },
        clear: function () {
            for (var i = 0; i < this.nrows; i++) {
                for (var j = 0; j < this.ncols; j++) {
                    this.getCellAt(i, j).clear();
                }
            }
        },
        getRows: function () {
            return this.rows;
        }, 
        getCellAt: function (i, j) {
            return this.rows[i][j];
        },
        list: function() {
            var flatList = [];
            for (var i = 0; i < this.nrows; i++) {
                var aRow = this.rows[i];
                for (var j = 0; j < this.ncols; j++) {
                    var cell = aRow[j];
                    if(cell.value != null) {
                        //non-void cell
                        flatList.push(cell.selected? cell.value: null);
                    }
                }    
            }
            return flatList;
        }
    };

    module.exports = {
        Cartro: Cartro,
        speak: speak
    } 

})(window._modules["BingoUtils"]);