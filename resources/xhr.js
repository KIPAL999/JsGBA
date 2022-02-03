function loadRom(url, callback) {
	var xhr = new XMLHttpRequest();
	const sp= document.querySelector("#speed")
	xhr.open('GET', url);
	// 监听进度条事件;
	xhr.addEventListener('progress', e=> {
		// console.log(e.lengthComputable);
		if(e.lengthComputable) {
			let speed= ((e.loaded/e.total)*100).toFixed(2);
			sp.innerHTML='下载中:'+speed+"%"
		}
	},false)
	// xhr.responseType = 'arraybuffer';
	xhr.responseType = 'blob';
	xhr.onload = function () { 
		callback(xhr.response)
		// 加载完成之后隐藏p
		sp.style.display='none' 
		joystick.init()
	 };
	xhr.send();
}