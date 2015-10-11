navigator.webkitGetUserMedia(
  {audio:true},
  success_k,
  error_k);


function error_k() {
  console.log("error")
}

gain = 1;
BUFSIZE = 4096;
THRESH = 2;
WINDOW = 64;

function success_k(stream) {
  setInterval(function() {
    d.clearRect(0, 0, w, h);
    d.fillStyle = "black";
    for (var i = 0; i < BUFSIZE; i++) {
      d.fillRect(i * (1024 / BUFSIZE),100+thisbuf[i] * 200, 1, 1);
    }
    for (var i = 0; i < freqs.length; i++) {

      d.fillStyle="black";
      d.fillRect(40 * i, h, 40, globalFrame[i] * -3);
      d.fillStyle = "blue";
      d.fillText(Math.floor(10 * globalFrame[i]) / 10, 40 * i, 20);
    }

  }, 100);


  window.AudioContext = window.AudioContext ||
    window.webkitAudioContext;

  var context = new AudioContext();


  var microphone = context.createMediaStreamSource(stream);
  var scriptNode = context.createScriptProcessor(4096, 1, 1);
  scriptNode.onaudioprocess = process;


  BUFSIZE = scriptNode.bufferSize;



  microphone.connect(scriptNode);
  scriptNode.connect(context.destination);


}

var freqs = [4000,7000];
tally = [];

thisbuf = [];

var bit_buf = "";

var string_buf = "";
debug = "";

function recordBit(bit) {
  debug += bit;

  bit_buf += bit;
  if (bit_buf.length == 8) {
    debug += " ";
    var chr = String.fromCharCode(parseInt(bit_buf, 2));
    console.log("char", chr);
    if (chr == "\n") {
      console.log(string_buf);
      string_buf = "";
    }
    else {
      string_buf += chr;
    }
    bit_buf = "";
  }

  $("#debug").text(debug);

}

curState = {lo: false, hi: false};

function stateMachine(frame) {
  globalFrame = frame;
//  console.log(frame);
  var compare = {lo: frame[0] > THRESH, hi: frame[1] > THRESH};
  if (curState.lo != compare.lo && curState.hi != compare.hi) { // console.log("X");
  }
  else if (curState.lo != compare.lo) recordBit(0);
  else if (curState.hi != compare.hi) recordBit(1);
  curState = compare;
}

// Give the node a function to process audio events
function process(audioProcessingEvent) {
  thisbuf = [];

  // The input buffer is the song we loaded earlier
  var inputBuffer = audioProcessingEvent.inputBuffer;

  // The output buffer contains the samples that will be modified and played
  var outputBuffer = audioProcessingEvent.outputBuffer;
  // Loop through the output channels (in this case there is only one)

  var inputData = inputBuffer.getChannelData(0);
  var outputData = outputBuffer.getChannelData(0);

  for (var i = 0; i < freqs.length; i++) {
    tally[i] = {s:0, c:0};
  }

  var frames = scan(inputData, inputBuffer.length, WINDOW);
  frames.forEach(stateMachine);

  // Loop through the BUFSIZE samples
  for (var sample = 0; sample < inputBuffer.length; sample++) {
    outputData[sample] = gain * inputData[sample];
    thisbuf[sample] = gain * inputData[sample];
  }

}

function scan(buffer, total_len, len) {
  var chunks = total_len / len;
  var output = [];
  var tally = [];
  for (var c = 0; c < chunks; c++) {
    var t = _.times(freqs.length, function(){ return {s:0, c:0} });
    var frame = [];
    output.push(frame);
    for (var sample = 0; sample < len; sample++) {
      var pos = c * len + sample;
      for (var i = 0; i < freqs.length; i++) {
	t[i].s += Math.sin(2 * 3.1415926 * pos * freqs[i] / 44100) * buffer[pos];
	t[i].c += Math.cos(2 * 3.1415926 * pos * freqs[i] / 44100) * buffer[pos];
      }
    }
    for (var i = 0; i < freqs.length; i++) {
      frame[i] = Math.sqrt(t[i].s * t[i].s + t[i].c * t[i].c);
    }
  }
  return output;
}

$(function() {
//console.log("hI");
c = $("#c")[0];
 d = c.getContext('2d');
 w = c.width = 1024;
 h = c.height = 200;
});
