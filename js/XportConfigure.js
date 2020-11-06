let extensionSettings;

$(document).ready(function() {
    tableau.extensions.initializeDialogAsync().then(function(openPayload) {
        let settings = tableau.extensions.settings.get('xpanditWritebackSettings');
        extensionSettings = settings ? JSON.parse(settings) : {};
        console.log("Settings: ", extensionSettings);
        if(extensionSettings.configured===undefined){clearSettings();}
        populateSheetList();
        setWorkSheet();
        console.log("Writeback Settings");
        console.log(extensionSettings);
    });
    updateOnResize();
    window.onresize = function(event) {
        updateOnResize();
    };
});

function updateOnResize(){
    var top = $('#config-top').height();
    var bottom = $('#config-bottom').height();
    var height = $(document).height() - top - bottom - 5;
    document.getElementById('config-container').style.height = height+"px";
    document.getElementById('config-container').style.marginTop = top+"px";
}

// Gets list of worksheets in workbook and populates dropdown
function populateSheetList() {
    console.log('Populating workSheet list.');
    document.getElementById('divWorksheetSelector').style.display = "flex";

    let options = "";
    let t = 0;
    for (ws of tableau.extensions.dashboardContent.dashboard.worksheets) {
        console.log("Sheet Name: "+ws.name);
        let sheet = extensionSettings.sheet;
        if(sheet === ws.name){
            options += "<option value='" + ws.name + "' selected='selected'>" + ws.name + "</option>";
        }else{
            options += "<option value='" + ws.name + "'>" + ws.name + "</option>";
        }
        t++
    }
    if (t == 0) {
        document.getElementById('wsheetselect').innerHTML = "<option value='' disabled>No fields found</option>";
    } else {
        document.getElementById('wsheetselect').innerHTML = options;
        document.getElementById('wsheetselect').disabled = false;
    }
}

function setWorkSheet(){
    let sheet = document.getElementById('wsheetselect').value;
    console.log('Setting sheet to ' + sheet + '.');

    extensionSettings.sheet = sheet;

    validateConfiguration();
}

function validateConfiguration(){
    var rtn = true;
    let sheet = extensionSettings.sheet;
    if(sheet === undefined){rtn=false;}
    if(rtn){
        document.getElementById('wsheetselect').placeholder = sheet;
    }
    document.getElementById('submit').disabled = false;
    return rtn;
}

function submit() {
    setWorkSheet();
    extensionSettings.configured = true;
    logSettings();
    tableau.extensions.settings.set('xpanditWritebackSettings',JSON.stringify(extensionSettings));
    tableau.extensions.settings.saveAsync().then(result => {
        tableau.extensions.ui.closeDialog("value");
    });
}

function clearSettings() {
    console.log("Clearing settings.");
    extensionSettings.configured = false;
    tableau.extensions.settings.set('xpanditWritebackSettings',JSON.stringify(extensionSettings));
    tableau.extensions.settings.saveAsync();
    document.getElementById('submit').disabled = true;
    console.log(tableau.extensions.settings.getAll());
    validateConfiguration();
}

function logSettings(){
    console.log("Settings Stored");
    console.log(tableau.extensions.settings.getAll());
    console.log("Settings to Store");
    console.log(extensionSettings);
};
