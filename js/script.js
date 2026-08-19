
function startTime() {
    var txtEl = document.getElementById('txt');
    if (!txtEl) return;
    var today = new Date();
    txtEl.textContent = today.toLocaleTimeString();
    setTimeout(startTime, 500);
}

function num(evt) {
    var e = evt || window.event;
    var code = e.keyCode || e.which;
    var msgEl = document.getElementById('msg');
    if ((code > 47 && code < 58) || (code === 10) || (code === 46) || (code === 13)) {
        if (msgEl) msgEl.textContent = '';
    } else {
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
        if (msgEl) msgEl.textContent = 'You should enter only Numeric value !';
    }
}

function alpha(evt) {
    var e = evt || window.event;
    var code = e.keyCode || e.which;
    var msgEl = document.getElementById('msg');
    if ((code > 64 && code < 91) || (code > 96 && code < 122) || (code === 32) || (code === 46) || (code === 13)) {
        if (msgEl) msgEl.textContent = '';
    } else {
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;
        if (msgEl) msgEl.textContent = 'You should enter only Alphabets !';
    }
}

function PopupWindow(url) {
    var varCustomFeatures = 'titlebar=no, status=no,menubar=no,resizable=yes, scrollbars=no,toolbar=no,location=no,directories=no,left=0,top=0,height=500,width=700';
    window.open(url, '_blank', varCustomFeatures);
}

function Check_Click(objRef) {
    //Get the Row based on checkbox
    var row = objRef.parentNode.parentNode;
    if (objRef.checked) {
        //If checked change color to Aqua
        row.style.backgroundColor = "aqua";
    }
    else {
        row.style.backgroundColor = "white";
    }

    //Get the reference of GridView
    var GridView = row.parentNode;

    //Get all input elements in Gridview
    var inputList = GridView.getElementsByTagName("input");

    for (var i = 0; i < inputList.length; i++) {
        //The First element is the Header Checkbox
        var headerCheckBox = inputList[0];

        //Based on all or none checkboxes
        //are checked check/uncheck Header Checkbox
        var checked = true;
        if (inputList[i].type == "checkbox" && inputList[i] != headerCheckBox) {
            if (!inputList[i].checked) {
                checked = false;
                break;
            }
        }
    }
    headerCheckBox.checked = checked;

}
function checkAll(objRef) {
    var GridView = objRef.parentNode.parentNode.parentNode;
    var inputList = GridView.getElementsByTagName("input");
    for (var i = 0; i < inputList.length; i++) {
        //Get the Cell To find out ColumnIndex
        var row = inputList[i].parentNode.parentNode;
        if (inputList[i].type == "checkbox" && objRef != inputList[i]) {
            if (objRef.checked) {
                //If the header checkbox is checked
                //check all checkboxes
                //and highlight all rows
                row.style.backgroundColor = "aqua";
                inputList[i].checked = true;
            }
            else {
                row.style.backgroundColor = "white";
                inputList[i].checked = false;
            }
        }
    }
}
function MouseEvents(objRef, evt) {
    var checkbox = objRef.getElementsByTagName("input")[0];
    if (evt.type == "mouseover") {
        objRef.style.backgroundColor = "orange";
    }
    else {
        if (checkbox.checked) {
            objRef.style.backgroundColor = "aqua";
        }
        else if (evt.type == "mouseout") {
            if (objRef.rowIndex % 2 == 0) {
                objRef.style.backgroundColor = "#C2D69B";
            }
            else {
                objRef.style.backgroundColor = "white";
            }

        }
    }
}