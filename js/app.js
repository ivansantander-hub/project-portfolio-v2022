$( "#model-viewer" ).click(function() {
    $("#model-viewer").attr("camera-controls","true");
    // clickModel();
});

$( "#model-viewer-2" ).click(function() {
    $("#model-viewer-2").attr("camera-controls","true");
    // clickModel();
});

$( "#model-viewer-3" ).click(function() {
    $("#model-viewer-3").attr("camera-controls","true");
    // clickModel();
});

$( "#model-viewer-4" ).click(function() {
    $("#model-viewer-4").attr("camera-controls","true");
    // clickModel();
});

timeBlackScreen = setTimeout(blackScreen, 4000);

function blackScreen(){
    $(".black-screen").removeClass("black-index")
    clearTimeout(timeBlackScreen);
}

// function clickModel(){
//     console.log("clickModel")
//     $(".black-screen").addClass("opacity-model-viewer")
//     timeClickModel = setTimeout(opacityModel, 300);
// }

// function opacityModel (){
//     console.log("opacityModel")
//     $(".black-screen").removeClass("opacity-model-viewer")
// }