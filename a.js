navigator.webkitGetUserMedia(
  {audio:true},
  success_k,
  error_k);


function error_k() {
  console.log("error")
}

gain = 5;
BUFSIZE = 4096;

function success_k(stream) {
  window.AudioContext = window.AudioContext ||
    window.webkitAudioContext;

  var context = new AudioContext();


  var microphone = context.createMediaStreamSource(stream);
  var scriptNode1 = context.createScriptProcessor(4096, 1, 1);
  scriptNode1.onaudioprocess = process("red", true);

  var scriptNode2 = context.createScriptProcessor(4096, 1, 1);
  scriptNode2.onaudioprocess = process("black", false);

  BUFSIZE = scriptNode1.bufferSize;
  var filter1 = context.createBiquadFilter();
  var filter2 = context.createBiquadFilter();

  filter1.type = "bandpass";
  filter1.frequency.value = 1000;
  filter1.Q.value = 10;

  filter2.type = "bandpass";
  filter2.frequency.value = 2000;
  filter2.Q.value = 10;


  //microphone.connect(filter1);
  filter1.connect(scriptNode1);

  microphone.connect(filter2);
  filter2.connect(scriptNode2);

  scriptNode1.connect(context.destination);
 // scriptNode2.connect(context.destination);

//    microphone.connect(context.destination);

}

bufs = {red: {th: [], last: _.times(BUFSIZE, function(){ return  0})},
	black: {th: [], last: _.times(BUFSIZE, function(){ return  0})}};

// Give the node a function to process audio events
function process(color, audio) {

  return function(audioProcessingEvent) {
  if (color == "black")    console.log("what");
    bufs[color].th = [];
    var thisbuf = bufs[color].th;

    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);

      // Loop through the BUFSIZE samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
	outputData[sample] = gain * inputData[sample];
	thisbuf[sample] = gain * inputData[sample];
      }
    }
    bufs[color].last = thisbuf;
  }
}

$(function() {
console.log("hI");
c = $("#c")[0];
 d = c.getContext('2d');
 w = c.width = 1024;
 h = c.height = 200;
});

setInterval(function() {
  d.clearRect(0, 0, w, h);
  d.fillStyle = "red";
  for (var i = 0; i < BUFSIZE; i++) {
    d.fillRect(i * (1024 / BUFSIZE),100+bufs.red.th[i] * 200, 1, 1);
  }
  d.fillStyle = "black";
  for (var i = 0; i < BUFSIZE; i++) {
    d.fillRect(i * (1024 / BUFSIZE),100+bufs.black.th[i] * 200, 1, 1);
  }

}, 250);
