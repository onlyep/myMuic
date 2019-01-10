function $(s) {
	return document.querySelectorAll(s)
}

(function () {
	var list = $('#music_list li')

	//实例化音频对象
	var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext

	if (!AudioContext) {
		alert('您的浏览器不支持audio API，请更换浏览器（chrome、firefox）再尝试')
		return
	}


	list.forEach((item, index) => {
		item.onclick = function () {
			list.forEach(item => {
				item.className = ''
			})
			this.className = 'selected'
			load('/music/' + this.title)
		}
	})

	var xhr = new XMLHttpRequest()
	var AC = new AudioContext()

	var gainNode = AC.createGain()
	gainNode.connect(AC.destination)
	// analyser为analysernode，具有频率的数据，用于创建数据可视化
	var analyser = AC.createAnalyser()
	var size = 128
	analyser.fftSize = size * 2
	analyser.connect(gainNode)

	var box = $('#box')[0]
	var width, height;
	var canvas = document.createElement('canvas')
	var ctx = canvas.getContext('2d')
	box.appendChild(canvas)

	function resize() {
		height = box.clientHeight
		width = box.clientWidth
		canvas.height = height
		canvas.width = width
		var line = ctx.createLinearGradient(0, 0, 0, height)
		line.addColorStop(0, 'red')
		line.addColorStop(0.5, 'yellow')
		line.addColorStop(1, 'green')
		ctx.fillStyle = line
	}
	function draw(arr) {
		ctx.clearRect(0, 0, width, height)
		var w = width / size
		for (var i = 0; i < size; i ++) {
			var h = arr[i] / 256 * height
			ctx.fillRect(w * i, height - h, w * 0.8, h)
		}
	}
	resize()
	window.onresize =  resize

	var source = null
	var count = 0

	visualizer()

	function load(url) {
		var n = ++count
		source && source[source.stop ? "stop" : "noteOff"]()
		xhr.abort()
		xhr.open('get', url)
		xhr.responseType = 'arraybuffer'
		xhr.onload = function () {
			if (n !== count) return
			AC.decodeAudioData(xhr.response)
				.then(function (buffer) {
					if (n !== count) return
					var bufferSource = AC.createBufferSource()
					bufferSource.buffer = buffer
					bufferSource.connect(analyser)
					bufferSource[bufferSource.start ? 'start' : 'noteOn'](0)
					source = bufferSource
				})
				.catch(error => {
					console.log(error)
				})
		}
		xhr.send()
	}

	function visualizer() {
		var dataArray = new Uint8Array(analyser.frequencyBinCount);
		function v() {
			analyser.getByteFrequencyData(dataArray)
			// console.log(dataArray)
			draw(dataArray)
			requestAnimationFrame(v)
		}
		requestAnimationFrame(v)
	}

	$('#volume')[0].onchange = function () {
		changeVolume(this.value / this.max)
	}

	$('#volume')[0].onchange()

	function changeVolume(percent) {
		gainNode.gain.value = percent
	}

})()

