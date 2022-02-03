// 运行
function run(file) {
	let ingame = document.getElementById('ingame');
	gba.loadRomFromFile(file, function (result) {
		if (result) {
			for (let i = 0; i < runCommands.length; ++i) {
				runCommands[i]();
			}
			runCommands = [];
			ingame.classList.remove("hidden")
			gba.runStable();
		} else {
			alert("获取rom失败,请重试")
		}
	});
}


// 设置canvas
function full() {
	let canvas = document.querySelector("#screen");
	// var content = canvas.getContext("2d")
	// 获取画布父亲的宽度;
	let pad = document.querySelector(".gbaPad")
	let parentWidth = pad.clientWidth
	let parentHeight = pad.clientHeight
	let parentRatio = parentWidth / parentHeight
	let desiredRatio = canvas.width / canvas.height

	// 画板小数<父亲小数
	if (desiredRatio < parentRatio) {
		// PC
		// canvas.setAttribute("width", `${Math.round(parentHeight * desiredRatio)}px`)
		// canvas.setAttribute("height", `${parentHeight}px`)
		canvas.width = window.innerWidth;
		canvas.height = canvas.width * 0.6666;
	} else {
		// 移动端
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
		canvas.setAttribute("width", `${parentWidth}px`)
		if (!!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
			// IOS
			canvas.setAttribute("height", `${parentHeight * 0.6}px`)
		} else {
			// Android
			canvas.setAttribute("height", `${Math.round(parentWidth / desiredRatio)}px`)
		}
	}
	return canvas
}

// 设置像素化
function setPixelated(pixelated) {
	let screen = document.getElementById('screen');
	let context = screen.getContext('2d');
	context.imageSmoothingEnabled = !pixelated;
}



// 点击图片开始加载;
function start() {
	// 先初始化gba必要插件
	try {
		gba = new GameBoyAdvance();
		gba.keypad.eatInput = true;
	} catch (exception) {
		gba = null;
	}
	document.querySelector("#start").style.display = "none"
	if (gba) {
		gba.setCanvas(full());
		gba.logLevel = gba.LOG_ERROR;
		gba.setBios(biosBin);
		// 默认加载rom
		loadRom("http://192.168.10.4:5501/rom/01.gba", run);
		// 默认开启像素化
		setPixelated(true)

		window.onresize = full
	} else {
		alert("文件加载失败,请刷新浏览器")
	}
}


// 按钮按下
function gameDown(code, e) {
	gba.keypad.virtualpadHandler(code, e)
	// console.log(gba.audio.enabled);
	// if (gba.audio.context.state == 'running') {
		gba.audio.context.resume()
		// console.log(111);
	// }
	vibrate()
}

// 按钮松下		
function gameUp(code, e) {
	gba.keypad.virtualpadHandler(code, e)
}


// 移动端振动;
function vibrate() {
	if (gba.rom) {
		if ("vibrate" in navigator || "webkitVibrate" in navigator || "mozVibrate" in navigator || "msVibrate" in navigator) {
			window.navigator.vibrate(100);
		} else {
			console.log("浏览器不支持震动")
		}
	}
}



// 保存存档
function save() {
	let a = gba;
	a.pause();
	console.log('保存');
	window.localforage.setItem("state", Serializer.serialize(a.freeze()), function (err) {
		a.runStable();
	})
}

// 加载存档
function load() {
	let a = gba;
	console.log('jiaz');
	window.localforage.getItem("state", function (err, value) {
		if (err) {
			console.log("bux");
		} else {
			Serializer.deserialize(value, function (out) {
				a.pause();
				console.log(out);
				a.defrost(out);
				a.runStable();
			});
		}
	})
}


// PC端暂停
function togglePause() {
	let e = document.getElementById('pause');
	document.body.addEventListener('touchend', resume, false);
	document.body.addEventListener('keydown', resume, false);
	if (gba.paused) {
		gba.runStable();
		e.textContent = '暂停';
	} else {
		gba.pause();
		e.textContent = '取消暂停';
	}
}

// PC端全屏事件
document.addEventListener(
	'webkitfullscreenchange',
	function () {
		let canvas = document.getElementById('screen');
		if (document.webkitIsFullScreen) {
			canvas.setAttribute(
				'height',
				document.body.offsetHeight
			);
			canvas.setAttribute(
				'width',
				(document.body.offsetHeight / 2) * 3
			);
			canvas.setAttribute('style', 'margin: 0');
		} else {
			canvas.setAttribute('height', 320);
			canvas.setAttribute('width', 480);
			canvas.removeAttribute('style');
		}
	},
	false
);

const fullScreen = () => {
	document.getElementById('screen').requestFullscreen();
};



function resume() {
	gba.audio.context.resume();
	setTimeout(function () {
		if (gba.audio.context.state === "running") {
			document.body.removeEventListener('touchend', resume, false);
			document.body.removeEventListener('keydown', resume, false);
		}
	}, 500);
}