module.exports = function (container) {
	var slides = container.children;
	var currentIndex = 0;

	function go (index) {
		if (index !== currentIndex && index > -1 && index < slides.length) {
			slides[currentIndex].className = "slide";
			slides[index].className = "slide selected";
			currentIndex = index;
		}
	}

	var scrollStart = null;
	var scrollNow = 0;
	var scrollPrev;
	var prev, next, timePrev, velocity;
	var height = container.offsetHeight;
	
	

	function touchstart (event) {
		if (scrollStart === null) {
			var touches = event.touches || event.changedTouches;
			scrollStart = ((touches) ? touches[0] : event).clientY;
			scrollNow = scrollStart;
			timePrev = new Date();
			height = container.offsetHeight;
			slides[currentIndex].style.transition = "none";
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
			var fast = (_velocity > 1);
			resetOffset();
			var scrollEndOffset = (scrollNow - scrollStart) / height * 100;
			snapOffset(scrollEndOffset, fast);
			scrollStart = null;
			event.preventDefault();
		}
	}
	
	function updateOffset (offset) {
		if (offset < 0) {
			if (currentIndex < slides.length - 1) {
				if (!next) {
					next = slides[currentIndex + 1];
					next.style.transition = "none";
				}
			}
		}
		else {
			if (currentIndex > 0) {
				if (!prev) {
					prev = slides[currentIndex - 1];
					prev.style.transition = "none";
				}
			}
		}
		slides[currentIndex].style.transform = "translate3d(0, " + offset + "%, 0)";
		if (next) {
			next.style.transform = "translate3d(0, " + (offset + 100) + "%, 0)";
		}
		if (prev) {
			prev.style.transform = "translate3d(0, " + (offset - 100) + "%, 0)";
		}
	}
	
	function snapOffset (offset, fast) {
		var direction = (offset > 0) ? -1 : 1;
		offset = Math.abs(offset);
		if ((fast && offset > 10) || offset > 25) {
			go(currentIndex + direction);
		}
	}
	
	function resetOffset () {
		slides[currentIndex].style.transition = "";
		slides[currentIndex].style.transform = "";
		if (prev) {
			prev.style.transition = "";
			prev.style.transform = "";
			prev = null;
		}
		if (next) {
			next.style.transition = "";
			next.style.transform = "";
			next = null;
		}
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
		resetOffset();
		snapOffset(offsetY);
		window.console && console.log("wheel end", incremental)
		window.console && console.table(velocities);
		velocities = [];
		lastY = 0;
		incremental = false;
	}

	function wheel (event) {
		var timeNow = new Date();
		var y = event.deltaY;
		if (timer) {
			if (velocities.length === 0 && Math.abs(lastY) > 4 && Math.abs(lastY * 10 - y) > 0) {
				incremental = true;
			}
			if (incremental) {
				var _y = y;
				y -= (lastY > 0) ? lastY : -lastY;
				lastY = _y;
			}
			else {
				lastY = y;
			}
			offsetY += y;
			velocity = (y) ? y / (timeNow - timePrev) : 0;
			velocities.push([y, timeNow - timePrev, velocity]);
		}
		else {
			offsetY = y;
			height = container.offsetHeight;
			velocities = [];
			window.console && console.log("wheel start", y, event.deltaMode);
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