'use strict';

(function () {

  let extensionSettings;
  let currIdx;
  let ackVal;
  let cnxVal;
  let disableAck;
  let disableCnx;

  $(document).ready(function () {
    console.log(3);
    tableau.extensions.initializeAsync({ 'configure': configure }).then(function () {
      let settings = tableau.extensions.settings.get('xpanditWritebackSettings');
      extensionSettings = settings ? JSON.parse(settings) : {};
      if (extensionSettings.sheet) {
        const worksheet = getSelectedSheet(extensionSettings.sheet);
        worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
          loadSelectedMarks(worksheet);
        });
      } else {
        configure();
      }
      $('#decoy').click(function() {
        document.getElementById('cancel_btn').disabled = false;
        document.getElementById('acknowledge_btn').disabled = false;
      })
    });
  });

  function configure() {
    let extpath = `${window.location.href}`;
    const popupUrl = (extpath.search(/index[\.html]*/i) > 0 ? extpath.replace(/index[\.html]*/i,"configurationPopUp.html") : extpath+"configurationPopUp.html");
    let payload = "";
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 300, width: 500 }).then((closePayload) => {
      let settings = tableau.extensions.settings.get('xpanditWritebackSettings');
      extensionSettings = settings ? JSON.parse(settings) : {};
      let sheetname = extensionSettings.sheet;
      if (sheetname) {
        const worksheet = getSelectedSheet(sheetname);
        worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, function (selectionEvent) {
          loadSelectedMarks(worksheet);
        });
      }
    }).catch((error) => {
        switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
                console.log("Dialog was closed by user.");
                break;
            default:
                console.log(error.message);
        }
    });
  }

  function getSelectedSheet (worksheetName) {
    console.log('get selected sheet');
    if (!worksheetName) {
      worksheetName = extensionSettings.sheet;
    }

    return tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });
  }

  function loadSelectedMarks (worksheet) {
    worksheet.getSelectedMarksAsync().then(function (marks) {
      const worksheetData = marks.data[0];
      worksheetData.columns.map(function(col, idx) {
        let ky = col.fieldName;
        let vl = worksheetData.data[0][idx].value;
        console.log(66, ky, vl);
        if (ky === 'Id') {
          currIdx = vl;
        }
        if (ky === 'Ack') {
          ackVal = vl;
        }
        if (ky === 'Cnx') {
          cnxVal = vl;
        }
      })
      if (ackVal === 1 && cnxVal === 1 || ackVal === 1 && cnxVal === 0 || ackVal === 0 && cnxVal === 1) {
        disableAck = true;
        disableCnx = true;
      }
      document.getElementById('cancel_btn').disabled = disableCnx;
      document.getElementById('acknowledge_btn').disabled = disableAck;
      $('#choose_action').modal('show');
      $('#cancel_btn').click(function() {
        $('#choose_action').modal('hide');
        $('#yn_cancel').modal('show');
      })
      $('#acknowledge_btn').click(function() {
        $('#choose_action').modal('hide');
        $('#yn_ack').modal('show');
      })
      $('#cancel_yes').click(function() {
        console.log(123, 'cancel btn clicked');
        let bdy = {
          action: "Cnx"
        }
        $.ajax({
          type: 'POST',
          url: 'http://localhost:8080/action/' + currIdx,
          cors: true ,
          contentType:'application/json',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*" 
        },
          data: bdy,
          success: function (res) {
            console.log('success response in cancel ', res);
            $('#yn_cancel').modal('hide');
          },
          error: function (err) {
            console.log('error response in cancel ', err);
            $('#yn_cancel').modal('hide');
          }
        })
      });
      $('#ack_yes').click(function() {
        console.log(456, 'ack btn clicked');
        let bdy = {
          action: "Ack"
        }
        $.ajax({
          type: 'POST',
          url: 'http://localhost:8080/action/' + currIdx,
          cors: true ,
          contentType:'application/json',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*" 
        },
          data: bdy,
          success: function (res) {
            console.log('success response in ack ', res);
            $('#choose_action').modal('hide');
          },
          error: function (err) {
            console.log('error response in ack ', err);
            $('#choose_action').modal('hide');
          }
        })
      });
      $('#open_post_btn').click(function() {
        console.log(789, 'post btn clicked');
        $('#choose_action').modal('hide');
        $('#post_action').modal('show');
      });
      $('#post_message_input_div').empty();
      $('#post_message_input_div').append(
        `<div class="input xp-margin-10">
        <label for="${currIdx}"><pre>Alarm Id: ${currIdx}</pre></label>
        <input id="post_message" type="text" class="form-control" placeholder="write your message here"></div>
        `
      );
      $('#post_message_btn_div').empty();
      $('#post_message_btn_div').append(`
      <button class="btn xp-btn-success xp-right" type="button" id="post_message_btn">Post</button>
      `);
      $('#post_message_btn').click(function() {
        console.log(789, 'post btn clicked');
        $('#post_action').modal('hide');
        let msg = $('#post_message').val();
        let bdy = {
          histMessage: msg
        }
        $.ajax({
          type: 'POST',
          url: 'http://localhost:8080/post/'+ currIdx,
          cors: true ,
          contentType:'application/json',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*" 
        },
          data: bdy,
          success: function (res) {
            console.log('success response in ack ', res);
            $('#post_action').modal('hide');
          },
          error: function (err) {
            console.log('error response in ack ', err);
            $('#post_action').modal('hide');
          }
        })
      });
      });
  }
})();
