
// Automatically generated on Sat Mar 26 2022 14:53:08 GMT+0100 (Hora estàndard del Centre d’Europa). Do not modify.
window._modules["cartro"] = {exports: {}};
(function(module){
/**
 * Utilitats per al joc de Bingo 
 * @author Josep Mulet Pol
 * @date 2021-2022
 */

var U = require("utils");

var Cell = function (value, selected) {
    this.value = value;
    this.selected = selected;
};
Cell.prototype.clear = function () {
    this.value = null;
    this.selected = false;
};
Cell.prototype.toggle = function (enabled) { 
    if (!enabled) {
        return;
    }
    this.selected = !this.selected;
};

var NUM_COLS_NB = 3;
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
    list: function () {
        var flatList = [];
        for (var i = 0; i < this.nrows; i++) {
            var aRow = this.rows[i];
            for (var j = 0; j < this.ncols; j++) {
                var cell = aRow[j];
                if (cell.value != null) {
                    //non-void cell
                    flatList.push(cell.selected ? cell.value : null);
                }
            }
        }
        return flatList;
    },
    testLine: function (userNumbers, nombres_trets) {
        if(nombres_trets) {
            this.nombres_trets = nombres_trets;
        }
        // User numbers is a list 3x3, null indicate that is not selected
        var firstWrong = -1;
        for (var i = 0; i < this.nrows; i++) {
            var teLinia = true;
            for (var j = 0; j < NUM_COLS_NB; j++) {
                var indx = i * NUM_COLS_NB + j;
                var valor = userNumbers[indx];
                if (valor == null) {
                    // Not set --> this is not a line 
                    teLinia = false;
                    break;
                }
                teLinia = this.nombres_trets.indexOf(valor) >= 0;
                if (!teLinia) {
                    firstWrong = indx;
                    break;
                }
            }
            if (teLinia) {
                return [true];
            }
        }
        return [false, firstWrong];
    },
    testBingo: function (userNumbers, nombres_trets) {
        if(nombres_trets) {
            this.nombres_trets = nombres_trets;
        }
        // User numbers is a list 3x3, null indicate that is not selected
        // if a null is found, must return false
        for (var i = 0; i < this.nrows; i++) {
            for (var j = 0; j < NUM_COLS_NB; j++) {
                var indx = i * NUM_COLS_NB + j;
                var valor = userNumbers[indx];
                if (valor == null || this.nombres_trets.indexOf(valor) < 0) {
                    return [false, indx];
                }
            }
        } 
        return [true];
    },
    mark: function(num) {
        for (var i = 0; i < this.nrows; i++) {
            for (var j = 0; j < NUM_COLS_NB; j++) { 
                var celda = this.getCellAt(i,j);
                if (celda.value!=null && celda.value == num) { 
                    celda.selected = true;
                    return;
                }
            }
        } 
    }
};


module.exports = Cartro;

}(window._modules["cartro"] ));
