function $(s) {
	return document.querySelectorAll(s)
}

function random(m, n) {
	return Math.round(Math.random() * (n - m) + m)
}

(function () {
	var dots = []
	var size = 128
	var line
	var box = $('#box')[0]
	var width, height
	var canvas = document.createElement('canvas')
	var ctx = canvas.getContext('2d')
	var list = $('#music_list li')
	var types = $('#type li')

	var mv = new MusicVisualizer({
		size: size,
		visualizer: draw
	})

	box.appendChild(canvas)

	types.forEach(function (type, index) {
		type.onclick = function () {
			for (let i = 0; i < types.length; i++) {
				types[i].className = ''
			}
			draw.type = this.getAttribute('data-type')
			this.className = 'selected'
		}
	})

	list.forEach((item, index) => {
		item.onclick = function () {
			list.forEach(item => {
				item.className = ''
			})
			this.className = 'selected'
			//load('/music/' + this.title)
			mv.play('/music/' + this.title);
		}
	})

	function getDots() {
		dots = []
		for (let i = 0; i < size; i++) {
			let dot = {
				x: random(0, width),
				y: random(0, height),
				dx: random(1, 4),
				color: 'rgba(' + random(0, 255) + ',' +random(0, 255) + ', ' + random(0, 255) + ', 0.6)',
				cap: 0
			}
			dots.push(dot)
		}
	}

	function resize() {
		height = box.clientHeight
		width = box.clientWidth
		canvas.height = height
		canvas.width = width
		line = ctx.createLinearGradient(0, 0, 0, height)
		line.addColorStop(0, 'red')
		line.addColorStop(0.5, 'yellow')
		line.addColorStop(1, 'green')

		getDots()
	}

	function draw(arr) {
		ctx.clearRect(0, 0, width, height)
		var w = width / size
		var cw = w * 0.8;
		var capH = cw > 10 ? 10 : cw;
		ctx.fillStyle = line
		for (var i = 0; i < size; i++) {
			var o = dots[i]
			if (draw.type === 'column') {
				var h = arr[i] / 256 * height
				ctx.fillRect(w * i, height - h, cw, h)
				ctx.fillRect(w * i, height - (o.cap + capH), cw, capH)

				o.cap--
				if (o.cap < 0) {
					o.cap = 0
				}

				if (h > 0 && o.cap < h + 40) {
					o.cap = h + 40 >= height - capH ? height - capH : h + 40
				}

			} else if (draw.type === 'dots') {
				var r = 10 + arr[i] / 256 * (height > width ? width : height) / 10
				ctx.beginPath()
				ctx.arc(o.x, o.y, r, 0, Math.PI * 2, true)
				var g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r)
				g.addColorStop(0, '#fff')
				g.addColorStop(1, o.color)
				ctx.fillStyle = g
				ctx.fill()
				o.x+=o.dx
				o.x = o.x > width ? 0 : o.x
			}
		}
	}
	draw.type = 'column'

	resize()
	window.onresize = resize


	$('#volume')[0].onchange = function () {
		mv.changeVolume(this.value / this.max)
	}

	$('#volume')[0].onchange()

})()

