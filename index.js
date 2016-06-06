module.exports = function (container, options) {
	var slides = container.children[0];
	var count = slides.children.length;
	var currentIndex = 0;

	function go (index) {
		//window.console && console.log("go", index, currentIndex);
		if (index < 0) {
			index = 0;
		}
		else if (index > count -1) {
			index = count - 1;
		}
		currentIndex = index;
		updateOffset(0);
	}

	var scrollStart = null;
	var scrollNow = 0;
	var scrollPrev;
	var timePrev, velocity;
	var height = container.offsetHeight;

	function touchstart (event) {
		if (scrollStart === null) {
			var touches = event.touches || event.changedTouches;
			scrollStart = ((touches) ? touches[0] : event).clientY;
			scrollNow = scrollStart;
			timePrev = new Date();
			height = container.offsetHeight;
			disableTransition();
			event.preventDefault();
		}
	}

	function touchmove (event) {
		if (scrollStart !== null) {
			var timeNow = new Date();
			scrollPrev = scrollNow;
			var touches = event.touches || event.changedTouches;
			scrollNow = ((touches) ? touches[0] : event).clientY;
			velocity = Math.abs(scrollNow - scrollPrev) / (timeNow - timePrev);
			timePrev = timeNow;
			var offset = ((scrollNow - scrollStart) / height * 100);
			updateOffset(offset);
			event.preventDefault();
		}
	}

	function touchend (event) {
		if (scrollStart !== null) {
			var diffTime = new Date() - timePrev;
			var _velocity = (diffTime) ? (velocity / diffTime) : velocity;
			var fast = (_velocity > 0.5);
			var scrollEndOffset = (scrollNow - scrollStart) / height * 100;
			enableTransition();
			snapOffset(scrollEndOffset, fast);
			scrollStart = null;
			event.preventDefault();
		}
	}

	function disableTransition () {
		slides.style.transition = "none";
	}

	function enableTransition () {
		slides.style.transition = "";
	}

	function updateOffset (offset) {
		//window.console && console.log("updateOffset", offset, currentIndex * -100 + offset);
		slides.style.transform = "translate3d(0, " + (currentIndex * -100 + offset) + "%, 0)";
	}

	function snapOffset (offset, fast) {
		var modifier = 0;
		var direction = (offset > 0) ? -1 : 1;
		offset = Math.abs(offset);
		if (fast && offset % 100 > 10) {
			modifier = direction * Math.ceil(offset / 100);
		}
		else {
			modifier = direction * Math.round(offset / 100);
		}
		window.console && console.log("snapOffset", direction, offset, modifier);

		go(currentIndex + modifier);
	}

	var timer, interval = 100;
	var offsetY;
	var lastY;
	var velocities = [];
	var scrolling;
	var incremental;

	function timeout () {
		//scrolling = false;
		timePrev = null;
		velocity = 0;
		timer = clearTimeout(timer);
		enableTransition();
		snapOffset(offsetY / height * 100);
		//window.console && console.log("wheel end", incremental)
		//window.console && console.table(velocities);
		//velocities = [];
		lastY = 0;
		incremental = false;
	}

	function wheel (event) {
		var timeNow = new Date();
		var y = "wheelDelta" in event ? event.wheelDelta : event.deltaY;
		if (event.webkitDirectionInvertedFromDevice) {
			y = -y;
		}
		if (timer) {
			/*
			if (velocities.length === 0 && Math.abs(lastY) > 4 && Math.abs(lastY * 10 - y) > 0) {
				//incremental = true;
			}
			if (incremental) {
				var _y = y;
				y -= (lastY > 0) ? lastY : -lastY;
				lastY = _y;
			}
			else {
				*/
				lastY = y;
			//}
			offsetY += y;
			/*
			velocity = (y) ? y / (timeNow - timePrev) : 0;
			velocities.push([y, timeNow - timePrev, velocity]);
			window.console && console.log("wheel", event);
			*/
		}
		else {
			offsetY = y;
			height = container.offsetHeight;
			disableTransition();
			//velocities = [];
			//window.console && console.log("wheel start", y, event.deltaMode);
		}
		updateOffset(offsetY / height * 100);
		timePrev = timeNow;
		clearTimeout(timer);
		timer = setTimeout(timeout, interval);
	}

	function keydown (event) {
		var mod = 1;
		switch (event.keyCode) {
			case 38:
				mod = -1;
			case 40:
				go(currentIndex + mod);
				event.preventDefault();
				break;
		}
	}

	container.addEventListener("wheel", wheel);

	window.addEventListener("keydown", keydown);

	container.addEventListener("mousedown", touchstart);
	container.addEventListener("mousemove", touchmove);
	container.addEventListener("mouseup", touchend);

	container.addEventListener("touchstart", touchstart);
	container.addEventListener("touchmove", touchmove);
	container.addEventListener("touchend", touchend);

};