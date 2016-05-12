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
	var prev, next, lastMove, velocity;
	var height = document.body.offsetHeight;

	function touchstart (event) {
		if (scrollStart === null) {
			var touches = event.touches || event.changedTouches;
			scrollStart = ((touches) ? touches[0] : event).clientY;
			height = document.body.offsetHeight;
			slides[currentIndex].style.transition = "none";
			event.preventDefault();
		}
	}

	function touchmove (event) {
		if (scrollStart !== null) {
			var now = new Date();
			scrollPrev = scrollNow;
			var touches = event.touches || event.changedTouches;
			scrollNow = ((touches) ? touches[0] : event).clientY;
			velocity = Math.abs(scrollNow - scrollPrev) / (now - lastMove);
			lastMove = now;
			var offset = ((scrollNow - scrollStart) / height * 100);
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
			event.preventDefault();
		}
	}

	function touchend (event) {
		if (scrollStart !== null) {
			var diffTime = new Date() - lastMove;
			var _velocity = (diffTime) ? (velocity / diffTime) : velocity;
			var fast = (_velocity > 1);
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
			var scrollEnd = scrollNow - scrollStart;
			var scrollEndOffset = Math.abs(scrollEnd / height * 100);
			var mod = (scrollEnd > 0) ? -1 : 1;
			if ((fast && scrollEndOffset > 10) || scrollEndOffset > 25) {
				go(currentIndex + mod);
			}
			scrollNow = 0;
			scrollStart = null;
			lastMove = null;
			event.preventDefault();
		}
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

	window.addEventListener("keydown", keydown);

	container.addEventListener("mousedown", touchstart);
	container.addEventListener("mousemove", touchmove);
	container.addEventListener("mouseup", touchend);

	container.addEventListener("touchstart", touchstart);
	container.addEventListener("touchmove", touchmove);
	container.addEventListener("touchend", touchend);

};