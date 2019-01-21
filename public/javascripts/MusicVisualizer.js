function MusicVisualizer(obj) {
	this.source = null;

	this.count = 0;
	this.analyser = MusicVisualizer.ac.createAnalyser();
	this.size = obj.size;
	this.analyser.fftSize = this.size * 2;

	this.gainNode = MusicVisualizer.ac[MusicVisualizer.ac.createGain ? 'createGain' : 'createGainNode']();
	this.gainNode.connect(MusicVisualizer.ac.destination);
	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();

	this.visualizer = obj.visualizer;

	this.visualize();

}

MusicVisualizer.ac = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)

MusicVisualizer.prototype.load =  function(url, callback) {
	this.xhr.abort();
	this.xhr.open('GET', url);
	this.xhr.responseType = 'arraybuffer';
	var self = this;
	this.xhr.onload = function () {
		callback(self.xhr.response);
	}
	this.xhr.send();
}

MusicVisualizer.prototype.decode = function(arraybuffer, callback) {
	MusicVisualizer.ac.decodeAudioData(arraybuffer, function (buff) {
		callback(buff);
	}, function (err) {
		console.log(err);
	});
}

MusicVisualizer.prototype.play = function (url) {
	var n = ++this.count;
	var self = this;
	this.source && this.stop();
	this.load(url, function (arraybuffer) {
		if(n !== self.count) return;
		self.decode(arraybuffer, function (buffer) {
			if(n !== self.count) return;
			var bs = MusicVisualizer.ac.createBufferSource();
			bs.connect(self.analyser);
			bs.buffer = buffer;
			bs[bs.buffer ? 'start' : 'noteOn'](0);
			self.source = bs;
		});
	})
}

MusicVisualizer.prototype.stop = function () {
	this.source[this.source.stop ? 'stop' : 'noteOff'](0);
}

MusicVisualizer.prototype.changeVolume = function (percent) {
	this.gainNode.gain.value = percent * percent;
}

MusicVisualizer.prototype.visualize = function () {
	var arr = new Uint8Array(this.analyser.frequencyBinCount)

	requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame||
		window.mozRequestAnimationFrame;

	var self = this;
	function v() {
		self.analyser.getByteFrequencyData(arr)
		// console.log(dataArray)
		self.visualizer(arr);
		requestAnimationFrame(v);
	}

	requestAnimationFrame(v)
}
