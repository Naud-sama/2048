var scoreLabel = document.getElementById('score');
var bestLabel = document.getElementById('best');
var score = 0;
bestLabel.innerHTML = 'MEILLEUR<br>' + localStorage.getItem('best');
(function ($) {
	var defaults = {
		delay: 150
	};
	$.fn.init2048 = function (_options) {
		var _this = this,
		options = $.extend(defaults, _options),
		dir = {
			up: 'up',
			right: 'right',
			down: 'down',
			left: 'left'
		},
		holder = {},
		content = {},
		matrix = [],
		boxes = [],
		isGameOver = false;
		resetGame();
		bind();
		function resetGame() {
			boxes = [];
			matrix = [];
			isGameOver = false;
			holder = $('<div>').addClass('holder2048');
			content = $('<div>').addClass('container').appendTo(holder);
			for (var i = 0; i < 4; i++) {
				for (var j = 0; j < 4; j++) {
					matrix[i * 4 + j] = {
						top: i * 70,
						left: j * 70,
						taken: false,
						combined: false,
						value: 0
					};
					$('<div>').addClass('mask').css({
						left: j * 70 + "px",
						top: i * 70 + "px"
					}).appendTo(content);
				}
			}
			createBox();
			createBox();
			_this.html(holder);
		}
		function createBox(value) {
			var emptyMatrix = 0;
			for (var i = 0; i < matrix.length; i++) {
				if (!matrix[i].taken) {
					emptyMatrix++;
				}
			}
			if (emptyMatrix === 0) {
				return;
			}
			var random = Math.floor(Math.random() * emptyMatrix + 1);
			var chosenIndex = 0;
			for (var j = 0; chosenIndex < matrix.length; chosenIndex++) {
				while (matrix[chosenIndex].taken) {
					chosenIndex++;
				}
				if (++j === random) {
					matrix[chosenIndex].taken = true;
					break;
				}
			}
			value = value ? value : (Math.floor(Math.random() * 4 + 1) === 4 ? 4 : 2); //Use the value parse in or (1/4 -> 4 or  3/4 -> 2)
			var newBox = $('<div>').addClass('box').attr({
				position: chosenIndex,
				value: value
			}).css({
				marginTop: matrix[chosenIndex].top + 2,
				marginLeft: matrix[chosenIndex].left + 2,
				opacity: 0
			}).text(value).appendTo(content).animate({
				opacity: 1
			}, options.delay * 2);
			boxes.push(newBox);
		}
		function combineBox(source, target, value) {
			var _value = parseInt(value) * 2;
			score += _value;
			scoreLabel.innerHTML = 'SCORE<br>' + score;
			if (localStorage.getItem('best') < score)
			{
				localStorage.setItem('best', score);
				bestLabel.innerHTML = 'MEILLEUR<br>' + localStorage.getItem('best');
			}
			boxes[target].attr('value', _value).html(_value).css({
				zIndex: 99
			}).animate({
				width: '+=20',
				height: '+=20',
				marginTop: '-=10',
				marginLeft: '-=10'
			}, options.delay / 2, function () {
				$(this).animate({
					width: '-=20',
					height: '-=20',
					marginTop: '+=10',
					marginLeft: '+=10'
				}, options.delay / 2, function () {
					$(this).css({
						zIndex: 1
					})
				})
			});
			boxes[source].remove();
			boxes.splice(source, 1);
		}
		function gameOver() {
			if (boxes.length != 16) {
				return false;
			}
			var i, a, b;
			for (i = 0; i < 16; i++) {
				for (a = 0; a < 16; a++) {
					if (boxes[a].attr('position') == i)
						break;
				}
				if (i % 4 != 3) {
					for (b = 0; b < 16; b++) {
						if (boxes[b].attr('position') == i + 1)
							break;
					}
					if (boxes[a].attr('value') == boxes[b].attr('value'))
						return false;
				}
				if (i < 12) {
					for (b = 0; b < 16; b++) {
						if (boxes[b].attr('position') == i + 4)
							break;
					}
					if (boxes[a].attr('value') == boxes[b].attr('value'))
						return false;
				}
			}
			return true;
		}
		function gameRun(dir) {
			if (isGameOver) {

				return;
			}
			if (run(dir)) {
				createBox();
			}
			if (gameOver()) {
				isGameOver = true;
				alert("Reviens avec du skill.");
			}
		}
		function bind() {
			$(window).keydown(function (event) {
				if (!isGameOver) {
					if (event.which == 37) {
						event.preventDefault();
						gameRun(dir.left);
					} else if (event.which == 38) {
						event.preventDefault();
						gameRun(dir.up);
					} else if (event.which == 39) {
						event.preventDefault();
						gameRun(dir.right);
					} else if (event.which == 40) {
						event.preventDefault();
						gameRun(dir.down);
					} else if (event.which == 82) {
						window.location.reload();
					} else if (event.which == document.getElementById('gauche').onclick) {
						event.preventDefault();
						gameRun(dir.left);
					} else if (event.which == 82) {
						event.preventDefault();
						gameRun(dir.up);
					} else if (event.which == 82) {
						event.preventDefault();
						gameRun(dir.right);
					} else if (event.which == 82) {
						event.preventDefault();
						gameRun(dir.down);
					}
				}
			});
			var touchStartClientX, touchStartClientY;
			document.addEventListener("touchstart", function (event) {
				if (event.touches.length > 1)
					return;
				touchStartClientX = event.touches[0].clientX;
				touchStartClientY = event.touches[0].clientY;
			});
			document.addEventListener("touchmove", function (event) {
				event.preventDefault();
			});
			document.addEventListener("touchend", function (event) {
				if (event.touches.length > 0)
					return;
				var dx = event.changedTouches[0].clientX - touchStartClientX;
				var absDx = Math.abs(dx);
				var dy = event.changedTouches[0].clientY - touchStartClientY;
				var absDy = Math.abs(dy);
				if (Math.max(absDx, absDy) > 10) {
					if (absDx > absDy) {
						if (dx > 0) {
							gameRun(dir.right);
						} else {
							gameRun(dir.left);
						}
					} else {
						if (dy > 0) {
							gameRun(dir.down);
						} else {
							gameRun(dir.up);
						}
					}
				}
			});
		}
		function run(dir) {
			var isMoved = false;
			var i, j, k, empty, _empty, position, value1, value2, temp;
			for (i = 0; i < 16; i++) {
				matrix[i].combined = false;
			}
			if (dir == "left") {
				for (i = 0; i < 4; i++) {
					empty = i * 4;
					_empty = empty;
					for (j = 0; j < 4; j++) {
						position = i * 4 + j;
						if (!matrix[position].taken) {
							continue;
						}
						if (matrix[position].taken && position === empty) {
							empty++;
							if (empty - 2 >= _empty) {
								for (k = 0; k < boxes.length; k++) {
									if (boxes[k].attr("position") == position) {
										break;
									}
								}
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty - 2) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty - 2].combined) {
									combineBox(k, temp, value1);
									matrix[empty - 1].taken = false;
									matrix[empty - 2].combined = true;
									empty--;
									isMoved = true;
								}
							}
						} else {
							for (k = 0; k < boxes.length; k++) {
								if (boxes[k].attr("position") == position) {
									break;
								}
							}
							boxes[k].animate({
								marginLeft: matrix[empty].left + 2,
								marginTop: matrix[empty].top + 2
							}, options.delay);
							boxes[k].attr('position', empty);
							matrix[empty].taken = true;
							matrix[position].taken = false;
							empty++;
							isMoved = true;
							if (empty - 2 >= _empty) {
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty - 2) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty - 2].combined) {
									combineBox(k, temp, value1);
									matrix[empty - 1].taken = false;
									matrix[empty - 2].combined = true;
									empty--;
								}
							}
						}
					}
				}
			} else if (dir == "right") {
				for (i = 3; i > -1; i--) {
					empty = i * 4 + 3;
					_empty = empty;
					for (j = 3; j > -1; j--) {
						position = i * 4 + j;
						if (!matrix[position].taken) {
							continue;
						}
						if (matrix[position].taken && position === empty) {
							empty--;
							if (empty + 2 <= _empty) {
								for (k = 0; k < boxes.length; k++) {
									if (boxes[k].attr("position") == position) {
										break;
									}
								}
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty + 2) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty + 2].combined) {
									combineBox(k, temp, value1);
									matrix[empty + 1].taken = false;
									matrix[empty + 2].combined = true;
									empty++;
									isMoved = true;
								}
							}
						} else {
							for (k = 0; k < boxes.length; k++) {
								if (boxes[k].attr("position") == position) {
									break;
								}
							}
							boxes[k].animate({
								marginLeft: matrix[empty].left + 2,
								marginTop: matrix[empty].top + 2
							}, options.delay);
							boxes[k].attr('position', empty);
							matrix[empty].taken = true;
							matrix[position].taken = false;
							empty--;
							isMoved = true;
							if (empty + 2 <= _empty) {
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty + 2) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty + 2].combined) {
									combineBox(k, temp, value1);
									matrix[empty + 1].taken = false;
									matrix[empty + 2].combined = true;
									empty++;
								}
							}
						}
					}
				}
			} else if (dir == "up") {
				for (i = 0; i < 4; i++) {
					empty = i;
					_empty = empty;
					for (j = 0; j < 4; j++) {
						position = j * 4 + i;
						if (!matrix[position].taken) {
							continue;
						}
						if (matrix[position].taken && position === empty) {
							empty += 4;
							if (empty - 8 >= _empty) {
								for (k = 0; k < boxes.length; k++) {
									if (boxes[k].attr("position") == position) {
										break;
									}
								}
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty - 8) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty - 8].combined) {
									combineBox(k, temp, value1);
									matrix[empty - 4].taken = false;
									matrix[empty - 8].combined = true;
									empty -= 4;
									isMoved = true;
								}
							}
						} else {
							for (k = 0; k < boxes.length; k++) {
								if (boxes[k].attr("position") == position) {
									break;
								}
							}
							boxes[k].animate({
								marginLeft: matrix[empty].left + 2,
								marginTop: matrix[empty].top + 2
							}, options.delay);
							boxes[k].attr('position', empty);
							matrix[empty].taken = true;
							matrix[position].taken = false;
							empty += 4;
							isMoved = true;
							if (empty - 8 >= _empty) {
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty - 8) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty - 8].combined) {
									combineBox(k, temp, value1);
									matrix[empty - 4].taken = false;
									matrix[empty - 8].combined = true;
									empty -= 4;
								}
							}
						}
					}
				}
			} else if (dir == "down") {
				for (i = 0; i < 4; i++) {
					empty = i + 12;
					_empty = empty;
					for (j = 3; j > -1; j--) {
						position = j * 4 + i;
						if (!matrix[position].taken) {
							continue;
						}
						if (matrix[position].taken && position === empty) {
							empty -= 4;
							if (empty + 8 <= _empty) {
								for (k = 0; k < boxes.length; k++) {
									if (boxes[k].attr("position") == position) {
										break;
									}
								}
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty + 8) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty + 8].combined) {
									combineBox(k, temp, value1);
									matrix[empty + 4].taken = false;
									matrix[empty + 8].combined = true;
									empty += 4;
									isMoved = true;
								}
							}
						} else {
							for (k = 0; k < boxes.length; k++) {
								if (boxes[k].attr("position") == position) {
									break;
								}
							}
							boxes[k].animate({
								marginLeft: matrix[empty].left + 2,
								marginTop: matrix[empty].top + 2
							}, options.delay);
							boxes[k].attr('position', empty);
							matrix[empty].taken = true;
							matrix[position].taken = false;
							empty -= 4;
							isMoved = true;
							if (empty + 8 <= _empty) {
								value1 = boxes[k].attr('value');
								for (temp = 0; temp < boxes.length; temp++) {
									if (boxes[temp].attr("position") == empty + 8) {
										break;
									}
								}
								value2 = boxes[temp].attr('value');
								if (value1 == value2 && !matrix[empty + 8].combined) {
									combineBox(k, temp, value1);
									matrix[empty + 4].taken = false;
									matrix[empty + 8].combined = true;
									empty += 4;
								}
							}
						}
					}
				}
			}
			return isMoved;
		}
	}
})(jQuery);