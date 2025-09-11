const app = new window.webex.Application();
var sidebar;
var callerId = "";
var newCallerId = "";
var showLogs = false;
var companyNumbers = ["+32220617", "+32497495562"];

app.onReady().then(() =>  {
  log("onReady()", { message: "EA is ready." });
    
  app.listen().then(() => {
    app.on("sidebar:callStateChanged", (call) => {
      log("Call state changed. Call object:", call);
      handleCallStateChange(call);
    });
  });
})

function togglePopupButton() {
  let event = new CustomEvent("showpopupbutton", {});
  window.dispatchEvent(event);
  log("Event dispatch to show button", "");
 
}

function toggleLogs() {
  showLogs = !showLogs;
  let event = new CustomEvent("switchlogs", {});
  window.dispatchEvent(event);

}

function openPopUp()
{
  app.openUrlInSystemBrowser("https://acconsultant-help.freshdesk.com/a/search/customers?term="+callerId).catch((errorcode) => {
          log("Error: ", window.Webex.Application.ErrorCodes[errorcode]);
        });
}

function isCompanyNumber(callingNumber)
{  
    if(callingNumber.length == 5)
    {
      log("Company number found (internal extension)");
      return true;
    }
  
  return !companyNumbers.every((number) => {
    if(callingNumber.startsWith(number))
    {
      log("Company number found");
      return false;
    }
    return true;
  });
}

// Utility function to log app messages
function log(type, data) {
  if(showLogs)
    {
    var ul = document.getElementById("console");
    var li = document.createElement("li");
    var payload = document.createTextNode(`${type}: ${JSON.stringify(data)}`);
    li.appendChild(payload)
    ul.append(li);
    }
}



function handleCallStateChange(call) {
  log("handleCallStateChange", "Starting function...");
  switch (call.state) {
    case "Started":
      log("A call has come in...");
     
      break;
    case "Connected":
      log("Call is connected.");
      
      // For all calls, log the information...
      log("*** CALL INFORMATION ***")
      log("- Caller ID: ", call.id);
      log("- Call type: ", call.callType);
      log("- Call state: ", call.state);
      log("- Local Participant: ", call.localParticipant.callerID);
      log("- Remote Participants list: ", call.remoteParticipants[0].callerID);
	    
      callerId = call.remoteParticipants[0].callerID;

      togglePopupButton();
      
      if(call.callType == "Received" && !isCompanyNumber(callerId) && (newCallerId == "" || newCallerId != callerId)) 
	    {
		    newCallerId = callerId;
        log("Will open the webpage in the system browser to https://acconsultant-help.freshdesk.com/a/search/customers?term="+call.remoteParticipants[0].callerID);
        openPopUp();
      }
      
      break;
    case "Ended":
      togglePopupButton();
      log("Call is ended.");
      break;
    default:
      break;
  }
}

