PULSE = 400;

window.AudioContext = window.AudioContext ||
  window.webkitAudioContext;

var context = new AudioContext();

var scriptNode = context.createScriptProcessor(1024, 1, 1);
scriptNode.onaudioprocess = process;
scriptNode.connect(context.destination);
phase = 0;

function process(audioProcessingEvent) {
  var inputBuffer = audioProcessingEvent.inputBuffer;
  var outputBuffer = audioProcessingEvent.outputBuffer;

  var outputData = outputBuffer.getChannelData(0);
  for (var sample = 0; sample < outputBuffer.length; sample++) {

    state.t++;
    var samp = 0;
    if (state.lo) samp += 0.25 * Math.sin(2 * 3.1415926535 * 4000 / 44100 * state.t);
    if (state.hi) samp += 0.25 * Math.sin(2 * 3.1415926535 * 7000 / 44100 * state.t);
    outputData[sample] = samp;
    if (state.t % PULSE == 0) {
      state.t = 0;
      if (state.bits.length == 0) {
        if (state.text.length == 0) {
          state.lo = false;
          state.hi = false;
        }
        else {
          var chr = state.text.charCodeAt(0);
          state.text = state.text.substr(1);
          state.bits = state.bits.concat((Math.min(127, chr) + 256).toString(2).substr(1).split(''));

        }
      }
      else {
        var b = state.bits.shift();
        if (b == 0) state.lo = !state.lo;
        if (b == 1) state.hi = !state.hi;
      }
    }
  }
}

state = {
  lo: false,
  hi: false,
  t: 0,
  bits: [],
  text: "",
}

$(function() {
  $("#send").on('click', function() {
    var text = $("#text").val();
    state.text += text + "\n";
    $("#text").val("");
  });
    $("#sendhi").on('click', function() {
    state.text += "hi" + "\n";
  });

});
